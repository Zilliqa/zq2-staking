import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { createClient, createPublicClient, defineChain, http } from 'viem';
import { createConfig } from 'wagmi';
import { rabbyWallet } from '@rainbow-me/rainbowkit/wallets';
import { getChainId } from './appConfig';

export const CHAIN_ZQ2_DEVNET = defineChain({
  id: 33469,
  name: 'Zq2 Devnet',
  nativeCurrency: { name: 'ZIL', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zq2-devnet.zilliqa.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Otterscan',
      url: 'https://explorer.zq2-devnet.zilliqa.com',
    },
  },
})

export const CHAIN_ZQ2_DOCKERCOMPOSE = defineChain({
  id: 87362,
  name: 'Zq2 Dockercompose',
  nativeCurrency: { name: 'ZIL', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:4201'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Otterscan',
      url: 'http://localhost:5100/',
    },
  },
})

export const MOCK_CHAIN = defineChain({
  id: 9999999,
  name: 'Mock Chain',
  nativeCurrency: { name: 'ZIL', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['NOT_USED'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NOT_USED',
      url: 'NOT_USED',
    },
  },
})

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet, rabbyWallet],
    },
  ],
  {
    appName: 'ZQ2 Staking',
    projectId: '40db54b1a888b3fdc54ac79e2925e762', // APT-1601
  }
);

export function getActiveChain() {
  const activeChain = [
    CHAIN_ZQ2_DEVNET,
    CHAIN_ZQ2_DOCKERCOMPOSE,
    MOCK_CHAIN,
  ].find(
    (chain) => chain.id === getChainId()
  );

  if (!activeChain) {
    throw new Error('Active chain is not defined');
  }

  return activeChain;
} 

export function getChainsConfig() {
  return createConfig({
    chains: [getActiveChain()] as any, // for some reason there is a type mismatch
    client({ chain }) {
      return createClient({ chain, transport: http() })
    },
    connectors,
  });
}

export function getViemClient() {
  return createPublicClient({
    chain: getActiveChain(),
    transport: http(),
  });
}