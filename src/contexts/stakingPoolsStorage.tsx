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
      apy: 0.13,
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

  const [selectedStakingPool, setSelectedStakingPool] = useState<StakingPoolData | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      return
    }

    setUserStakingPoolsData(dummyWallets.find((wallet) => wallet.address === walletAddress)?.stakedZil || []);

  }, [walletAddress]);

  const selectStakingPool = (stakingPoolId: string) => {
    const selectedPool = availableStakingPoolsData.find((pool) => pool.id === stakingPoolId);

    if (selectedPool) {
      if (selectedPool?.id === selectedStakingPool?.id) {
        setSelectedStakingPool(null);
      } else {
        setSelectedStakingPool(selectedPool);
      }
    }
  }

  const combinedStakingPoolsData = availableStakingPoolsData.map((stakingPool) => {
    const userStakingPoolData = userStakingPoolsData.find((userPool) => userPool.address === stakingPool.address);

    return {
      stakingPool,
      userData: userStakingPoolData,
    }
  });

  return {
    availableStakingPools: availableStakingPoolsData,
    selectedStakingPool,
    selectStakingPool,
    combinedStakingPoolsData,
  };
};

export const StakingPoolsStorage = createContainer(useStakingPoolsStorage);
