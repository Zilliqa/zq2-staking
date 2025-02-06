import { Address, erc20Abi, formatUnits, parseUnits } from "viem"
import {
  CHAIN_ZQ2_PROTOTESTNET,
  CHAIN_ZQ2_DOCKERCOMPOSE,
  getViemClient,
  MOCK_CHAIN,
  CHAIN_ZQ2_DEVNET,
  CHAIN_ZQ2_PROTOMAINNET,
} from "./chainConfig"
import { readContract } from "viem/actions"
import { delegatorAbi, depositAbi } from "./stakingAbis"

/**
 * Deposit address is always the same
 */
const DEPOSIT_ADDRESS = "0x00000000005a494c4445504f53495450524f5859" as Address

export enum StakingPoolType {
  LIQUID = "LIQUID",
  NORMAL = "NON_LIQUID",
}

export interface StakingPoolDefinition {
  id: string
  name: string
  poolType: StakingPoolType
  address: string
  tokenAddress: string
  tokenDecimals: number
  tokenSymbol: string
  iconUrl: string
  minimumStake: bigint
  withdrawPeriodInMinutes: number
}

export interface StakingPoolData {
  tvl: bigint
  apr: number
  commission: number
  votingPower: number
  zilToTokenRate: number
}

export interface StakingPool {
  definition: StakingPoolDefinition
  data: StakingPoolData | null
}

export interface StakingPoolConfig {
  definition: StakingPoolDefinition
  delegatorDataProvider: (
    definition: StakingPoolDefinition,
    chainId: number
  ) => Promise<StakingPoolData>
}

async function mockDelegatorDataProvider(
  mockData: StakingPoolData,
  loadingMiliseconds: number,
  definition: StakingPoolDefinition,
  chainId: number
): Promise<StakingPoolData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData)
    }, loadingMiliseconds)
  })
}

async function fetchLiquidDelegatorDataFromNetwork(
  definition: StakingPoolDefinition,
  chainId: number
): Promise<StakingPoolData> {
  const viemClient = getViemClient(chainId)

  const readDelegatorContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(viemClient, {
      address: definition.address as Address,
      abi: delegatorAbi,
      functionName,
    })) as T
  }

  const readTokenContract = async <T>(
    functionName:
      | "symbol"
      | "name"
      | "totalSupply"
      | "allowance"
      | "balanceOf"
      | "decimals"
  ): Promise<T> => {
    return (await readContract(viemClient, {
      address: definition.tokenAddress as Address,
      abi: erc20Abi,
      functionName,
    })) as T
  }

  const readDepositContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(viemClient, {
      address: DEPOSIT_ADDRESS,
      abi: depositAbi,
      functionName,
    })) as T
  }

  try {
    const [
      totalSupply,
      zilToTokenRateWei,
      delegatorStake,
      depositTotalStake,
      [commissionNumerator, commissionDenominator],
    ] = await Promise.all([
      readTokenContract<bigint>("totalSupply"),
      readDelegatorContract<bigint>("getPrice"),
      readDelegatorContract<bigint>("getStake"),
      readDepositContract<bigint>("getFutureTotalStake"),
      readDelegatorContract<[bigint, bigint]>("getCommission"),
    ])

    const zilToTokenRate = 1 / parseFloat(formatUnits(zilToTokenRateWei, 18))

    const bigintDivisionPrecision = 1000000n

    const commission =
      Number(
        (commissionNumerator * bigintDivisionPrecision) / commissionDenominator
      ) / Number(bigintDivisionPrecision)
    const votingPower =
      Number((delegatorStake * bigintDivisionPrecision) / depositTotalStake) /
      Number(bigintDivisionPrecision)
    const rewardsPerYearInZil = 51000 * 24 * 365

    const delegatorYearReward = votingPower * rewardsPerYearInZil
    const delegatorRewardForShare = delegatorYearReward * (1 - commission)
    const apr =
      delegatorRewardForShare / parseFloat(formatUnits(delegatorStake, 18))

    return {
      tvl: totalSupply,
      commission,
      zilToTokenRate,
      votingPower,
      apr: apr,
    }
  } catch (error) {
    console.error("Error fetching total supply:", error)
    throw error
  }
}

async function fetchNonLiquidDelegatorDataFromNetwork(
  definition: StakingPoolDefinition,
  chainId: number
): Promise<StakingPoolData> {
  const viemClient = getViemClient(chainId)

  const readDelegatorContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(viemClient, {
      address: definition.address as Address,
      abi: delegatorAbi,
      functionName,
    })) as T
  }

  const readDepositContract = async <T>(functionName: string): Promise<T> => {
    return (await readContract(viemClient, {
      address: DEPOSIT_ADDRESS,
      abi: depositAbi,
      functionName,
    })) as T
  }

  try {
    const [
      delegatorStake,
      depositTotalStake,
      [commissionNumerator, commissionDenominator],
    ] = await Promise.all([
      readDelegatorContract<bigint>("getStake"),
      readDepositContract<bigint>("getFutureTotalStake"),
      readDelegatorContract<[bigint, bigint]>("getCommission"),
    ])

    const bigintDivisionPrecision = 1000000n

    const commission =
      Number(
        (commissionNumerator * bigintDivisionPrecision) / commissionDenominator
      ) / Number(bigintDivisionPrecision)
    const votingPower =
      Number((delegatorStake * bigintDivisionPrecision) / depositTotalStake) /
      Number(bigintDivisionPrecision)
    const rewardsPerYearInZil = 51000 * 24 * 365

    const delegatorYearReward = votingPower * rewardsPerYearInZil
    const delegatorRewardForShare = delegatorYearReward * (1 - commission)
    const apr =
      delegatorRewardForShare / parseFloat(formatUnits(delegatorStake, 18))

    return {
      tvl: parseUnits("10000", 18), // TODO get actual data
      commission,
      zilToTokenRate: 1,
      votingPower,
      apr: apr,
    }
  } catch (error) {
    console.error("Error fetching total supply:", error)
    throw error
  }
}

const twoWeeksInMinutes = 60 * 24 * 14
const fiveMinutesInMinutes = 5

export const stakingPoolsConfigForChainId: Record<
  string,
  Array<StakingPoolConfig>
> = {
  [MOCK_CHAIN.id]: [
    {
      definition: {
        id: "pool1",
        name: "Avely",
        poolType: StakingPoolType.LIQUID,
        address: "0x1234567890234567890234567890234567890",
        tokenAddress: "0x1234567890234567890234567890234567233",
        tokenDecimals: 18,
        tokenSymbol: "avZIL",
        iconUrl: "/static/logo2.webp",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null,
        {
          tvl: parseUnits("3621786", 18),
          apr: 0.135,
          commission: 0.1,
          votingPower: 0.3,
          zilToTokenRate: 1.2,
        },
        2000
      ),
    },
    {
      definition: {
        id: "pool2",
        name: "Plunderswap",
        poolType: StakingPoolType.LIQUID,
        address: "0x82245678902345678902345678918278372382",
        tokenAddress: "0x1234567890234567890234567890234567231",
        tokenDecimals: 18,
        tokenSymbol: "plZIL",
        iconUrl: "/static/logo1.webp",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null,
        {
          tvl: parseUnits("0", 18),
          apr: 0.21,
          commission: 0.011,
          votingPower: 0.5,
          zilToTokenRate: 1.1,
        },
        1000
      ),
    },
    {
      definition: {
        id: "pool3",
        name: "IgniteDao",
        poolType: StakingPoolType.LIQUID,
        address: "0x96525678902345678902345678918278372212",
        tokenAddress: "0x1234567890234567890234567890234567232",
        tokenDecimals: 18,
        tokenSymbol: "igZIL",
        iconUrl: "/static/logo3.webp",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null,
        {
          tvl: parseUnits("98173829", 18),
          apr: 1.1,
          commission: 0.05,
          votingPower: 0.2,
          zilToTokenRate: 1.3,
        },
        5000
      ),
    },
    {
      definition: {
        id: "pool4",
        name: "ADAMine",
        poolType: StakingPoolType.LIQUID,
        address: "0x965256789023456789023456789182783K92Uh",
        tokenAddress: "0x1234567890234567890234567890234567234",
        tokenDecimals: 18,
        tokenSymbol: "adaZIL",
        iconUrl: "/static/logo5.webp",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null,
        {
          tvl: parseUnits("100", 18),
          apr: 0.13,
          commission: 0.01,
          votingPower: 0.01,
          zilToTokenRate: 1,
        },
        500
      ),
    },
    {
      definition: {
        id: "K23k2322",
        address: "0xe863906941de820bde06701a0d804dd0b8575d67",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo1.webp",
        name: "Normal 1",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null,
        {
          tvl: parseUnits("100000", 18),
          apr: 0.13,
          commission: 0.01,
          votingPower: 0.05,
          zilToTokenRate: 1,
        },
        100
      ),
    },
  ],
  [CHAIN_ZQ2_PROTOTESTNET.id]: [
    {
      definition: {
        id: "MHg3QTI4",
        address: "0x7A28eda6899d816e574f7dFB62Cc8A84A4fF92a6",
        tokenAddress: "0x3fE49722fC4F9F119AB18fE0CF7D340A23C8388b",
        iconUrl: "/static/logo2.webp",
        name: "Validator 1",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "LST1",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg2MmYz",
        address: "0x62f3FC68ba2Ff62b23E73c48010262aD64054032",
        tokenAddress: "0x7854BFB32CC7a377165Ee3B5C8103a80A07913B2",
        iconUrl: "/static/logo1.webp",
        name: "Validator 2",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "LST2",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "K23k2322",
        address: "0x62f3FC68ba2Ff62b23E73c48010262aD64054032",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo1.webp",
        name: "Normal 1",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: parseUnits("100", 18),
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
  ],
  [CHAIN_ZQ2_DEVNET.id]: [
    {
      definition: {
        id: "MHg3YTBi",
        address: "0x7a0b7e6d24ede78260c9ddbd98e828b0e11a8ea2",
        tokenAddress: "0x9e5c257D1c6dF74EaA54e58CdccaCb924669dc83",
        iconUrl: "/static/logo1.webp",
        name: "Dev Validator 1",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "devLST1",
        minimumStake: 100000000000000000000n,
        withdrawPeriodInMinutes: fiveMinutesInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg1YmMz",
        address: "0x5bc3FcC25638725aaA2ED801b7BA21516f718655",
        tokenAddress: "0x3261f96C307BAd745578fAa470C8dC2841Dd36E0",
        iconUrl: "/static/logo2.webp",
        name: "Dev Validator 2",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "devLST2",
        minimumStake: 100000000000000000000n,
        withdrawPeriodInMinutes: fiveMinutesInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
  ],
  [CHAIN_ZQ2_PROTOMAINNET.id]: [],
}
