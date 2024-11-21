"use client";

import { useEffect, useState } from "react";
import { createContainer } from "./context";
import { WalletConnector } from "./walletConnector";
import { dummyWallets } from "./dummyWalletsData";
import { DateTime } from "luxon";

export interface StakingPoolDefinition {
  id: string;
  name: string;
  address: string;
  tokenSymbol: string;
}

export interface StakingPoolData extends StakingPoolDefinition {
  tvl: number;
  apy: number;
  commission: number;
  votingPower: number;
  zilToTokenRate: number;
}

export interface UserStakingPoolData {
  address: string;
  stakedZil: number;
  rewardAcumulated: number;
}

export interface UserUnstakingPoolData {
  address: string;
  unstakedZil: number;
  availableAt: DateTime;
}

const useStakingPoolsStorage = () => {

  const {
    walletAddress,
  } = WalletConnector.useContainer();

  const [availableStakingPoolsData, setAvailableStakingPoolsData] = useState<StakingPoolData[]>([
    {
      id: "pool1",
      name: "Avely",
      tvl: 3621786,
      apy: 0.135,
      address: "0x1234567890234567890234567890234567890",
      commission: 0.1,
      tokenSymbol: "avZIL",
      votingPower: 0.3,
      zilToTokenRate: 1.2,
    },
    {
      id: "pool2",
      name: "Plunderswap",
      tvl: 0,
      apy: 0.21,
      address: "0x82245678902345678902345678918278372382",
      commission: 0.011,
      tokenSymbol: "plZIL",
      votingPower: 0.5,
      zilToTokenRate: 1.1,
    },
    {
      id: "pool3",
      name: "IgniteDao",
      tvl: 98173829,
      apy: 1.1,
      address: "0x96525678902345678902345678918278372212",
      commission: 0.05,
      tokenSymbol: "igZIL",
      votingPower: 0.2,
      zilToTokenRate: 1.3,
    },
  ]);

  const [userStakingPoolsData, setUserStakingPoolsData] = useState<UserStakingPoolData[]>([]);
  const [userUnstakesData, setUserUnstakesData] = useState<UserUnstakingPoolData[]>([]);

  const [stakingPoolForView, setSelectedStakingPool] = useState<StakingPoolData | null>(null);

  const [stakingPoolForStaking, setStakingPoolForStaking] = useState<StakingPoolData | null>(null);
  const [stakingPoolForUnstaking, setStakingPoolForUnstaking] = useState<StakingPoolData | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setUserStakingPoolsData([]);
      return
    }

    const dummyWallet = dummyWallets.find((wallet) => wallet.address === walletAddress);

    console.log({dummyWallet})

    setUserStakingPoolsData(dummyWallet?.stakedZil || []);
    setUserUnstakesData(dummyWallet?.unstakedZil || []);

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
  }).toSorted(
    (a, b) => (b.userData?.stakedZil) || 0 - (a.userData?.stakedZil || 0)
  );

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

  const combinedUserUnstakesData = userUnstakesData?.map(
    (unstakeInfo) => ({
      unstakeInfo,
      stakingPool: availableStakingPoolsData.find((pool) => pool.address === unstakeInfo.address)!,
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
  };
};

export const StakingPoolsStorage = createContainer(useStakingPoolsStorage);
