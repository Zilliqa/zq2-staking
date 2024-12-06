import { Address, erc20Abi } from "viem";
import { CHAIN_ZQ2_DOCKERCOMPOSE, MOCK_CHAIN } from "./chainConfig";
import { readContract } from "viem/actions";
import { viemClient } from "./appConfig";

export interface StakingPoolDefinition {
  id: string;
  name: string;
  address: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenSymbol: string;
  iconUrl: string;
}

export interface StakingPoolData {
  tvl: bigint;
  apr: number;
  commission: number;
  votingPower: number;
  zilToTokenRate: number;
}

export interface StakingPool {
  definition: StakingPoolDefinition;
  data: StakingPoolData | null;
}

export interface StakingPoolConfig {
  definition: StakingPoolDefinition;
  delegatorDataProvider: (definition: StakingPoolDefinition) => Promise<StakingPoolData>;
}

async function mockDelegatorDataProvider(mockData: StakingPoolData, loadingMiliseconds: number, definition: StakingPoolDefinition): Promise<StakingPoolData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, loadingMiliseconds);
  });
}

async function fetchDelegatorDataFromNetwork(mockData: StakingPoolData, definition: StakingPoolDefinition): Promise<StakingPoolData> {
  try {
    const totalSupply = await readContract(viemClient, {
      address: definition.tokenAddress as Address,
      abi: erc20Abi,
      functionName: "totalSupply",
    })

    return {
      ...mockData,
      tvl: totalSupply,
    }
  } catch (error) {
    console.error("Error fetching LST address:", error);
    throw error;
  }
}

export const stakingPoolsConfigForChainId: Record<string, Array<StakingPoolConfig>> = {
  [MOCK_CHAIN.id]: [
    {
      definition: {
        id: "pool1",
        name: "Avely",
        address: "0x1234567890234567890234567890234567890",
        tokenAddress: "0x1234567890234567890234567890234567233",
        tokenDecimals: 18,
        tokenSymbol: "avZIL",
        iconUrl: "/static/logo2.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 3621786n,
          apr: 0.135,
          commission: 0.1,
          votingPower: 0.3,
          zilToTokenRate: 1.2,
        },
        2000
      )
    },
    {
      definition: {
        id: "pool2",
        name: "Plunderswap",
        address: "0x82245678902345678902345678918278372382",
        tokenAddress: "0x1234567890234567890234567890234567231",
        tokenDecimals: 18,
        tokenSymbol: "plZIL",
        iconUrl: "/static/logo1.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 0n,
          apr: 0.21,
          commission: 0.011,
          votingPower: 0.5,
          zilToTokenRate: 1.1,
        },
        1000,
      )
    },
    {
      definition: {
        id: "pool3",
        name: "IgniteDao",
        address: "0x96525678902345678902345678918278372212",
        tokenAddress: "0x1234567890234567890234567890234567232",
        tokenDecimals: 18,
        tokenSymbol: "igZIL",
        iconUrl: "/static/logo3.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 98173829n,
          apr: 1.1,
          commission: 0.05,
          votingPower: 0.2,
          zilToTokenRate: 1.3,
        },
        5000,
      )
    },
    {
      definition: {
        id: "pool4",
        name: "ADAMine",
        address: "0x965256789023456789023456789182783K92Uh",
        tokenAddress: "0x1234567890234567890234567890234567234",
        tokenDecimals: 18,
        tokenSymbol: "adaZIL",
        iconUrl: "/static/logo5.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 100n,
          apr: 0.13,
          commission: 0.01,
          votingPower: 0.01,
          zilToTokenRate: 1,
        },
        500
      ),
    }
  ],
  [CHAIN_ZQ2_DOCKERCOMPOSE.id]: [
    {
      definition: {
        id: "pool1",
        name: "LocalDelegator",
        address: "0x0bF52FF2Ee8267b462c21306BA086E076211e927",
        tokenAddress: "0x874fAf3E1500C37C46dE40aD27Aa30571Ebc14cE",
        tokenDecimals: 18,
        tokenSymbol: "ldZIL",
        iconUrl: "/static/logo2.webp",
      },
      delegatorDataProvider: fetchDelegatorDataFromNetwork.bind(
        null, {
          tvl: 3621786n,
          apr: 0.135,
          commission: 0.1,
          votingPower: 0.3,
          zilToTokenRate: 1.2,
        },
      )
    },
  ]
}
