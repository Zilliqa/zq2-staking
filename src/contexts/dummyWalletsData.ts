import { UserStakingPoolData, UserUnstakingPoolData } from "./stakingPoolsStorage";
import { DateTime } from "luxon";

export interface DummyWallet {
  name: string;
  address: string;
  stakedZil: Array<UserStakingPoolData>;
  unstakedZil: Array<UserUnstakingPoolData>;
  currentZil: number;
}

export const dummyWallets: Array<DummyWallet> = [
  {
    name: "No Zil, no ZIL staked, no ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCe1A3",
    currentZil: 0,
    stakedZil: [],
    unstakedZil: [],
  },
  {
    name: "No Zil, No ZIL staked, Some ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCeYYY",
    currentZil: 0,
    stakedZil: [],
    unstakedZil: [
      {
        address: "0x1234567890234567890234567890234567890",
        unstakedZil: 1500,
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakedZil: 1000,
        availableAt: DateTime.now().plus({ days: 1 }),
      },
    ],
  },
  {
    name: "Some Zil, No ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B2111",
    currentZil: 1000,
    stakedZil: [],
    unstakedZil: [],
  },
  {
    name: "Some Zil, Some ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B9383",
    currentZil: 1000,
    stakedZil: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakedZil: 1000,
        rewardAcumulated: 10
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakedZil: 60,
        rewardAcumulated: 50
      },
    ],
    unstakedZil: [],
  },
  {
    name: "Some Zil, Some ZIL staked, Some ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B21A9",
    currentZil: 1000,
    stakedZil: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakedZil: 1000,
        rewardAcumulated: 10
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakedZil: 60,
        rewardAcumulated: 50
      },
    ],
    unstakedZil: [
      {
        address: "0x1234567890234567890234567890234567890",
        unstakedZil: 9000,
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        unstakedZil: 1044,
        availableAt: DateTime.now().minus({ days: 5 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        unstakedZil: 100,
        availableAt: DateTime.now().plus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakedZil: 500,
        availableAt: DateTime.now().plus({ days: 5 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        unstakedZil: 1000,
        availableAt: DateTime.now().plus({ days: 13 }),
      },
    ],
  },
  {
    name: "No Zil, Some ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212BBBBBB",
    currentZil: 0,
    stakedZil: [
      {
        address: "0x96525678902345678902345678918278372212",
        stakedZil: 123,
        rewardAcumulated: 40
      },
      {
        address: "0x82245678902345678902345678918278372382",
        stakedZil: 999,
        rewardAcumulated: 0
      },
    ],
    unstakedZil: [],
  },
]