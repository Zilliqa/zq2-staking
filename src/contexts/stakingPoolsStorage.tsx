"use client";

import { useEffect, useState } from "react";
import { createContainer } from "./context";
import { WalletConnector } from "./walletConnector";
import { dummyWallets } from "./dummyWalletsData";

export interface StakingPoolDefinition {
  id: string;
  name: string;
  description: string;
  address: string;
}

export interface StakingPoolData extends StakingPoolDefinition {
  tvl: number;
  apy: number;
  rewardFee: number;
}

export interface UserStakingPoolData {
  address: string;
  stakedZil: number;
  rewardAcumulated: number;
}

const useStakingPoolsStorage = () => {

  const {
    walletAddress,
  } = WalletConnector.useContainer();

  const [availableStakingPoolsData, setAvailableStakingPoolsData] = useState<StakingPoolData[]>([
    {
      id: "pool1",
      name: "Pool 1",
      tvl: 3621786,
      apy: 0.135,
      description: "This is the first pool, it has a lot of TVL, you should stake here",
      address: "0x1234567890234567890234567890234567890",
      rewardFee: 0.1,
    },
    {
      id: "pool2",
      name: "Pool 2",
      tvl: 0,
      apy: 0.21,
      description: "This is the second pool, it has no TVL, you should not stake here",
      address: "0x82245678902345678902345678918278372382",
      rewardFee: 0.011,
    },
    {
      id: "pool3",
      name: "Pool 3",
      tvl: 98173829347194,
      apy: 1.1,
      description: "This is the third pool, if it works you will be rich",
      address: "0x96525678902345678902345678918278372212",
      rewardFee: 0.05,
    },
  ]);

  const [userStakingPoolsData, setUserStakingPoolsData] = useState<UserStakingPoolData[]>([]);

  const [stakingPoolForView, setSelectedStakingPool] = useState<StakingPoolData | null>(null);

  const [stakingPoolForStaking, setStakingPoolForStaking] = useState<StakingPoolData | null>(null);
  const [stakingPoolForUnstaking, setStakingPoolForUnstaking] = useState<StakingPoolData | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      return
    }

    setUserStakingPoolsData(dummyWallets.find((wallet) => wallet.address === walletAddress)?.stakedZil || []);

  }, [walletAddress]);

  const selectStakingPoolForView = (stakingPoolId: string | null) => {
    if (!stakingPoolId) {
      setSelectedStakingPool(null);
      return;
    }

    const selectedPool = availableStakingPoolsData.find((pool) => pool.id === stakingPoolId);

    if (selectedPool) {
      if (selectedPool?.id === stakingPoolForView?.id) {
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
    
    const selectedPool = availableStakingPoolsData.find((pool) => pool.id === stakingPoolId);

    if (selectedPool) {
        setStakingPoolForStaking(selectedPool);
    }
  }

  const selectStakingPoolForUnstaking = (stakingPoolId: string | null) => {
    if (!stakingPoolId) {
      setStakingPoolForUnstaking(null);
      return;
    }
    
    const selectedPool = availableStakingPoolsData.find((pool) => pool.id === stakingPoolId);

    if (selectedPool) {
        setStakingPoolForUnstaking(selectedPool);
    }
  }

  const combinedStakingPoolsData = availableStakingPoolsData.map((stakingPool) => {
    const userStakingPoolData = userStakingPoolsData.find((userPool) => userPool.address === stakingPool.address);

    return {
      stakingPool,
      userData: userStakingPoolData,
    }
  });

  const combinedSelectedStakingPoolForViewData = stakingPoolForView ? {
    stakingPool: stakingPoolForView,
    userData: userStakingPoolsData.find((userPool) => userPool.address === stakingPoolForView.address),
  } : null;

  const combinedSelectedStakingPoolForStakingData = stakingPoolForStaking ? {
    stakingPool: stakingPoolForStaking,
    userData: userStakingPoolsData.find((userPool) => userPool.address === stakingPoolForStaking.address),
  } : null;

  const combinedSelectedStakingPoolForUnstakingData = stakingPoolForUnstaking ? {
    stakingPool: stakingPoolForUnstaking,
    userData: userStakingPoolsData.find((userPool) => userPool.address === stakingPoolForUnstaking.address),
  } : null;

  return {
    availableStakingPools: availableStakingPoolsData,
    stakingPoolForView: combinedSelectedStakingPoolForViewData,
    stakingPoolForStaking: combinedSelectedStakingPoolForStakingData,
    stakingPoolForUnstaking: combinedSelectedStakingPoolForUnstakingData,
    selectStakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForUnstaking,
    combinedStakingPoolsData,
  };
};

export const StakingPoolsStorage = createContainer(useStakingPoolsStorage);
