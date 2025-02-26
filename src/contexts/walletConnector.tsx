"use client"

import { useState } from "react"
import { createContainer } from "./context"
import { DummyWallet } from "@/misc/walletsConfig"
import { useBalance, useWalletClient } from "wagmi"
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
  const { data: walletClient } = useWalletClient()

  /**
   * Wallet data
   */

  const isWalletConnected = walletClient || isDummyWalletConnected
  const connectedWalletType = walletClient
    ? ConnectedWalletType.RealWallet
    : isDummyWalletConnected
      ? ConnectedWalletType.MockWallet
      : ConnectedWalletType.None
  const walletAddress = walletClient
    ? walletClient.account.address
    : isDummyWalletConnected
      ? dummyWallet!.address
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
