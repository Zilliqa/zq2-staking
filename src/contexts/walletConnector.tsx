"use client"

import { useState } from "react"
import { createContainer } from "./context"
import { DummyWallet } from "@/misc/walletsConfig"
import { useAccount, useBalance } from "wagmi"
import { Address } from "viem"

export enum ConnectedWalletType {
  None,
  MockWallet,
  RealWallet,
}

const useWalletConnector = () => {
  /**
   * Dummy Wallet section
   */
  const [isDummyWalletConnected, setIsDummyWalletConnected] = useState(false)
  const [isDummyWalletConnecting, setIsDummyWalletConnecting] = useState(false)
  const [isDummyWalletSelectorOpen, setIsDummyWalletSelectorOpen] =
    useState(false)
  const [dummyWallet, setDummyWallet] = useState<DummyWallet | null>(null)

  const connectDummyWallet = () => {
    setIsDummyWalletConnecting(true)
    setIsDummyWalletSelectorOpen(true)
  }

  const selectDummyWallet = (wallet: DummyWallet) => {
    setDummyWallet(wallet)
    setIsDummyWalletConnected(true)
    setIsDummyWalletSelectorOpen(false)
    setIsDummyWalletConnecting(false)
  }

  const disconnectDummyWallet = () => {
    setIsDummyWalletConnected(false)
    setDummyWallet(null)
    setIsDummyWalletConnecting(false)
    setIsDummyWalletSelectorOpen(false)
  }

  /**
   * Rainbow wallet section
   */
  const walletAccount = useAccount()

  /**
   * Wallet data
   */

  const isWalletConnected = walletAccount.isConnected || isDummyWalletConnected
  const connectedWalletType = isDummyWalletConnected
    ? ConnectedWalletType.MockWallet
    : walletAccount.isConnected
      ? ConnectedWalletType.RealWallet
      : ConnectedWalletType.None

  const walletAddress =
    connectedWalletType === ConnectedWalletType.MockWallet
      ? dummyWallet!.address
      : connectedWalletType === ConnectedWalletType.RealWallet
        ? (walletAccount.address || null)
        : null

  const { data: zilBalanceData, refetch: refetchZilBalance } = useBalance({
    address: walletAddress ? (walletAddress as Address) : undefined,
  })

  let zilAvailable: bigint | null = null

  const updateWalletBalance = () => {
    if (isDummyWalletConnected) {
      return
    }

    refetchZilBalance()
  }

  if (zilBalanceData) {
    zilAvailable = zilBalanceData.value
  } else if (isDummyWalletConnected) {
    zilAvailable = dummyWallet!.currentZil
  }

  return {
    isWalletConnected,
    isDummyWalletConnecting,
    isDummyWalletConnected,
    connectDummyWallet,
    disconnectDummyWallet,
    walletAddress,
    zilAvailable,
    isDummyWalletSelectorOpen,
    selectDummyWallet,
    connectedWalletType,
    updateWalletBalance,
  }
}

export const WalletConnector = createContainer(useWalletConnector)
