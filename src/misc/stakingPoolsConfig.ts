import {
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  erc20Abi,
  formatUnits,
  parseUnits,
  ReadContractReturnType,
} from "viem"
import {
  CHAIN_ZQ2_PROTOTESTNET,
  getViemClient,
  MOCK_CHAIN,
  CHAIN_ZQ2_DEVNET,
  CHAIN_ZQ2_PROTOMAINNET,
} from "./chainConfig"
import { readContract } from "viem/actions"
import {
  depositAbi,
  liquidDelegatorAbi,
  nonLiquidDelegatorAbi,
} from "./stakingAbis"

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
  loadingMiliseconds: number
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

  const readDelegatorContract = async <
    functionName extends ContractFunctionName<
      typeof liquidDelegatorAbi,
      "pure" | "view"
    >,
    const args extends ContractFunctionArgs<
      typeof liquidDelegatorAbi,
      "pure" | "view",
      functionName
    >,
  >(
    fname: functionName
  ): Promise<
    ReadContractReturnType<typeof liquidDelegatorAbi, functionName, args>
  > => {
    return readContract(viemClient, {
      address: definition.address as Address,
      abi: liquidDelegatorAbi,
      functionName: fname,
    })
  }

  try {
    const [
      totalSupply,
      zilToTokenRateWei,
      delegatorStake,
      depositTotalStake,
      [commissionNumerator, commissionDenominator],
    ] = await Promise.all([
      readContract(viemClient, {
        address: definition.tokenAddress as Address,
        abi: erc20Abi,
        functionName: "totalSupply",
      }),
      readDelegatorContract("getPrice"),
      readDelegatorContract("getStake"),
      readContract(viemClient, {
        address: DEPOSIT_ADDRESS,
        abi: depositAbi,
        functionName: "getFutureTotalStake",
      }),
      readDelegatorContract("getCommission"),
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

  const readDelegatorContract = async <
    functionName extends ContractFunctionName<
      typeof nonLiquidDelegatorAbi,
      "pure" | "view"
    >,
    const args extends ContractFunctionArgs<
      typeof nonLiquidDelegatorAbi,
      "pure" | "view",
      functionName
    >,
  >(
    fname: functionName
  ): Promise<
    ReadContractReturnType<typeof nonLiquidDelegatorAbi, functionName, args>
  > => {
    return readContract(viemClient, {
      address: definition.address as Address,
      abi: nonLiquidDelegatorAbi,
      functionName: fname,
    })
  }

  try {
    const [
      tvl,
      delegatorStake,
      depositTotalStake,
      [commissionNumerator, commissionDenominator],
    ] = await Promise.all([
      readDelegatorContract("getDelegatedTotal"),
      readDelegatorContract("getStake"),
      readContract(viemClient, {
        address: DEPOSIT_ADDRESS,
        abi: depositAbi,
        functionName: "getFutureTotalStake",
      }),
      readDelegatorContract("getCommission"),
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
      tvl,
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
          zilToTokenRate: 0.156374848922222,
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
          zilToTokenRate: 0.7723232322,
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
          zilToTokenRate: 0.9392382873,
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
          zilToTokenRate: 1.5,
        },
        500
      ),
    },
    {
      definition: {
        id: "K23k2322",
        address: "0xe863906941de820bde06701a0d804dd0b8575d67",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/quantum.webp",
        name: "Quantum",
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
          zilToTokenRate: 0.111112323232313,
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
  ],
  [CHAIN_ZQ2_DEVNET.id]: [
    {
      definition: {
        id: "MHg3YTBi",
        address: "0x7a0b7e6d24ede78260c9ddbd98e828b0e11a8ea2",
        tokenAddress: "0x9e5c257D1c6dF74EaA54e58CdccaCb924669dc83",
        iconUrl: "/static/collective.webp",
        name: "Collective",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "xZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: fiveMinutesInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg3ZTAy",
        address: "0x7e02c204daf4e1140a331d6dfad1eeb265d9544f",
        tokenAddress: "0xDbdb7f1f01c438f9951d780Ac9C42E9795Bb938f",
        iconUrl: "/static/quantum.webp",
        name: "Quantum",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "yZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: fiveMinutesInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg1OTZh",
        address: "0x983fC5214be8fB08A205902ea73A2cA10811060c",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/citadel.webp",
        name: "Citadel",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: fiveMinutesInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
  ],
  [CHAIN_ZQ2_PROTOMAINNET.id]: [
    {
      definition: {
        id: "MHhBMDU3",
        address: "0xA0572935d53e14C73eBb3de58d319A9Fe51E1FC8",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo_moonlet.webp",
        name: "Moonlet",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHgyQWJl",
        address: "0x2Abed3a598CBDd8BB9089c09A9202FD80C55Df8c",
        tokenAddress: "0xD8B61fed51b9037A31C2Bf0a5dA4B717AF0C0F78",
        iconUrl: "/static/logo_AtomicWallet.webp",
        name: "AtomicWallet",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "SHARK",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHhCOWQ2",
        address: "0xB9d689c64b969ad9eDd1EDDb50be42E217567fd3",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo_cex.webp",
        name: "CEX.IO",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHhlMEMw",
        address: "0xe0C095DBE85a8ca75de4749B5AEe0D18100a3C39",
        tokenAddress: "0x7B213b5AEB896bC290F0cD8B8720eaF427098186",
        iconUrl: "/static/logo_Plunderswap.webp",
        name: "PlunderSwap",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "pZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHhDMDI0",
        address: "0xC0247d13323F1D06b6f24350Eea03c5e0Fbf65ed",
        tokenAddress: "0x2c51C97b22E73AfD33911397A20Aa5176e7Ab951",
        iconUrl: "/static/logo_Luganodes.webp",
        name: "Luganodes",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "LNZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg4QTBk",
        address: "0x8A0dEd57ABd3bc50A600c94aCbEcEf62db5f4D32",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo_Dteam.webp",
        name: "DTEAM",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHgzYjFD",
        address: "0x3b1Cd55f995a9A8A634fc1A3cEB101e2baA636fc",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        iconUrl: "/static/logo_shardpool.svg",
        name: "Shardpool",
        poolType: StakingPoolType.NORMAL,
        tokenDecimals: 18,
        tokenSymbol: "ZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchNonLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHg2NmEy",
        address: "0x66a2bb4AD6999966616B2ad209833260F8eA07C8",
        tokenAddress: "0xA1Adc08C12c684AdB28B963f251d6cB1C6a9c0c1",
        iconUrl: "/static/logo_encapsulate.webp",
        name: "Encapsulate",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "encapZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
    {
      definition: {
        id: "MHhlNTlE",
        address: "0xe59D98b887e6D40F52f7Cc8d5fb4CF0F9Ed7C98B",
        tokenAddress: "0xf564DF9BeB417FB50b38A58334CA7607B36D3BFb",
        iconUrl: "/static/logo_stzill.webp",
        name: "Amazing Pool - Avely and ZilPay",
        poolType: StakingPoolType.LIQUID,
        tokenDecimals: 18,
        tokenSymbol: "stZIL",
        minimumStake: 10000000000000000000n,
        withdrawPeriodInMinutes: twoWeeksInMinutes,
      },
      delegatorDataProvider: fetchLiquidDelegatorDataFromNetwork,
    },
  ],
}
