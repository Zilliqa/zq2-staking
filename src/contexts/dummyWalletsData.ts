import { UserStakingPoolData } from "./stakingPoolsStorage";

export interface DummyWallet {
  name: string;
  address: string;
  stakedZil: Array<UserStakingPoolData>
  currentZil: number;
}

export const dummyWallets: Array<DummyWallet> = [
  {
    name: "No Zil, no ZIL staked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCe1A3",
    currentZil: 0,
    stakedZil: []
  },
  {
    name: "some Zil, no ZIL staked",
    address: "0xbA8221Ea404133f409D195B96a282197baC0587c",
    currentZil: 1000,
    stakedZil: []
  },
  {
    name: "some Zil, some ZIL staked",
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
    ]
  },
  {
    name: "no Zil, some ZIL staked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B21A9",
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
    ]
  },
]