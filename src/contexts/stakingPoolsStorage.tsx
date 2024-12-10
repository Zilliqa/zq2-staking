"use client";

import { useEffect, useState } from "react";
import { createContainer } from "./context";
import { WalletConnector } from "./walletConnector";
import { DateTime } from "luxon";
import { StakingPool, stakingPoolsConfigForChainId } from "@/misc/stakingPoolsConfig";
import { getWalletStakingData, getWalletUnstakingData, UserStakingPoolData, UserUnstakingPoolData } from "@/misc/walletsConfig";
import { AppConfigStorage } from "./appConfigStorage";

const useStakingPoolsStorage = () => {
  const {
    walletAddress,
  } = WalletConnector.useContainer();

  const {
    appConfig
  } = AppConfigStorage.useContainer();

  const [availableStakingPoolsData, setAvailableStakingPoolsData] = useState<StakingPool[]>([]);

  const [userStakingPoolsData, setUserStakingPoolsData] = useState<UserStakingPoolData[]>([]);
  const [userUnstakesData, setUserUnstakesData] = useState<UserUnstakingPoolData[]>([]);

  const [stakingPoolForView, setSelectedStakingPool] = useState<StakingPool | null>(null);

  const [stakingPoolForStaking, setStakingPoolForStaking] = useState<StakingPool | null>(null);
  const [stakingPoolForUnstaking, setStakingPoolForUnstaking] = useState<StakingPool | null>(null);

  const reloadUserStakingPoolsData = () => {
    if (!walletAddress) {
      setUserStakingPoolsData([]);
      return
    }

    getWalletStakingData(walletAddress, appConfig!.chainId).then(setUserStakingPoolsData).catch(console.error);
    getWalletUnstakingData(walletAddress).then(setUserUnstakesData).catch(console.error);
  }

  useEffect(
    function triggerUserDataLoadingOnWalletConnect() {
      reloadUserStakingPoolsData();
    },
    [walletAddress]
  );

  useEffect(
    function populateStakingPoolsDefinitionsAndTriggerDataLoading () {
      const stakingPoolsConfig = stakingPoolsConfigForChainId[appConfig.chainId];

      setAvailableStakingPoolsData(stakingPoolsConfig.map((configEntry) => ({
        definition: configEntry.definition,
        data: null,
      })));

      Promise.all(stakingPoolsConfig.map(async (config) => {
        const data = await config.delegatorDataProvider(config.definition, appConfig.chainId);

        setAvailableStakingPoolsData((prev) => {
          const updated = prev.map((entry) => {
            if (entry.definition.id === config.definition.id) {
              return {
                ...entry,
                data,
              };
            }

            return entry;
          });

          return updated;
        }
      )
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    function updateStakingForViewOnStakingPoolsDataChange () {
      if (stakingPoolForView) {
        const updatedStakingPool = availableStakingPoolsData.find((pool) => pool.definition.id === stakingPoolForView.definition.id);

        if (updatedStakingPool) {
          setSelectedStakingPool(updatedStakingPool);
        }
      }
    },
    [availableStakingPoolsData]
  );

  const selectStakingPoolForView = (stakingPoolId: string | null) => {
    if (!stakingPoolId) {
      setSelectedStakingPool(null);
      return;
    }

    const selectedPool = availableStakingPoolsData.find((pool) => pool.definition.id === stakingPoolId);

    if (selectedPool) {
      if (selectedPool?.definition.id === stakingPoolForView?.definition.id) {
        setSelectedStakingPool(null);
      } else {
        setSelectedStakingPool(selectedPool);
      }
    }

    setStakingPoolForStaking(null);
  }

  const selectStakingPoolForStaking = (stakingPoolId: string | null) => {
    if (!stakingPoolId) {
      setStakingPoolForStaking(null);
      return;
    }
    
    const selectedPool = availableStakingPoolsData.find((pool) => pool.definition.id === stakingPoolId);

    if (selectedPool) {
        setStakingPoolForStaking(selectedPool);
    }
  }

  const selectStakingPoolForUnstaking = (stakingPoolId: string | null) => {
    if (!stakingPoolId) {
      setStakingPoolForUnstaking(null);
      return;
    }
    
    const selectedPool = availableStakingPoolsData.find((pool) => pool.definition.id === stakingPoolId);

    if (selectedPool) {
        setStakingPoolForUnstaking(selectedPool);
    }
  }

  const combinedStakingPoolsData = availableStakingPoolsData.map((stakingPool) => {
    const userStakingPoolData = userStakingPoolsData.find((userPool) => userPool.address === stakingPool.definition.address);

    return {
      stakingPool,
      userData: userStakingPoolData,
    }
  }).toSorted(
    (a, b) => {
      const diff = (b.userData?.stakingTokenAmount || 0n) - (a.userData?.stakingTokenAmount || 0n);

      if (diff === 0n) {
        return a.stakingPool.definition.name.localeCompare(b.stakingPool.definition.name);
      }

      return diff > 0 ? 1 : -1;
    }
  );

  const combinedSelectedStakingPoolForViewData = stakingPoolForView ? {
    stakingPool: stakingPoolForView,
    userData: {
      staked: userStakingPoolsData.find((userPoolData) => userPoolData.address === stakingPoolForView.definition.address),
      unstaked: userUnstakesData.filter((userPoolData) => userPoolData.address === stakingPoolForView.definition.address)
    }
  } : null;

  const combinedSelectedStakingPoolForStakingData = stakingPoolForStaking ? {
    stakingPool: stakingPoolForStaking,
    userData: userStakingPoolsData.find((userPool) => userPool.address === stakingPoolForStaking.definition.address),
  } : null;

  const combinedSelectedStakingPoolForUnstakingData = stakingPoolForUnstaking ? {
    stakingPool: stakingPoolForUnstaking,
    userData: userStakingPoolsData.find((userPool) => userPool.address === stakingPoolForUnstaking.definition.address),
  } : null;

  const combinedUserUnstakesData = userUnstakesData?.map(
    (unstakeInfo) => ({
      unstakeInfo,
      stakingPool: availableStakingPoolsData.find((pool) => pool.definition.address === unstakeInfo.address)!,
    })
  ) || [];

  const availableForUnstaking = combinedUserUnstakesData.filter((unstakeData) => unstakeData.unstakeInfo.availableAt <= DateTime.now());
  const pendingUnstaking = combinedUserUnstakesData.filter((unstakeData) => unstakeData.unstakeInfo.availableAt > DateTime.now());

  return {
    availableStakingPools: availableStakingPoolsData,
    stakingPoolForView: combinedSelectedStakingPoolForViewData,
    stakingPoolForStaking: combinedSelectedStakingPoolForStakingData,
    stakingPoolForUnstaking: combinedSelectedStakingPoolForUnstakingData,
    selectStakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForUnstaking,
    combinedStakingPoolsData,
    userUnstakesData,
    availableForUnstaking,
    pendingUnstaking,
    reloadUserStakingPoolsData,
  };
};

export const StakingPoolsStorage = createContainer(useStakingPoolsStorage);
