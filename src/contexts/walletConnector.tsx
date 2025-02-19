"use client"

import { useEffect, useState } from "react"
import { createContainer } from "./context"
import { DummyWallet } from "@/misc/walletsConfig"
import { useWalletClient } from "wagmi"
import { getBalance } from "viem/actions"
import { Address } from "viem"
import { getViemClient } from "@/misc/chainConfig"
import { AppConfigStorage } from "./appConfigStorage"

export enum ConnectedWalletType {
  None,
  MockWallet,
  RealWallet,
}

const useWalletConnector = () => {
  const [zilAvailable, setZilAvailable] = useState<bigint | null>(null)

  const { appConfig } = AppConfigStorage.useContainer()

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
    setTimeout(() => {
      setZilAvailable(wallet.currentZil)
    }, 1500)

    setIsDummyWalletConnected(true)
    setIsDummyWalletSelectorOpen(false)
    setIsDummyWalletConnecting(false)
  }

  const disconnectDummyWallet = () => {
    setIsDummyWalletConnected(false)
    setDummyWallet(null)
    setIsDummyWalletConnecting(false)
    setIsDummyWalletSelectorOpen(false)
    setZilAvailable(0n)
  }

  /**
   * Rainbow wallet section
   */
  const { data: walletClient } = useWalletClient()

  /**
   * Wallet data
   */

  console.log({ walletClient })

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

  const updateWalletBalance = () => {
    if (!walletAddress) {
      setZilAvailable(null)
      return
    }

    if (isDummyWalletConnected) {
      setZilAvailable(dummyWallet!.currentZil)
      return
    }

    getBalance(getViemClient(appConfig.chainId), {
      address: walletAddress as Address,
    }).then((balanceInWei) => {
      setZilAvailable(balanceInWei)
    })
  }

  useEffect(updateWalletBalance, [walletAddress])

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
