import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { readContract } from "viem/actions"
import { delegatorAbi } from "@/misc/stakingAbis"
import { Address, erc20Abi } from "viem"
import { getViemClient } from "@/misc/chainConfig"
import {
  StakingPoolDefinition,
  StakingPoolType,
} from "@/misc/stakingPoolsConfig"

interface Args {
  network_id: string
  contract_address: string
  icon_url: string
  name: string
  type: StakingPoolType
}

const argv = yargs(hideBin(process.argv))
  .option("network_id", {
    type: "string",
    description:
      "The network id of the network to connect to. It must be defined in chainConfig.ts",
    demandOption: true,
  })
  .option("contract_address", {
    type: "string",
    description: "The contract address in hex format",
    demandOption: true,
  })
  .option("icon_url", {
    type: "string",
    description: "The icon url of the pool",
    demandOption: true,
  })
  .option("name", {
    type: "string",
    description: "The name of the pool",
    demandOption: true,
  })
  .option("type", {
    type: "string",
    description: "The type of the pool",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv as Args

;(async () => {
  console.log(`Network RPC URL: ${argv.network_id}`)
  console.log(`Contract Address: ${argv.contract_address}`)

  const chainid = parseInt(argv.network_id)

  const readDelegatorContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(getViemClient(chainid), {
      address: argv.contract_address as Address,
      abi: delegatorAbi,
      functionName,
    })) as T
  }

  const [tokenAddress] = await Promise.all([
    readDelegatorContract<Address>("getLST"),
  ])

  const readTokenContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(getViemClient(chainid), {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    })) as T
  }

  const [tokenDecimals, tokenSymbol, minimumStake] = await Promise.all([
    readTokenContract<number>("decimals"),
    readTokenContract<string>("symbol"),
    readDelegatorContract<bigint>("getMinDelegation"),
  ])

  const hash = Buffer.from(argv.contract_address + tokenAddress)
    .toString("base64")
    .slice(0, 8)
  const twoWeeksInMinutes = 60 * 24 * 14

  const definition: StakingPoolDefinition = {
    id: hash,
    address: argv.contract_address,
    tokenAddress,
    iconUrl: argv.icon_url,
    name: argv.name,
    poolType: argv.type,
    tokenDecimals,
    tokenSymbol,
    minimumStake: minimumStake as bigint,
    withdrawPeriodInMinutes: twoWeeksInMinutes,
  }

  console.log("Add following definition to stakingPoolsConfig.ts")
  console.log({ definition })
})()
