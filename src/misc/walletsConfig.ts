import { DateTime } from "luxon";
import { MOCK_CHAIN } from "./chainConfig";
import { getChainId, viemClient } from "./appConfig";
import { stakingPoolsConfigForChainId } from "./stakingPoolsConfig";
import { readContract } from "viem/actions";
import { Address, erc20Abi, parseUnits } from "viem";

export interface UserStakingPoolData {
  address: string;
  stakingTokenAmount: bigint;
  rewardAcumulated: number;
}

export interface UserUnstakingPoolData {
  address: string;
  unstakingTokenAmount: bigint;
  availableAt: DateTime;
}

export interface DummyWallet {
  name: string;
  address: string;
  stakingTokenAmount: Array<UserStakingPoolData>;
  unstakingTokenAmount: Array<UserUnstakingPoolData>;
  currentZil: bigint;
}

export const dummyWallets: Array<DummyWallet> = [
  {
    name: "No Zil, no ZIL staked, no ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCe1A3",
    currentZil: 0n,
    stakingTokenAmount: [],
    unstakingTokenAmount: [],
  },
  {
    name: "No Zil, No ZIL staked, Some ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCeYYY",
    currentZil: 0n,
    stakingTokenAmount: [],
    unstakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        unstakingTokenAmount: parseUnits("62712.323", 18),
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakingTokenAmount: parseUnits("1000", 18),
        availableAt: DateTime.now().plus({ days: 1 }),
      },
    ],
  },
  {
    name: "Some Zil, No ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B2111",
    currentZil: 1000000000000000000n,
    stakingTokenAmount: [],
    unstakingTokenAmount: [],
  },
  {
    name: "Some Zil, Some ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B9383",
    currentZil: 1000000000000000000n,
    stakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakingTokenAmount: 1000n,
        rewardAcumulated: 10
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakingTokenAmount: 60n,
        rewardAcumulated: 50
      },
    ],
    unstakingTokenAmount: [],
  },
  {
    name: "Some Zil, Some ZIL staked, Some ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B21A9",
    currentZil: 1000000000000000000000n,
    stakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakingTokenAmount: 1000n,
        rewardAcumulated: 10
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakingTokenAmount: 60n,
        rewardAcumulated: 50
      },
    ],
    unstakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        unstakingTokenAmount: parseUnits("9000", 18),
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        unstakingTokenAmount: parseUnits("1044", 18),
        availableAt: DateTime.now().minus({ days: 5 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        unstakingTokenAmount: parseUnits("1000000", 18),
        availableAt: DateTime.now().plus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakingTokenAmount: parseUnits("500", 18),
        availableAt: DateTime.now().plus({ days: 5 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakingTokenAmount: parseUnits("10000", 18),
        availableAt: DateTime.now().plus({ days: 13 }),
      },
    ],
  },
  {
    name: "No Zil, Some ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212BBBBBB",
    currentZil: 0n,
    stakingTokenAmount: [
      {
        address: "0x96525678902345678902345678918278372212",
        stakingTokenAmount: 123n,
        rewardAcumulated: 40
      },
      {
        address: "0x82245678902345678902345678918278372382",
        stakingTokenAmount: 999n,
        rewardAcumulated: 0
      },
    ],
    unstakingTokenAmount: [],
  },
]

export async function getWalletStakingData(wallet: string): Promise<UserStakingPoolData[]> {
  if (getChainId() === MOCK_CHAIN.id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyWallets.find((dw) => dw.address === wallet)?.stakingTokenAmount || []);
      }, 1000);
    });
  } else {
    const stakingData: UserStakingPoolData[] = await Promise.all(
      stakingPoolsConfigForChainId[getChainId()].map(
        async (pool) => {
          return {
            address: pool.definition.address,
            stakingTokenAmount: await readContract(viemClient, {
              address: pool.definition.tokenAddress as Address,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [wallet as Address],
            }),
            rewardAcumulated: 0,
          }
        }
      )
    )

    return stakingData;
  }
}

export function getWalletUnstakingData(wallet: string): Promise<UserUnstakingPoolData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyWallets.find((dw) => dw.address === wallet)?.unstakingTokenAmount || []);
    }, 1000);
  });
}