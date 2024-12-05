"use client";

import { useEffect, useState } from "react";
import { createContainer } from "./context";
import { DummyWallet } from "@/misc/walletsConfig";
import { useWalletClient, useBalance } from "wagmi";

export enum ConnectedWalletType {
  None,
  MockWallet,
  RealWallet
}

const useWalletConnector = () => {
  const [zilAvailable, setZilAvailable] = useState<bigint | null>(null);

  /**
   * Dummy Wallet section
   */
  const [isDummyWalletConnected, setIsDummyWalletConnected] = useState(false);
  const [isDummyWalletConnecting, setIsDummyWalletConnecting] = useState(false);
  const [isDummyWalletSelectorOpen, setIsDummyWalletSelectorOpen] = useState(false);
  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false);
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<string | null>(null);
  const [dummyWallet, setDummyWallet] = useState<DummyWallet | null>(null);

  const connectDummyWallet = () => {
    setIsDummyWalletConnecting(true);
    setIsDummyWalletSelectorOpen(true);
  }

  const selectDummyWallet = (wallet: DummyWallet) => {
    setDummyWallet(wallet);
    setTimeout(
      () => {
        setZilAvailable(wallet.currentZil);
      },
      1500
    )

    setIsDummyWalletConnected(true);
    setIsDummyWalletSelectorOpen(false);
    setIsDummyWalletConnecting(false);
  }

  const disconnectDummyWallet = () => {
    setIsDummyWalletConnected(false);
    setDummyWallet(null);
    setIsDummyWalletConnecting(false);
    setIsDummyWalletSelectorOpen(false);
    setZilAvailable(0n);
  };

  /**
   * Rainbow wallet section
   */

  const {
    data: walletClient,
  } = useWalletClient();

  const {
    data: realWalletBalance,
  } = useBalance();

  useEffect(
    function updateZilBalanceOfRainbowWallet() {
      
      setZilAvailable(realWalletBalance?.value !== undefined ? realWalletBalance.value : null);
    },
    [realWalletBalance]
  );

  /**
   * Wallet data
   */

  const isWalletConnected = walletClient || isDummyWalletConnected;
  const connectedWalletType = walletClient ? ConnectedWalletType.RealWallet : isDummyWalletConnected ? ConnectedWalletType.MockWallet : ConnectedWalletType.None;
  const walletAddress = walletClient ? walletClient.account.address : isDummyWalletConnected ? dummyWallet!.address : null;


  /**
   * Wallet operations
   */

  const stake = () => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  const unstake = (zilToUnstake: number) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for unstaking ${zilToUnstake} ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  const claim = () => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing/claiming the unstaked ZIL`);
    setIsDummyWalletPopupOpen(true);
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
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setDummyWalletPopupContent,
    connectedWalletType,
    stake,
    unstake,
    claim,
  };
};

export const WalletConnector = createContainer(useWalletConnector);
