import { notification } from "antd";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { createContainer } from "./context";
import { WalletConnector } from "./walletConnector";
import { StakingPoolsStorage } from "./stakingPoolsStorage";
import { Address } from "viem";
import { delegatorAbi } from "@/misc/stakingAbis";
import { writeContract } from "wagmi/actions";
import { useConfig } from 'wagmi'

const useStakingOperations = () => {

  const {
    isDummyWalletConnected,
    updateWalletBalance,
  } = WalletConnector.useContainer();

  const {
    reloadUserStakingPoolsData,
    stakingPoolForView,
  } = StakingPoolsStorage.useContainer();

  const wagmiConfig = useConfig()

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false);
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<string | null>(null);

  const stakingPoolId = stakingPoolForView?.stakingPool.definition.id;

  /**
   * STAKING
   */

  const [staingCallTxHash, setStakingCallTxHash] = useState<Address | undefined>(undefined);

  const {
    isLoading: isStakingInProgress,
    error: stakeContractCallError,
    status: stakingCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: staingCallTxHash,
  })

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ZIL`);
      setIsDummyWalletPopupOpen(true);
    } else {
      writeContract(
        wagmiConfig,
        {
          address: delegatorAddress as Address,
          abi: delegatorAbi,
          functionName: 'stake',
          args: [],
          value: weiToStake
        }
      ).then(
        (txHash) => {
          setStakingCallTxHash(txHash);
        }
      ).catch(
        (error) => {
          notification.error({
            message: "Staking failed",
            description: error?.message || "There was an error while staking ZIL",
            placement: "topRight"
          });
        }
      )
    }
  }

  useEffect(
    () => {
      if (stakingCallReceiptStatus === "success") {
        notification.success({
          message: "Staking successful",
          description: `You have successfully staked ZIL`,
          placement: "topRight"
        });
        reloadUserStakingPoolsData();
        updateWalletBalance();
      } else if (stakingCallReceiptStatus === "error") {
        notification.error({
          message: "Staking failed",
          description: `There was an error while staking ZIL`,
          placement: "topRight"
        });
      }
    }, [stakingCallReceiptStatus]
  )

  /**
   * UNSTAKING
   */

  const [unstakingCallTxHash, setUnstakingCallTxHash] = useState<Address | undefined>(undefined);

  const {
    isLoading: isUnstakingInProgress,
    error: unstakeContractCallError,
    status: unstakeCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: unstakingCallTxHash,
  })

  const unstake = (delegatorAddress: string, tokensToUnstake: bigint) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for unstaking ${tokensToUnstake} staked tokens`);
      setIsDummyWalletPopupOpen(true);
    } else {
      writeContract(
        wagmiConfig,
        {
          address: delegatorAddress as Address,
          abi: delegatorAbi,
          functionName: 'unstake',
          args: [tokensToUnstake]
        }
      ).then(
        (txHash) => {
          setUnstakingCallTxHash(txHash);
        }
      )
    }
  }

  useEffect(
    () => {
      if (unstakeCallReceiptStatus === "success") {
        notification.success({
          message: "Unstaking successful",
          description: `You have successfully unstaked ZIL`,
          placement: "topRight"
        });
        reloadUserStakingPoolsData();
        updateWalletBalance();
      } else if (unstakeCallReceiptStatus === "error") {
        notification.error({
          message: "Unstaking failed",
          description: `There was an error while unstaking ZIL`,
          placement: "topRight"
        });
      }
    }, [unstakeCallReceiptStatus]
  )

  /**
   * CLAIMING
   */

  const claim = (zilToStake: bigint) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing/claiming ${zilToStake} ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  /**
   * OTHER
   */

  useEffect(
    function clearStateOnDelegatorChange() {
      setStakingCallTxHash(undefined);
      setUnstakingCallTxHash(undefined);
    },
    [stakingPoolId]
  )

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    stake,
    unstake,
    claim,
    isStakingInProgress,
    staingCallTxHash,
    stakeContractCallError,
    isUnstakingInProgress,
    unstakeContractCallError,
  }

};

export const StakingOperations = createContainer(useStakingOperations);