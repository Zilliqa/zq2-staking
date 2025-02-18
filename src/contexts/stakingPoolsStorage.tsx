"use client"

import { useEffect, useState } from "react"
import { createContainer } from "./context"
import { WalletConnector } from "./walletConnector"
import { DateTime } from "luxon"
import {
  StakingPool,
  stakingPoolsConfigForChainId,
} from "@/misc/stakingPoolsConfig"
import {
  getWalletNonLiquidStakingPoolRewardData,
  getWalletStakingData,
  getWalletUnstakingData,
  UserNonLiquidStakingPoolRewardData,
  UserStakingPoolData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { AppConfigStorage } from "./appConfigStorage"
import { useRouter } from "next/router"

const useStakingPoolsStorage = () => {
  const router = useRouter()

  const { walletAddress } = WalletConnector.useContainer()

  const { appConfig } = AppConfigStorage.useContainer()

  const [availableStakingPoolsData, setAvailableStakingPoolsData] = useState<
    StakingPool[]
  >([])

  const [userStakingPoolsData, setUserStakingPoolsData] = useState<
    UserStakingPoolData[]
  >([])
  const [userUnstakesData, setUserUnstakesData] = useState<
    UserUnstakingPoolData[]
  >([])
  const [userNonLiquidPoolRewards, setUserNonLiquidPoolRewards] = useState<
    UserNonLiquidStakingPoolRewardData[]
  >([])

  const [stakingPoolForView, setSelectedStakingPool] =
    useState<StakingPool | null>(null)

  const [isUnstakingDataLoading, setIsUnstakingDataLoading] = useState(false)

  const reloadUserStakingPoolsData = () => {
    if (!walletAddress) {
      setUserStakingPoolsData([])
      return
    }

    getWalletStakingData(walletAddress, appConfig!.chainId)
      .then(setUserStakingPoolsData)
      .catch(console.error)
    setIsUnstakingDataLoading(true)
    getWalletUnstakingData(walletAddress, appConfig!.chainId)
      .then(setUserUnstakesData)
      .catch(console.error)
      .finally(() => setIsUnstakingDataLoading(false))

    getWalletNonLiquidStakingPoolRewardData(walletAddress, appConfig!.chainId)
      .then(setUserNonLiquidPoolRewards)
      .catch(console.error)
      .finally(() => setIsUnstakingDataLoading(false))
  }

  useEffect(
    function triggerUserDataLoadingOnWalletConnect() {
      reloadUserStakingPoolsData()
    },
    [walletAddress]
  )

  useEffect(function populateStakingPoolsDefinitionsAndTriggerDataLoading() {
    const stakingPoolsConfig = stakingPoolsConfigForChainId[appConfig.chainId]

    setAvailableStakingPoolsData(
      stakingPoolsConfig.map((configEntry) => ({
        definition: configEntry.definition,
        data: null,
      }))
    )

    Promise.all(
      stakingPoolsConfig.map(async (config) => {
        const data = await config.delegatorDataProvider(
          config.definition,
          appConfig.chainId
        )

        setAvailableStakingPoolsData((prev) => {
          const updated = prev.map((entry) => {
            if (entry.definition.id === config.definition.id) {
              return {
                ...entry,
                data,
              }
            }

            return entry
          })

          return updated
        })
      })
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const poolToShow = router.query.poolId as string | null

    const selectedPool =
      poolToShow &&
      availableStakingPoolsData.find(
        (pool) => pool.definition.id === poolToShow
      )

    if (selectedPool) {
      setSelectedStakingPool(selectedPool)
    } else {
      setSelectedStakingPool(null)
    }
  }, [router.query.poolId, availableStakingPoolsData])

  useEffect(
    function updateStakingForViewOnStakingPoolsDataChange() {
      if (stakingPoolForView) {
        const updatedStakingPool = availableStakingPoolsData.find(
          (pool) => pool.definition.id === stakingPoolForView.definition.id
        )

        if (updatedStakingPool) {
          setSelectedStakingPool(updatedStakingPool)
        }
      }
    },
    [availableStakingPoolsData]
  )

  const selectStakingPoolForView = (stakingPoolId: string | null) => {
    if (!stakingPoolId || stakingPoolId === stakingPoolForView?.definition.id) {
      const currentQuery = router.query
      delete currentQuery.poolId

      router.push(
        {
          query: currentQuery,
        },
        undefined,
        { shallow: true }
      )

      return
    } else {
      router.push(
        {
          query: { poolId: stakingPoolId },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  const combinedStakingPoolsData = availableStakingPoolsData
    .map((stakingPool) => {
      const userStakingPoolData = userStakingPoolsData.find(
        (userPool) => userPool.address === stakingPool.definition.address
      )

      return {
        stakingPool,
        userData: userStakingPoolData,
      }
    })
    .toSorted((a, b) => {
      const diff =
        (b.userData?.stakingTokenAmount || 0n) -
        (a.userData?.stakingTokenAmount || 0n)

      if (diff === 0n) {
        return a.stakingPool.definition.name.localeCompare(
          b.stakingPool.definition.name
        )
      }

      return diff > 0 ? 1 : -1
    })

  const combinedSelectedStakingPoolForViewData = stakingPoolForView
    ? {
        stakingPool: stakingPoolForView,
        userData: {
          staked: userStakingPoolsData.find(
            (userPoolData) =>
              userPoolData.address === stakingPoolForView.definition.address
          ),
          unstaked: userUnstakesData.filter(
            (userPoolData) =>
              userPoolData.address === stakingPoolForView.definition.address
          ),
          reward: userNonLiquidPoolRewards.find(
            (userPoolData) =>
              userPoolData.address === stakingPoolForView.definition.address
          ),
        },
      }
    : null

  const combinedUserUnstakesData =
    userUnstakesData?.map((unstakeInfo) => ({
      unstakeInfo,
      stakingPool: availableStakingPoolsData.find(
        (pool) => pool.definition.address === unstakeInfo.address
      )!,
    })) || []

  const combinedUserNonLiquidPoolRewards =
    userNonLiquidPoolRewards?.map((rewardInfo) => ({
      rewardInfo,
      stakingPool: availableStakingPoolsData.find(
        (pool) => pool.definition.address === rewardInfo.address
      )!,
    })) || []

  const availableForUnstaking = combinedUserUnstakesData.filter(
    (unstakeData) => unstakeData.unstakeInfo.availableAt <= DateTime.now()
  )
  const pendingUnstaking = combinedUserUnstakesData.filter(
    (unstakeData) => unstakeData.unstakeInfo.availableAt > DateTime.now()
  )

  return {
    availableStakingPools: availableStakingPoolsData,
    stakingPoolForView: combinedSelectedStakingPoolForViewData,
    selectStakingPoolForView,
    combinedStakingPoolsData,
    userUnstakesData,
    availableForUnstaking,
    pendingUnstaking,
    nonLiquidRewards: combinedUserNonLiquidPoolRewards,
    reloadUserStakingPoolsData,
    isUnstakingDataLoading,
  }
}

export const StakingPoolsStorage = createContainer(useStakingPoolsStorage)
