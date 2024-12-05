import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { createClient, defineChain, http } from 'viem';
import { createConfig } from 'wagmi';
import { rabbyWallet } from '@rainbow-me/rainbowkit/wallets';

export const CHAIN_ZQ2_PROTOTESTNET = defineChain({
  id: 1,
  name: 'Zq2 Prototesnet',
  nativeCurrency: { name: 'ZIL', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zq2-prototestnet.zilliqa.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Otterscan',
      url: 'https://explorer.zq2-prototestnet.zilliqa.com/',
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

export const chainsConfig = createConfig({
  chains: [CHAIN_ZQ2_DOCKERCOMPOSE],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
  connectors,
});
