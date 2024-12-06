import { notification } from "antd";
import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import { createContainer } from "./context";
import { WalletConnector } from "./walletConnector";
import { StakingPoolsStorage } from "./stakingPoolsStorage";
import { Address } from "viem";

const useStakingOperations = () => {

  const {
    isDummyWalletConnected,
    updateWalletBalance,
  } = WalletConnector.useContainer();

  const {
    reloadUserStakingPoolsData,
  } = StakingPoolsStorage.useContainer();

  const { 
    data: staingCallTxHash, 
    isPending: isStakingInProgress,
    writeContract: stakeContractCall,
    status: stakeContractCallStatus,
  } = useWriteContract()

  const { 
    data: unstakingCallTxHash, 
    isPending: isUnstakingInProgress,
    writeContract: unstakeContractCall,
    status: unstakeContractCallStatus,
    error: unstakeContractCallError,
  } = useWriteContract()

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false);
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<string | null>(null);

  const delegatorAbi = [
    {
      "inputs": [],
      "name": "stake",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "unstake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  /**
   * STAKING
   */

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ZIL`);
      setIsDummyWalletPopupOpen(true);
    } else {
      stakeContractCall({
        address: delegatorAddress as Address,
        abi: delegatorAbi,
        functionName: 'stake',
        args: [],
        value: weiToStake
      });
    }
  }

  useEffect(
    function communicateStakingStatus() {
      if (stakeContractCallStatus === "pending") {
        notification.info({
          message: "Staking in progress",
          description: `You have started staking ZIL`,
          placement: "topRight"
        });
      } else if (stakeContractCallStatus === "success") {
        notification.success({
          message: "Staking successful",
          description: `You have successfully staked ZIL`,
          placement: "topRight"
        });
        setTimeout(
          () => {
            reloadUserStakingPoolsData();
            updateWalletBalance();
          },
          2000 // arbitrary time to make sure API serves new data
        );
      } else if (stakeContractCallStatus === "error") {
        notification.error({
          message: "Staking failed",
          description: `There was an error while staking ZIL`,
          placement: "topRight"
        });
      }
    },
    [stakeContractCallStatus]
  )

  /**
   * UNSTAKING
   */

  const unstake = (delegatorAddress: string, tokensToUnstake: bigint) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for unstaking ${tokensToUnstake} staked tokens`);
      setIsDummyWalletPopupOpen(true);
    } else {
      unstakeContractCall({
        address: delegatorAddress as Address,
        abi: delegatorAbi,
        functionName: 'unstake',
        args: [tokensToUnstake]
      });
    }
  }

  useEffect(
    function communicateUnstakingStatus() {
      if (unstakeContractCallStatus === "pending") {
        notification.info({
          message: "Unstaking in progress",
          description: `You have started unstaking ZIL`,
          placement: "topRight"
        });
      } else if (unstakeContractCallStatus === "success") {
        notification.success({
          message: "Unstaking successful",
          description: `You have successfully unstaked ZIL`,
          placement: "topRight"
        });
        setTimeout(
          () => {
            reloadUserStakingPoolsData();
            updateWalletBalance();
          },
          2000 // arbitrary time to make sure API serves new data
        );
      } else if (unstakeContractCallStatus === "error") {
        notification.error({
          message: "Unstaking failed",
          description: `There was an error while unstaking ZIL`,
          placement: "topRight"
        });
      }
    },
    [unstakeContractCallStatus]
  )

  /**
   * CLAIMING
   */

  const claim = (zilToStake: bigint) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing/claiming ${zilToStake} ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    stake,
    unstake,
    claim,
    isStakingInProgress,
    isUnstakingInProgress,
    unstakeContractCallError,
  }

};

export const StakingOperations = createContainer(useStakingOperations);