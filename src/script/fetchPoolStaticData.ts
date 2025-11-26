import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { readContract } from "viem/actions"
import { liquidDelegatorAbi, nonLiquidDelegatorAbi } from "@/misc/stakingAbis"
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

async function readLiquidDelegator(
  poolDefinitionId: string,
  poolName: string,
  poolIconPublicPath: string,
  chainid: number,
  contractAddress: Address
): Promise<StakingPoolDefinition> {
  const viemClient = getViemClient(chainid)

  const [tokenAddress] = await Promise.all([
    readContract(viemClient, {
      address: contractAddress,
      abi: liquidDelegatorAbi,
      functionName: "getLST",
    }),
  ])

  const [tokenDecimals, tokenSymbol, minimumStake] = await Promise.all([
    readContract(viemClient, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
    readContract(viemClient, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    }),
    readContract(viemClient, {
      address: contractAddress,
      abi: liquidDelegatorAbi,
      functionName: "getMinDelegation",
    }),
  ])

  const oneWeekInMinutes = 60 * 24 * 7

  return {
    id: poolDefinitionId,
    address: contractAddress,
    tokenAddress,
    iconUrl: poolIconPublicPath,
    name: poolName,
    poolType: StakingPoolType.LIQUID,
    tokenDecimals,
    tokenSymbol,
    minimumStake,
    withdrawPeriodInMinutes: oneWeekInMinutes,
  }
}

async function readNonLiquidDelegator(
  poolDefinitionId: string,
  poolName: string,
  poolIconPublicPath: string,
  chainid: number,
  contractAddress: Address
): Promise<StakingPoolDefinition> {
  const viemClient = getViemClient(chainid)

  const [minimumStake] = await Promise.all([
    readContract(viemClient, {
      address: contractAddress,
      abi: nonLiquidDelegatorAbi,
      functionName: "getMinDelegation",
    }),
  ])

  const oneWeekInMinutes = 60 * 24 * 7

  return {
    id: poolDefinitionId,
    address: contractAddress,
    tokenAddress: "0x0000000000000000000000000000000000000000",
    iconUrl: poolIconPublicPath,
    name: poolName,
    poolType: StakingPoolType.NORMAL,
    tokenDecimals: 18,
    tokenSymbol: "ZIL",
    minimumStake,
    withdrawPeriodInMinutes: oneWeekInMinutes,
  }
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
    choices: Object.values(StakingPoolType),
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
  const contractAddress = argv.contract_address as Address
  const id = Buffer.from(`${contractAddress}"_"${argv.network_id}`)
    .toString("base64")
    .slice(0, 8)

  console.log("Add following definition to stakingPoolsConfig.ts")
  if (argv.type === StakingPoolType.LIQUID) {
    console.log({
      definition: await readLiquidDelegator(
        id,
        argv.name,
        argv.icon_url,
        chainid,
        contractAddress
      ),
    })
  } else {
    console.log({
      definition: await readNonLiquidDelegator(
        id,
        argv.name,
        argv.icon_url,
        chainid,
        contractAddress
      ),
    })
  }
})()
