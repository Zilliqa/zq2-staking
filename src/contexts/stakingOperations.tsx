import { notification } from "antd"
import { useEffect, useState } from "react"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { createContainer } from "./context"
import { WalletConnector } from "./walletConnector"
import { StakingPoolsStorage } from "./stakingPoolsStorage"
import { Address, formatUnits, WriteContractParameters } from "viem"
import { baseDelegatorAbi, nonLiquidDelegatorAbi } from "@/misc/stakingAbis"
import { useConfig } from "wagmi"
import { useGasPrice } from "wagmi"
import { DateTime } from "luxon"
import { getHumanFormDuration } from "@/misc/formatting"

const useTxOperation = (
  isDummyWalletConnected: boolean,
  setDummyWalletPopupContent: ({
    content,
    onOk,
    onCancel,
  }: {
    content: string
    onOk: () => void
    onCancel: () => void
  }) => void,
  setIsDummyWalletPopupOpen: (isOpen: boolean) => void,
  reloadAppUserData: () => void,
  successMessage: string,
  successDescription: string,
  errorMessage: string,
  errorDescription: string
) => {
  const [txHash, setTxHash] = useState<Address | undefined>(undefined)

  const [isTxInPreparation, setIsTxInPreparation] = useState(false)

  const [dummyTxSuccess, setDummyTxSuccess] = useState(false)
  const [dummyTxError, setDummyTxError] = useState(false)

  const {
    isLoading: isTxProcessedByChain,
    error: txContractError,
    status: txReceiptStatus,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const {
    writeContract,
    status: txSubmissionStatus,
    error: txSubmissionError,
    data: currentTxData,
  } = useWriteContract()

  const onDummyWalletOperationPopupOk = () => {
    setDummyTxSuccess(true)
    setIsDummyWalletPopupOpen(false)
    setIsTxInPreparation(false)
    reloadAppUserData()
  }

  const onDummyWalletOperationPopupCancel = () => {
    setDummyTxError(true)
    setIsDummyWalletPopupOpen(false)
    setIsTxInPreparation(false)
    reloadAppUserData()
  }

  const callContract = (txCallParams: WriteContractParameters) => {
    setIsTxInPreparation(true)
    setDummyTxSuccess(false)
    setDummyTxError(false)
    setTxHash(undefined)

    if (isDummyWalletConnected) {
      setDummyWalletPopupContent({
        content: `Now User gonna approve the wallet transaction, and then shown notification with ${successMessage}`,
        onOk: onDummyWalletOperationPopupOk,
        onCancel: onDummyWalletOperationPopupCancel,
      })
      setIsDummyWalletPopupOpen(true)
      setTxHash("0x1234567890234567890234567890234567890" as Address)
    } else {
      try {
        writeContract(txCallParams)
      } catch (error) {
        notification.error({
          message: errorMessage,
          description:
            errorDescription + "\nError while submitting transaction to chain",
          placement: "topRight",
        })
        console.error(error)
      } finally {
        setIsTxInPreparation(false)
      }
    }
  }

  useEffect(() => {
    if (txReceiptStatus === "success" || dummyTxSuccess) {
      notification.success({
        message: successMessage,
        description: successDescription,
        placement: "topRight",
      })
      reloadAppUserData()
    }
  }, [txReceiptStatus, dummyTxSuccess])

  useEffect(() => {
    if (txSubmissionStatus === "success") {
      setTxHash(currentTxData)
    }
  }, [txSubmissionStatus, currentTxData])

  useEffect(() => {
    if (txSubmissionStatus === "error" || dummyTxError) {
      notification.error({
        message: errorMessage,
        description:
          errorDescription + "\nError while submitting transaction to chain",
        placement: "topRight",
      })

      console.error({ txSubmissionStatus, txSubmissionError })
    }
  }, [txSubmissionStatus, dummyTxError])

  useEffect(() => {
    if (txReceiptStatus === "error") {
      notification.error({
        message: errorMessage,
        description:
          errorMessage + "\nError while processing transaction on chain",
        placement: "topRight",
      })

      console.error({ txReceiptStatus, txContractError })
    }
  }, [txReceiptStatus, txSubmissionStatus])

  const clearState = () => {
    setTxHash(undefined)
  }

  return {
    isTxInPreparation: isTxInPreparation || txSubmissionStatus === "pending",
    isTxProcessedByChain: isTxProcessedByChain && !isDummyWalletConnected,
    txHash,
    txContractError,
    callContract,
    clearState,
  }
}

const useStakingOperations = () => {
  const { isDummyWalletConnected, updateWalletBalance, walletAddress } =
    WalletConnector.useContainer()

  const {
    reloadUserStakingPoolsData,
    stakingPoolForView,
    availableStakingPools,
  } = StakingPoolsStorage.useContainer()

  const wagmiConfig = useConfig()

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false)
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<{
    content: string
    onOk: () => void
    onCancel: () => void
  } | null>(null)

  const [
    stakingPoolIdForInProgressOperation,
    setStakingPoolIdForInProgressOperation,
  ] = useState<string | null>(null)

  const stakingPoolId = stakingPoolForView?.stakingPool.definition.id

  const { data: reportedGasPrice } = useGasPrice()

  // eth_gasPrice returned by our chain is consistently lower than the actual gas price
  // so we multiply it by 125% to get a more accurate estimate
  const uppedGasPrice = ((reportedGasPrice || 0n) * 125n) / 100n

  const getGasCostInZil = (estimatedGas: bigint) => {
    return Math.ceil(parseFloat(formatUnits(estimatedGas * uppedGasPrice, 18)))
  }

  const setStakingPoolIdForInProgressOperationByAddress = (address: string) => {
    const pool = availableStakingPools.find(
      (pool) => pool.definition.address === address
    )
    setStakingPoolIdForInProgressOperation(pool?.definition.id || null)
  }

  /**
   * STAKING
   */

  const stakingCallEstimatedGas = 0x1e8480n
  const {
    isTxInPreparation: preparingStakingTx,
    isTxProcessedByChain: submittingStakingTx,
    txHash: stakingCallTxHash,
    callContract: callContractStakeRaw,
    clearState: clearStakingState,
    txContractError: stakeContractCallError,
  } = useTxOperation(
    isDummyWalletConnected,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    () => {
      reloadUserStakingPoolsData()
      updateWalletBalance()
    },
    "✅\u00A0 Staking successful",
    "You have successfully staked ZIL",
    "❌\u00A0 Staking failed",
    "Please try again later or contact support."
  )

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
    setStakingPoolIdForInProgressOperationByAddress(delegatorAddress)
    callContractStakeRaw({
      address: delegatorAddress as Address,
      abi: baseDelegatorAbi,
      functionName: "stake",
      args: [],
      value: weiToStake,
      chain: wagmiConfig.chains[0], // we always have only one chain defined
      account: walletAddress as Address,
    })
  }

  /**
   * UNSTAKING
   */

  const unboudingPeriod = stakingPoolForView?.stakingPool.definition
    .withdrawPeriodInMinutes
    ? getHumanFormDuration(
        DateTime.now().plus({
          minutes:
            stakingPoolForView.stakingPool.definition.withdrawPeriodInMinutes,
        })
      )
    : "the unbonding period"

  const unstakingCallEstimatedGas = 0x1e8480n

  const {
    isTxInPreparation: preparingUnstakingTx,
    isTxProcessedByChain: submittingUnstakingTx,
    txHash: unstakingCallTxHash,
    txContractError: unstakeContractCallError,
    callContract: callContractUnstakeRaw,
    clearState: clearUnstakingState,
  } = useTxOperation(
    isDummyWalletConnected,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    () => {
      reloadUserStakingPoolsData()
      updateWalletBalance()
    },
    "✅\u00A0 Unstaking Requested",
    `You ZIL will be ready to claim in ${unboudingPeriod}`,
    "❌\u00A0 Unstaking failed",
    "Please try again later or contact support."
  )

  const unstake = (delegatorAddress: string, tokensToUnstake: bigint) => {
    setStakingPoolIdForInProgressOperationByAddress(delegatorAddress)
    callContractUnstakeRaw({
      address: delegatorAddress as Address,
      abi: baseDelegatorAbi,
      functionName: "unstake",
      args: [tokensToUnstake],
      chain: wagmiConfig.chains[0], // we always have only one chain defined
      account: walletAddress as Address,
    })
  }

  /**
   * CLAIMING UNSTAKE
   */

  const claimUnstakingCallEstimatedGas = 0x1e8480n

  const {
    isTxInPreparation: preparingClaimUnstakeTx,
    isTxProcessedByChain: submittingClaimUnstakeTx,
    txHash: claimUnstakeCallTxHash,
    txContractError: claimContractCallError,
    callContract: callContractClaimUnstakeRaw,
    clearState: clearClaimUnstakeState,
  } = useTxOperation(
    isDummyWalletConnected,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    () => {
      reloadUserStakingPoolsData()
      updateWalletBalance()
    },
    "🎉\u00A0 Claiming successful",
    "You have successfully claimed your ZIL withdrawals.",
    "❌\u00A0 Claiming failed",
    "There was an error while claiming your ZIL withdrawals."
  )

  const claimUnstake = (delegatorAddress: string) => {
    setStakingPoolIdForInProgressOperationByAddress(delegatorAddress)
    callContractClaimUnstakeRaw({
      address: delegatorAddress as Address,
      abi: baseDelegatorAbi,
      functionName: "claim",
      args: [],
      chain: wagmiConfig.chains[0], // we always have only one chain defined
      account: walletAddress as Address,
    })
  }

  /**
   * CLAIM REWARDS
   */

  const claimRewardCallEstimatedGas = 0x1e8480n

  const {
    isTxInPreparation: preparingClaimRewardTx,
    isTxProcessedByChain: submittingClaimRewardTx,
    txHash: claimRewardCallTxHash,
    txContractError: claimRewardContractCallError,
    callContract: callContractClaimRewardRaw,
    clearState: clearClaimRewardState,
  } = useTxOperation(
    isDummyWalletConnected,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    () => {
      reloadUserStakingPoolsData()
      updateWalletBalance()
    },
    "🎉\u00A0 Claiming rewards successful",
    "You have successfully claimed your ZIL rewards.",
    "❌\u00A0 Claiming rewards failed",
    "There was an error while claiming your ZIL rewards."
  )

  const claimReward = (delegatorAddress: string) => {
    setStakingPoolIdForInProgressOperationByAddress(delegatorAddress)
    callContractClaimRewardRaw({
      address: delegatorAddress as Address,
      abi: nonLiquidDelegatorAbi,
      functionName: "withdrawAllRewards",
      args: [],
      chain: wagmiConfig.chains[0], // we always have only one chain defined
      account: walletAddress as Address,
    })
  }

  /**
   * RESTAKE REWARDS
   */

  const stakeRewardCallEstimatedGas = 0x1e8480n

  const {
    isTxInPreparation: preparingStakeRewardTx,
    isTxProcessedByChain: submittingStakeRewardTx,
    txHash: stakeRewardCallTxHash,
    txContractError: stakeRewardContractCallError,
    callContract: callContractStakeRewardRaw,
    clearState: clearStakeRewardState,
  } = useTxOperation(
    isDummyWalletConnected,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    () => {
      reloadUserStakingPoolsData()
      updateWalletBalance()
    },
    "✅\u00A0 Staking rewards successful",
    "You have successfully staked rewards",
    "❌\u00A0 Staking rewards failed",
    "There was an error while staking rewards"
  )

  const stakeReward = (delegatorAddress: string) => {
    setStakingPoolIdForInProgressOperationByAddress(delegatorAddress)
    callContractStakeRewardRaw({
      address: delegatorAddress as Address,
      abi: nonLiquidDelegatorAbi,
      functionName: "stakeRewards",
      args: [],
      chain: wagmiConfig.chains[0], // we always have only one chain defined
      account: walletAddress as Address,
    })
  }

  /**
   * OTHER
   */

  useEffect(
    function clearStateOnDelegatorChange() {
      clearStakingState()
      clearUnstakingState()
      clearClaimUnstakeState()
      clearClaimRewardState()
      clearStakeRewardState()
    },
    [stakingPoolId]
  )

  const isStakingInProgress = submittingStakingTx || preparingStakingTx
  const isUnstakingInProgress = submittingUnstakingTx || preparingUnstakingTx
  const isClaimingUnstakeInProgress =
    submittingClaimUnstakeTx || preparingClaimUnstakeTx
  const isClaimingRewardInProgress =
    submittingClaimRewardTx || preparingClaimRewardTx
  const isStakingRewardInProgress =
    submittingStakeRewardTx || preparingStakeRewardTx

  const isAnyWalletOperationInProgress =
    isStakingInProgress ||
    isUnstakingInProgress ||
    isClaimingUnstakeInProgress ||
    isClaimingRewardInProgress ||
    isStakingRewardInProgress

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,

    isAnyWalletOperationInProgress,
    stakingPoolIdForInProgressOperation,

    stake,
    preparingStakingTx,
    isStakingInProgress,
    stakingCallTxHash,
    stakeContractCallError,
    stakingCallZilFees: getGasCostInZil(stakingCallEstimatedGas),

    unstake,
    preparingUnstakingTx,
    isUnstakingInProgress,
    unstakingCallTxHash,
    unstakeContractCallError,
    unstakingCallZilFees: getGasCostInZil(unstakingCallEstimatedGas),

    claimUnstake,
    preparingClaimUnstakeTx,
    isClaimingUnstakeInProgress,
    claimUnstakeCallTxHash,
    claimContractCallError,
    claimUnstakeCallZilFees: getGasCostInZil(claimUnstakingCallEstimatedGas),

    claimReward,
    preparingClaimRewardTx,
    isClaimingRewardInProgress,
    claimRewardCallTxHash,
    claimRewardContractCallError,
    claimRewardCallZilFees: getGasCostInZil(claimRewardCallEstimatedGas),

    stakeReward,
    preparingStakeRewardTx,
    isStakingRewardInProgress,
    stakeRewardCallTxHash,
    stakeRewardContractCallError,
    stakeRewardCallZilFees: getGasCostInZil(stakeRewardCallEstimatedGas),
  }
}

export const StakingOperations = createContainer(useStakingOperations)
