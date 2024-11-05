"use client";

import { useState } from "react";
import { createContainer } from "./context";
import { DummyWallet } from "./dummyWalletsData";

const useWalletConnector = () => {

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [stakedZilAvailable, setStakedZilAvailable] = useState(0);
  const [zilAvailable, setZilAvailable] = useState(0);

  const [isDummyWalletSelectorOpen, setIsDummyWalletSelectorOpen] = useState(false);
  
  const setDummyWallet = (wallet: DummyWallet) => {
    setWalletAddress(wallet.address);
    setZilAvailable(wallet.currentZil);
    setStakedZilAvailable(wallet.stakedZil.reduce((acc, stakedZil) => acc + stakedZil.stakedZil, 0));

    setIsWalletConnected(true);
    setIsDummyWalletSelectorOpen(false);
    setIsWalletConnecting(false);
  }

  const connectWallet = () => {
    setIsWalletConnecting(true);
    setIsDummyWalletSelectorOpen(true);
  }

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress(null);
    setIsWalletConnecting(false);
    setIsDummyWalletSelectorOpen(false);
  };

  return {
    isWalletConnected,
    isWalletConnecting,
    connectWallet,
    disconnectWallet,
    walletAddress,
    stakedZilAvailable,
    zilAvailable,
    isDummyWalletSelectorOpen,
    setDummyWallet,
  };
};

export const WalletConnector = createContainer(useWalletConnector);
