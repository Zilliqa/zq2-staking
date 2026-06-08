// ABOUTME: Recover the wallet addresses currently delegating to a non-liquid staking pool
// ABOUTME: Enumerates the contract's tx history (Otterscan ots_ index) then reads per-wallet getDelegatedAmount
import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { readContract } from "viem/actions"
import { Address, formatUnits } from "viem"
import { getViemClient } from "@/misc/chainConfig"
import { nonLiquidDelegatorAbi } from "@/misc/stakingAbis"

interface Args {
  network_id: string
  contract_address: string
  page_size: number
  max_pages: number
}

interface OtterscanTx {
  from?: string
  hash?: string
  blockNumber: string
}

interface OtterscanSearchResult {
  txs: OtterscanTx[]
  lastPage: boolean
}

const argv = yargs(hideBin(process.argv))
  .option("network_id", {
    type: "string",
    description:
      "Chain id of the network (must be defined in chainConfig.ts), e.g. 32769 for mainnet",
    demandOption: true,
  })
  .option("contract_address", {
    type: "string",
    description: "The non-liquid delegator (pool) contract address in hex",
    demandOption: true,
  })
  .option("page_size", {
    type: "number",
    description: "Otterscan page size (api.zilliqa.com caps eth_getLogs at 50)",
    default: 50,
  })
  .option("max_pages", {
    type: "number",
    description: "Safety cap on how many history pages to walk",
    default: 50,
  })
  .help()
  .alias("help", "h").argv as Args

/**
 * Recover delegators of a NON-LIQUID pool.
 *
 * Why this works: per-delegator data is not directly enumerable, and
 * api.zilliqa.com throttles `eth_getLogs` to 50 blocks. But the RPC exposes the
 * Otterscan index (`ots_*`), so we list every tx that ever touched the contract,
 * collect the unique senders, then ask the contract `getDelegatedAmount()` from
 * each (msg.sender = that wallet). Whoever still has a non-zero amount is a
 * current delegator. The sum should equal `getDelegatedTotal()`.
 *
 * NOTE: liquid pools are different. There the "delegator" holds the liquid
 * staking token (an ERC-20), so you would enumerate token holders instead.
 */
;(async () => {
  const chainId = parseInt(argv.network_id)
  const pool = argv.contract_address as Address
  const client = getViemClient(chainId)

  // viem's typed request only knows standard methods; widen it for ots_*.
  const rpcRequest = client.request as unknown as <T = unknown>(args: {
    method: string
    params: unknown[]
  }) => Promise<T>

  console.log(`Recovering delegators for ${pool} on chain ${chainId}...`)

  const senders = new Set<string>()
  const seenTx = new Set<string>()
  let cursor = 0 // 0 = start from the latest block

  for (let page = 0; page < argv.max_pages; page++) {
    const result = await rpcRequest<OtterscanSearchResult>({
      method: "ots_searchTransactionsBefore",
      params: [pool, cursor, argv.page_size],
    })
    const txs = result?.txs ?? []
    if (txs.length === 0) break

    let oldestBlock = Number.POSITIVE_INFINITY
    for (const tx of txs) {
      if (tx.hash && !seenTx.has(tx.hash)) {
        seenTx.add(tx.hash)
        if (tx.from) senders.add(tx.from.toLowerCase())
      }
      const blockNumber = parseInt(tx.blockNumber, 16)
      if (blockNumber < oldestBlock) oldestBlock = blockNumber
    }
    console.log(
      `  page ${page}: ${txs.length} txs, ${senders.size} unique senders (lastPage=${result.lastPage})`
    )
    if (result.lastPage || !Number.isFinite(oldestBlock)) break
    cursor = oldestBlock
  }

  const holders: Array<{ address: string; amount: bigint }> = []
  for (const address of senders) {
    const amount = await readContract(client, {
      address: pool,
      abi: nonLiquidDelegatorAbi,
      functionName: "getDelegatedAmount",
      account: address as Address,
    })
    if (amount > 0n) holders.push({ address, amount })
  }

  holders.sort((a, b) => {
    if (a.amount === b.amount) return 0
    return b.amount > a.amount ? 1 : -1
  })

  console.log(`\nCurrent delegators (${holders.length}):`)
  for (const holder of holders) {
    console.log(`  ${holder.address}  ${formatUnits(holder.amount, 18)} ZIL`)
  }

  const total = await readContract(client, {
    address: pool,
    abi: nonLiquidDelegatorAbi,
    functionName: "getDelegatedTotal",
  })
  const sum = holders.reduce((acc, holder) => acc + holder.amount, 0n)
  console.log(`\nSum of recovered holders: ${formatUnits(sum, 18)} ZIL`)
  console.log(`getDelegatedTotal:        ${formatUnits(total, 18)} ZIL`)
  if (sum !== total) {
    console.log(
      "\nWARNING: sum != total. Some delegators may be missing (history pagination / RPC limits). Widen --max_pages or cross-check on Otterscan."
    )
  }
})()
