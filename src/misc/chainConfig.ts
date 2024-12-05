import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

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
  id: 32769,
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
      name: 'Otterscan',
      url: 'NOT_USED',
    },
  },
})

export const chainsConfig = getDefaultConfig({
  appName: 'ZQ2 Staking',
  projectId: '40db54b1a888b3fdc54ac79e2925e762',
  chains: [CHAIN_ZQ2_DOCKERCOMPOSE],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
