import { CHAIN_ZQ2_DOCKERCOMPOSE, MOCK_CHAIN } from "./chainConfig";

export interface StakingPoolDefinition {
  id: string;
  name: string;
  address: string;
  tokenSymbol: string;
  iconUrl: string;
}

export interface StakingPoolData {
  tvl: number;
  apr: number;
  commission: number;
  votingPower: number;
  zilToTokenRate: number;
}

export interface StakingPool {
  definition: StakingPoolDefinition;
  data: StakingPoolData | null;
}

async function mockDelegatorDataProvider(mockData: StakingPoolData, loadingMiliseconds: number): Promise<StakingPoolData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, loadingMiliseconds);
  });
}

async function fetchDelegatorDataFromNetwork() {
  
}

export interface StakingPoolConfig {
  definition: StakingPoolDefinition;
  delegatorDataProvider: () => Promise<StakingPoolData>;
}

export const stakingPoolsConfigForChainId: Record<string, Array<StakingPoolConfig>> = {
  [MOCK_CHAIN.id]: [
    {
      definition: {
        id: "pool1",
        name: "Avely",
        address: "0x1234567890234567890234567890234567890",
        tokenSymbol: "avZIL",
        iconUrl: "/static/logo2.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 3621786,
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
        tokenSymbol: "plZIL",
        iconUrl: "/static/logo1.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 0,
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
        tokenSymbol: "igZIL",
        iconUrl: "/static/logo3.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 98173829,
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
        tokenSymbol: "adaZIL",
        iconUrl: "/static/logo5.webp",
      },
      delegatorDataProvider: mockDelegatorDataProvider.bind(
        null, {
          tvl: 100,
          apr: 0.13,
          commission: 0.01,
          votingPower: 0.01,
          zilToTokenRate: 1,
        },
        500
      ),
    }
  ]
}
