import { DateTime } from "luxon"
import { getViemClient, MOCK_CHAIN } from "./chainConfig"
import { stakingPoolsConfigForChainId } from "./stakingPoolsConfig"
import { readContract } from "viem/actions"
import { Address, erc20Abi, parseUnits } from "viem"
import { delegatorAbi } from "./stakingAbis"

export interface UserStakingPoolData {
  address: string
  stakingTokenAmount: bigint
  rewardAcumulated: number
}

export interface UserUnstakingPoolData {
  address: string
  zilAmount: bigint
  availableAt: DateTime
}

export interface DummyWallet {
  name: string
  address: string
  stakingTokenAmount: Array<UserStakingPoolData>
  zilAmount: Array<UserUnstakingPoolData>
  currentZil: bigint
}

export const dummyWallets: Array<DummyWallet> = [
  {
    name: "No Zil, no ZIL staked, no ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCe1A3",
    currentZil: 0n,
    stakingTokenAmount: [],
    zilAmount: [],
  },
  {
    name: "No Zil, No ZIL staked, Some ZIL unstaked",
    address: "0xCF671756a8238cBeB19BCB4D77FC9091E2fCeYYY",
    currentZil: 0n,
    stakingTokenAmount: [],
    zilAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        zilAmount: parseUnits("62712.323", 18),
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        zilAmount: parseUnits("1000", 18),
        availableAt: DateTime.now().plus({ days: 1 }),
      },
    ],
  },
  {
    name: "Some Zil, No ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B2111",
    currentZil: 1000000000000000000n,
    stakingTokenAmount: [],
    zilAmount: [],
  },
  {
    name: "Some Zil, Some ZIL staked, No ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B9383",
    currentZil: 1000000000000000000n,
    stakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakingTokenAmount: parseUnits("1000.50", 18),
        rewardAcumulated: 10,
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakingTokenAmount: parseUnits("60.50", 18),
        rewardAcumulated: 50,
      },
    ],
    zilAmount: [],
  },
  {
    name: "Some Zil, Some ZIL staked, Some ZIL unstaked",
    address: "0xf0a9953B539f9E7c4953279859F924d9212B21A9",
    currentZil: 1000000000000000000000n,
    stakingTokenAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        stakingTokenAmount: parseUnits("1000", 18),
        rewardAcumulated: 10,
      },
      {
        address: "0x96525678902345678902345678918278372212",
        stakingTokenAmount: parseUnits("9991119", 18),
        rewardAcumulated: 50,
      },
    ],
    zilAmount: [
      {
        address: "0x1234567890234567890234567890234567890",
        zilAmount: parseUnits("9000", 18),
        availableAt: DateTime.now().minus({ days: 1 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        zilAmount: parseUnits("1044", 18),
        availableAt: DateTime.now().minus({ days: 5 }),
      },
      {
        address: "0x82245678902345678902345678918278372382",
        zilAmount: parseUnits("1000000", 18),
        availableAt: DateTime.now().plus({ days: 1 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        zilAmount: parseUnits("500", 18),
        availableAt: DateTime.now().plus({ days: 5 }),
      },
      {
        address: "0x96525678902345678902345678918278372212",
        zilAmount: parseUnits("10000", 18),
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
        stakingTokenAmount: parseUnits("123.522039320", 18),
        rewardAcumulated: 40,
      },
      {
        address: "0x82245678902345678902345678918278372382",
        stakingTokenAmount: parseUnits("99999", 18),
        rewardAcumulated: 0,
      },
    ],
    zilAmount: [],
  },
]

export async function getWalletStakingData(
  wallet: string,
  chainId: number
): Promise<UserStakingPoolData[]> {
  if (chainId === MOCK_CHAIN.id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          dummyWallets.find((dw) => dw.address === wallet)
            ?.stakingTokenAmount || []
        )
      }, 1000)
    })
  } else {
    const stakingData: UserStakingPoolData[] = await Promise.all(
      stakingPoolsConfigForChainId[chainId].map(async (pool) => {
        return {
          address: pool.definition.address,
          stakingTokenAmount: await readContract(getViemClient(chainId), {
            address: pool.definition.tokenAddress as Address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [wallet as Address],
          }),
          rewardAcumulated: 0,
        }
      })
    )

    return stakingData
  }
}

export async function getWalletUnstakingData(
  wallet: string,
  chainId: number
): Promise<UserUnstakingPoolData[]> {
  if (chainId === MOCK_CHAIN.id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          dummyWallets.find((dw) => dw.address === wallet)?.zilAmount || []
        )
      }, 1000)
    })
  } else {
    const currentBlockNumber = await getViemClient(chainId).getBlockNumber()

    // get unstaking data from contracts
    const unstakingWalletData = await Promise.all(
      stakingPoolsConfigForChainId[chainId].map(async (pool) => {
        return {
          address: pool.definition.address,
          blockNumberAndAmount: (await readContract(getViemClient(chainId), {
            address: pool.definition.address as Address,
            abi: delegatorAbi,
            functionName: "getPendingClaims",
            account: wallet as Address,
          })) as bigint[][],
          claimableNow: (await readContract(getViemClient(chainId), {
            address: pool.definition.address as Address,
            abi: delegatorAbi,
            functionName: "getClaimable",
            account: wallet as Address,
          })) as bigint,
        }
      })
    )

    // convert contracts raw data into application data
    const result: UserUnstakingPoolData[] = unstakingWalletData
      .filter(
        (uwd) => uwd.blockNumberAndAmount.length > 0 || uwd.claimableNow > 0
      )
      .map((uwd) => {
        const claims: UserUnstakingPoolData[] = []

        if (uwd.claimableNow > 0) {
          claims.push({
            zilAmount: uwd.claimableNow,
            availableAt: DateTime.now().minus({ days: 1 }), // just to make sure it displays
            address: uwd.address,
          })
        }

        if (uwd.blockNumberAndAmount.length > 0) {
          claims.push(
            ...uwd.blockNumberAndAmount.map((bna) => {
              const blocksRemaining = Number(bna[0] - currentBlockNumber)

              return {
                zilAmount: bna[1],
                availableAt: DateTime.now().plus({ seconds: blocksRemaining }), // we assume block takes a second
                address: uwd.address,
              }
            })
          )
        }

        return claims
      })
      .flat()

    return result
  }
}
