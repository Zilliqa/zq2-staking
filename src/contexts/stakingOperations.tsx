import { notification } from "antd"
import { useEffect, useState } from "react"
import { useWaitForTransactionReceipt } from "wagmi"
import { createContainer } from "./context"
import { WalletConnector } from "./walletConnector"
import { StakingPoolsStorage } from "./stakingPoolsStorage"
import { Address } from "viem"
import { baseDelegatorAbi, nonLiquidDelegatorAbi } from "@/misc/stakingAbis"
import { writeContract } from "wagmi/actions"
import { useConfig } from "wagmi"

const useStakingOperations = () => {
  const { isDummyWalletConnected, updateWalletBalance } =
    WalletConnector.useContainer()

  const { reloadUserStakingPoolsData, stakingPoolForView } =
    StakingPoolsStorage.useContainer()

  const wagmiConfig = useConfig()

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false)
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<
    string | null
  >(null)

  const stakingPoolId = stakingPoolForView?.stakingPool.definition.id

  /**
   * STAKING
   */

  const [stakingCallTxHash, setStakingCallTxHash] = useState<
    Address | undefined
  >(undefined)
  const [preparingStakingTx, setPreparingStakingTx] = useState(false)

  const {
    isLoading: submittingStakingTx,
    error: stakeContractCallError,
    status: stakingCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: stakingCallTxHash,
  })

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
    setPreparingStakingTx(true)

    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        "Now User gonna approve the wallet transaction for staking ZIL"
      )
      setIsDummyWalletPopupOpen(true)
      setStakingCallTxHash("0x1234567890234567890234567890234567890" as Address)
      setPreparingStakingTx(false)
    } else {
      writeContract(wagmiConfig, {
        address: delegatorAddress as Address,
        abi: baseDelegatorAbi,
        functionName: "stake",
        args: [],
        value: weiToStake,
      })
        .then((txHash) => {
          setStakingCallTxHash(txHash)
        })
        .catch((error) => {
          notification.error({
            message: "Staking failed",
            description:
              error?.message || "There was an error while staking ZIL",
            placement: "topRight",
          })
        })
        .finally(() => setPreparingStakingTx(false))
    }
  }

  useEffect(() => {
    if (stakingCallReceiptStatus === "success") {
      notification.success({
        message: "Staking successful",
        description: "You have successfully staked ZIL",
        placement: "topRight",
      })
      reloadUserStakingPoolsData()
      updateWalletBalance()
    } else if (stakingCallReceiptStatus === "error") {
      notification.error({
        message: "Staking failed",
        description: "There was an error while staking ZIL",
        placement: "topRight",
      })
    }
  }, [stakingCallReceiptStatus])

  /**
   * UNSTAKING
   */

  const [unstakingCallTxHash, setUnstakingCallTxHash] = useState<
    Address | undefined
  >(undefined)
  const [preparingUnstakingTx, setPreparingUnstakingTx] = useState(false)

  const {
    isLoading: submittingUnstakingTx,
    error: unstakeContractCallError,
    status: unstakeCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: unstakingCallTxHash,
  })

  const unstake = (delegatorAddress: string, tokensToUnstake: bigint) => {
    setPreparingUnstakingTx(true)
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        `Now User gonna approve the wallet transaction for unstaking ${tokensToUnstake} staked tokens`
      )
      setIsDummyWalletPopupOpen(true)
      setUnstakingCallTxHash(
        "0x1234567890234567890234567890234567890" as Address
      )
      setPreparingUnstakingTx(false)
    } else {
      writeContract(wagmiConfig, {
        address: delegatorAddress as Address,
        abi: baseDelegatorAbi,
        functionName: "unstake",
        args: [tokensToUnstake],
      })
        .then((txHash) => {
          console.log("txHash", txHash)
          setUnstakingCallTxHash(txHash)
        })
        .catch((error) => {
          notification.error({
            message: "Unstaking failed",
            description:
              error?.message || "There was an error while unstaking ZIL",
            placement: "topRight",
          })
        })
        .finally(() => setPreparingUnstakingTx(false))
    }
  }

  useEffect(() => {
    if (unstakeCallReceiptStatus === "success") {
      notification.success({
        message: "Unstaking successful",
        description: "You have successfully unstaked ZIL",
        placement: "topRight",
      })
      reloadUserStakingPoolsData()
      updateWalletBalance()
    } else if (unstakeCallReceiptStatus === "error") {
      notification.error({
        message: "Unstaking failed",
        description: "There was an error while unstaking ZIL",
        placement: "topRight",
      })
    }
  }, [unstakeCallReceiptStatus])

  /**
   * CLAIMING UNSTAKE
   */

  const [claimUnstakeCallTxHash, setClaimUnstakeCallTxHash] = useState<
    Address | undefined
  >(undefined)
  const [preparingClaimUnstakeTx, setPreparingClaimUnstakeTx] = useState(false)

  const {
    isLoading: submittingClaimUnstakeTx,
    error: claimContractCallError,
    status: claimCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: claimUnstakeCallTxHash,
  })

  const claimUnstake = (delegatorAddress: string) => {
    setPreparingClaimUnstakeTx(true)
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        "Now User gonna approve the wallet transaction for withdrawing/claiming ZIL"
      )
      setIsDummyWalletPopupOpen(true)
      setClaimUnstakeCallTxHash(
        "0x1234567890234567890234567890234567890" as Address
      )
      setPreparingClaimUnstakeTx(false)
    } else {
      writeContract(wagmiConfig, {
        address: delegatorAddress as Address,
        abi: baseDelegatorAbi,
        functionName: "claim",
        args: [],
      })
        .then((txHash) => {
          setClaimUnstakeCallTxHash(txHash)
        })
        .catch((error) => {
          notification.error({
            message: "Claiming failed",
            description:
              error?.message || "There was an error while claiming ZIL",
            placement: "topRight",
          })
        })
        .finally(() => setPreparingClaimUnstakeTx(false))
    }
  }

  useEffect(() => {
    if (claimCallReceiptStatus === "success") {
      notification.success({
        message: "Claiming successful",
        description: "You have successfully claimed ZIL",
        placement: "topRight",
      })
      reloadUserStakingPoolsData()
      updateWalletBalance()
    } else if (claimCallReceiptStatus === "error") {
      notification.error({
        message: "Claiming failed",
        description: "There was an error while claiming ZIL",
        placement: "topRight",
      })
    }
  }, [claimCallReceiptStatus])

  /**
   * CLAIM REWARDS
   */

  const [claimRewardCallTxHash, setClaimRewardCallTxHash] = useState<
    Address | undefined
  >(undefined)
  const [preparingClaimRewardTx, setPreparingClaimRewardTx] = useState(false)

  const {
    isLoading: submittingClaimRewardTx,
    error: claimRewardContractCallError,
    status: claimRewardCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: claimRewardCallTxHash,
  })

  const claimReward = (delegatorAddress: string) => {
    setPreparingClaimRewardTx(true)
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        "Now User gonna approve the wallet transaction for claiming rewards"
      )
      setIsDummyWalletPopupOpen(true)
      setClaimRewardCallTxHash(
        "0x1234567890234567890234567890234567890" as Address
      )
      setPreparingClaimRewardTx(false)
    } else {
      writeContract(wagmiConfig, {
        address: delegatorAddress as Address,
        abi: nonLiquidDelegatorAbi,
        functionName: "withdrawAllRewards",
        args: [],
      })
        .then((txHash) => {
          setClaimRewardCallTxHash(txHash)
        })
        .catch((error) => {
          notification.error({
            message: "Claiming rewards failed",
            description:
              error?.message || "There was an error while claiming reward ZIL",
            placement: "topRight",
          })
        })
        .finally(() => setPreparingClaimRewardTx(false))
    }
  }

  useEffect(() => {
    if (claimRewardCallReceiptStatus === "success") {
      notification.success({
        message: "Claiming rewards successful",
        description: "You have successfully claimed rewards",
        placement: "topRight",
      })
      reloadUserStakingPoolsData()
      updateWalletBalance()
    } else if (claimRewardCallReceiptStatus === "error") {
      notification.error({
        message: "Claiming rewards failed",
        description: "There was an error while claiming rewards",
        placement: "topRight",
      })
    }
  }, [claimRewardCallReceiptStatus])

  /**
   * RESTAKE REWARDS
   */

  const [stakeRewardCallTxHash, setStakeRewardCallTxHash] = useState<
    Address | undefined
  >(undefined)
  const [preparingStakeRewardTx, setPreparingStakeRewardTx] = useState(false)

  const {
    isLoading: submittingStakeRewardTx,
    error: stakeRewardContractCallError,
    status: stakeRewardCallReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: stakeRewardCallTxHash,
  })

  const stakeReward = (delegatorAddress: string) => {
    setPreparingStakeRewardTx(true)
    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        "Now User gonna approve the wallet transaction for staking rewards"
      )
      setIsDummyWalletPopupOpen(true)
      setStakeRewardCallTxHash(
        "0x1234567890234567890234567890234567890" as Address
      )
      setPreparingStakeRewardTx(false)
    } else {
      writeContract(wagmiConfig, {
        address: delegatorAddress as Address,
        abi: nonLiquidDelegatorAbi,
        functionName: "stakeRewards",
        args: [],
      })
        .then((txHash) => {
          setStakeRewardCallTxHash(txHash)
        })
        .catch((error) => {
          notification.error({
            message: "Staking rewards failed",
            description:
              error?.message || "There was an error while staking rewards",
            placement: "topRight",
          })
        })
        .finally(() => setPreparingStakeRewardTx(false))
    }
  }

  useEffect(() => {
    if (stakeRewardCallReceiptStatus === "success") {
      notification.success({
        message: "Staking rewards successful",
        description: "You have successfully staked rewards",
        placement: "topRight",
      })
      reloadUserStakingPoolsData()
      updateWalletBalance()
    } else if (stakeRewardCallReceiptStatus === "error") {
      notification.error({
        message: "Staking rewards failed",
        description: "There was an error while staking rewards",
        placement: "topRight",
      })
    }
  }, [stakeRewardCallReceiptStatus])

  /**
   * OTHER
   */

  useEffect(
    function clearStateOnDelegatorChange() {
      setStakingCallTxHash(undefined)
      setUnstakingCallTxHash(undefined)
      setClaimUnstakeCallTxHash(undefined)
    },
    [stakingPoolId]
  )

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,

    stake,
    isStakingInProgress: submittingStakingTx || preparingStakingTx,
    stakingCallTxHash,
    stakeContractCallError,

    unstake,
    isUnstakingInProgress: submittingUnstakingTx || preparingUnstakingTx,
    unstakingCallTxHash,
    unstakeContractCallError,

    claimUnstake,
    isClaimingUnstakeInProgress:
      submittingClaimUnstakeTx || preparingClaimUnstakeTx,
    claimUnstakeCallTxHash,
    claimContractCallError,

    claimReward,
    isClaimingRewardInProgress:
      submittingClaimRewardTx || preparingClaimRewardTx,
    claimRewardCallTxHash,
    claimRewardContractCallError,

    stakeReward,
    isStakingRewardInProgress:
      submittingStakeRewardTx || preparingStakeRewardTx,
    stakeRewardCallTxHash,
    stakeRewardContractCallError,
  }
}

export const StakingOperations = createContainer(useStakingOperations)
