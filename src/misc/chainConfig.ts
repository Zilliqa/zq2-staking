import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';


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
