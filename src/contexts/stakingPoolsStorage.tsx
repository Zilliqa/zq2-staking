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
  iconUrl: string;
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
      iconUrl: "https://s3-alpha-sig.figma.com/img/61c4/4c89/841470420747e601fc2ea576aa764035?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=AGLzBVt1vnqOYfEMQnO-ag5Cb5bhAHJM7gerO0cgTIqH0IhYaLHCo43kyxsnjO~0eNyBKSyb12AJq0seSxxNlk3pK0H4rlnDMU~~zzzKfTulzG5FLVsqxuj9ml2ptwSas9DE9XqE0R3FUS2vEZQ5AAqjXn5Iyyu0whvZW9uJOLUv7RI3Kg6frKgygJ0rk93P8x7v6qvmR30dsMj3veW3NDweOdBDlg8Py1mzG03FyWpH-CssfnZd6mB9EB~F5QBWOyT6-zdMdwlKqNE0rmkDP2DVvyzbxOZ3260hmN0KAyEjub7nsMvS1BAOEs3r5-KsJmbC15xi~rdSSjqN8vOolg__",
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
      iconUrl: "https://s3-alpha-sig.figma.com/img/2ca2/a42f/2aa597581d9be859cb7d2dbf2627158d?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KWWtZ40rI4JUJAkyMiq2tMfSD-mAnYgeYTg4KiMHKDYafaHwSZuU-B~UcJXbZ3USiEyQ-f6nQlyIsagx6gBvxgXscagArYv7pyf8fvDKdjcytU6I7oR~-yVHObhcGvtghJIHPY6tkBh4glYAnlKO9T5MCkErgP9fYkmJbBJnihZZkpXGaa-kn7lK1Gsf1NRIdN2IIysDl9VENNwHXhrvriJ4MBDDDShljucVySx9a~wWpgLLjts3ANM8XuhYMibEsi3hJO~02fBgEFavqkFa7OubO-P-3eLn9oSvj8jRfQ~nZQtDPW--T8q-bewA5Vr3fBP3CZTwcqvD1x9eNlrA2g__",
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
      iconUrl: "https://s3-alpha-sig.figma.com/img/0bfc/9d81/e1d79f2bdbb4c35189e9f40542c717fd?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=RteWH2pH46bprRkRTcLUJKR5eglmDQ-KUbEMQvSwu~0GrDloIdwhe6c6hUWQM0JIAujQCKjXkMkGr-eSERHilS3s2yI8s4edI3R-AMFod2GHIWQ~eFsX5ToxthTRBwMldbzW2ybwmUAuUpatfGZrcJ8YmptOztoueBR14gqsMFNll277aNQTUSaM2fq2O~GZCVazYTNFwQGw84G-jadWiVjtef1lPWgX2yf8g1NgXjaPwlFlhhVXY32BBs1ghpCO0I~IESNPjT9QeD-otvL3l5JF0GoT1hnaHFC6LRF9nMFqkZZ-nuwVCXjhTthojlJe7aKj5huVzbRgqBhqXC~yTg__",
    },
    {
      id: "pool4",
      name: "ADAMine",
      tvl: 100,
      apy: 0.13,
      address: "0x965256789023456789023456789182783K92Uh",
      commission: 0.01,
      tokenSymbol: "adaZIL",
      votingPower: 0.01,
      zilToTokenRate: 1,
      iconUrl: "https://cdn4.iconfinder.com/data/icons/crypto-currency-and-coin-2/256/cardano_ada-512.png",
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
    userData: {
      staked: userStakingPoolsData.find((userPoolData) => userPoolData.address === stakingPoolForView.address),
      unstaked: userUnstakesData.filter((userPoolData) => userPoolData.address === stakingPoolForView.address)
    }
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
