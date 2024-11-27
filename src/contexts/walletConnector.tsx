"use client";

import { useState } from "react";
import { createContainer } from "./context";
import { DummyWallet } from "./dummyWalletsData";

const useWalletConnector = () => {

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [zilAvailable, setZilAvailable] = useState(0);

  const [isDummyWalletSelectorOpen, setIsDummyWalletSelectorOpen] = useState(false);

  const [isDummyWalletPopupOpen, setIsDummyWalletPopupOpen] = useState(false);
  const [dummyWalletPopupContent, setDummyWalletPopupContent] = useState<string | null>(null);
  
  const setDummyWallet = (wallet: DummyWallet) => {
    setWalletAddress(wallet.address);
    setZilAvailable(wallet.currentZil);

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
    setZilAvailable(0);
  };

  return {
    isWalletConnected,
    isWalletConnecting,
    connectWallet,
    disconnectWallet,
    walletAddress,
    zilAvailable,
    isDummyWalletSelectorOpen,
    setDummyWallet,
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
    dummyWalletPopupContent,
    setDummyWalletPopupContent,
  };
};

export const WalletConnector = createContainer(useWalletConnector);
