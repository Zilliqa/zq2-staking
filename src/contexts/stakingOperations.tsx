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

const useTxOperation = (
  isDummyWalletConnected: boolean,
  setDummyWalletPopupContent: (content: string) => void,
  setIsDummyWalletPopupOpen: (isOpen: boolean) => void,
  reloadAppUserData: () => void,
  successMessage: string,
  successDescription: string,
  errorMessage: string,
  errorDescription: string
) => {
  const [txHash, setTxHash] = useState<Address | undefined>(undefined)

  const [isTxInPreparation, setIsTxInPreparation] = useState(false)

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

  const callContract = (txCallParams: WriteContractParameters) => {
    setIsTxInPreparation(true)

    if (isDummyWalletConnected) {
      setDummyWalletPopupContent(
        `Now User gonna approve the wallet transaction, and then shown notification with ${successMessage}`
      )
      setIsDummyWalletPopupOpen(true)
      setTxHash("0x1234567890234567890234567890234567890" as Address)
      setIsTxInPreparation(false)
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
    if (txReceiptStatus === "success") {
      notification.success({
        message: successMessage,
        description: successDescription,
        placement: "topRight",
      })
      reloadAppUserData()
    }
  }, [txReceiptStatus])

  useEffect(() => {
    if (txSubmissionStatus === "success") {
      setTxHash(currentTxData)
    }
  }, [txSubmissionStatus, currentTxData])

  useEffect(() => {
    if (txSubmissionStatus === "error") {
      notification.error({
        message: errorMessage,
        description:
          errorDescription + "\nError while submitting transaction to chain",
        placement: "topRight",
      })

      console.error({ txSubmissionStatus, txSubmissionError })
    }
  }, [txSubmissionStatus])

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
    isTxProcessedByChain,
    txHash,
    txContractError,
    callContract,
    clearState,
  }
}

const useStakingOperations = () => {
  const { isDummyWalletConnected, updateWalletBalance, walletAddress } =
    WalletConnector.useContainer()

  const { reloadUserStakingPoolsData, stakingPoolForView } =
    StakingPoolsStorage.useContainer()

  const wagmiConfig = useConfig()

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false)
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<
    string | null
  >(null)

  const stakingPoolId = stakingPoolForView?.stakingPool.definition.id

  const { data: reportedGasPrice } = useGasPrice()

  // eth_gasPrice returned by our chain is consistently lower than the actual gas price
  // so we multiply it by 125% to get a more accurate estimate
  const uppedGasPrice = ((reportedGasPrice || 0n) * 125n) / 100n

  const getGasCostInZil = (estimatedGas: bigint) => {
    return Math.ceil(parseFloat(formatUnits(estimatedGas * uppedGasPrice, 18)))
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
    "Staking successful",
    "You have successfully staked ZIL",
    "Staking failed",
    "There was an error while staking ZIL"
  )

  const stake = (delegatorAddress: string, weiToStake: bigint) => {
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
    "Unstaking successful",
    "You have successfully unstaked ZIL",
    "Unstaking failed",
    "There was an error while unstaking ZIL"
  )

  const unstake = (delegatorAddress: string, tokensToUnstake: bigint) => {
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
    "Claiming successful",
    "You have successfully claimed ZIL",
    "Claiming failed",
    "There was an error while claiming ZIL"
  )

  const claimUnstake = (delegatorAddress: string) => {
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
    "Claiming rewards successful",
    "You have successfully claimed rewards",
    "Claiming rewards failed",
    "There was an error while claiming rewards"
  )

  const claimReward = (delegatorAddress: string) => {
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
    "Staking rewards successful",
    "You have successfully staked rewards",
    "Staking rewards failed",
    "There was an error while staking rewards"
  )

  const stakeReward = (delegatorAddress: string) => {
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

  return {
    isDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setIsDummyWalletPopupOpen,

    stake,
    preparingStakingTx,
    isStakingInProgress: submittingStakingTx || preparingStakingTx,
    stakingCallTxHash,
    stakeContractCallError,
    stakingCallZilFees: getGasCostInZil(stakingCallEstimatedGas),

    unstake,
    preparingUnstakingTx,
    isUnstakingInProgress: submittingUnstakingTx || preparingUnstakingTx,
    unstakingCallTxHash,
    unstakeContractCallError,
    unstakingCallZilFees: getGasCostInZil(unstakingCallEstimatedGas),

    claimUnstake,
    preparingClaimUnstakeTx,
    isClaimingUnstakeInProgress:
      submittingClaimUnstakeTx || preparingClaimUnstakeTx,
    claimUnstakeCallTxHash,
    claimContractCallError,
    claimUnstakeCallZilFees: getGasCostInZil(claimUnstakingCallEstimatedGas),

    claimReward,
    preparingClaimRewardTx,
    isClaimingRewardInProgress:
      submittingClaimRewardTx || preparingClaimRewardTx,
    claimRewardCallTxHash,
    claimRewardContractCallError,
    claimRewardCallZilFees: getGasCostInZil(claimRewardCallEstimatedGas),

    stakeReward,
    preparingStakeRewardTx,
    isStakingRewardInProgress:
      submittingStakeRewardTx || preparingStakeRewardTx,
    stakeRewardCallTxHash,
    stakeRewardContractCallError,
    stakeRewardCallZilFees: getGasCostInZil(stakeRewardCallEstimatedGas),
  }
}

export const StakingOperations = createContainer(useStakingOperations)
