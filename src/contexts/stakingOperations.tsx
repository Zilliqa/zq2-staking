import { notification } from "antd";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
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

  const [stakingCallTxHash, setStakingCallTxHash] = useState<Address | undefined>(undefined);

  const {
    isLoading: isStakingInProgress,
    error: stakeContractCallError,
    status: stakingCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: stakingCallTxHash,
  })

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ZIL`);
      setIsDummyWalletPopupOpen(true);
      setStakingCallTxHash("0x1234567890234567890234567890234567890" as Address);
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
      setUnstakingCallTxHash("0x1234567890234567890234567890234567890" as Address);
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
      ).catch(
        (error) => {
          notification.error({
            message: "Unstaking failed",
            description: error?.message || "There was an error while unstaking ZIL",
            placement: "topRight"
          });
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

  const [claimCallTxHash, setClaimCallTxHash] = useState<Address | undefined>(undefined);

  const {
    isLoading: isClaimingInProgress,
    error: claimContractCallError,
    status: claimCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: claimCallTxHash,
  })

  const claim = (delegatorAddress: string) => {
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing/claiming ZIL`);
      setIsDummyWalletPopupOpen(true);
      setClaimCallTxHash("0x1234567890234567890234567890234567890" as Address);
    } else {
      writeContract(
        wagmiConfig,
        {
          address: delegatorAddress as Address,
          abi: delegatorAbi,
          functionName: 'claim',
          args: []
        }
      ).then(
        (txHash) => {
          setClaimCallTxHash(txHash);
        }
      ).catch(
        (error) => {
          notification.error({
            message: "Claiming failed",
            description: error?.message || "There was an error while claiming ZIL",
            placement: "topRight"
          });
        }
      )
    }
  }

  useEffect(
    () => {
      if (claimCallReceiptStatus === "success") {
        notification.success({
          message: "Claiming successful",
          description: `You have successfully claimed ZIL`,
          placement: "topRight"
        });
        reloadUserStakingPoolsData();
        updateWalletBalance();
      } else if (claimCallReceiptStatus === "error") {
        notification.error({
          message: "Claiming failed",
          description: `There was an error while claiming ZIL`,
          placement: "topRight"
        });
      }
    }, [claimCallReceiptStatus]
  )

  /**
   * OTHER
   */

  useEffect(
    function clearStateOnDelegatorChange() {
      setStakingCallTxHash(undefined);
      setUnstakingCallTxHash(undefined);
      setClaimCallTxHash(undefined);
    },
    [stakingPoolId]
  )

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,

    stake,
    isStakingInProgress,
    stakingCallTxHash,
    stakeContractCallError,

    unstake,
    isUnstakingInProgress,
    unstakingCallTxHash,
    unstakeContractCallError,

    claim,
    isClaimingInProgress,
    claimCallTxHash,
    claimContractCallError,
  }

};

export const StakingOperations = createContainer(useStakingOperations);