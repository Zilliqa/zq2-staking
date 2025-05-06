import { Connector } from 'wagmi'
import { DummyWallet } from '@/misc/walletsConfig'
import { createPublicClient, custom } from 'viem'

export class DummyConnector {
  id = 'dummy'
  name = 'Dummy Wallet'
  ready = true
  wallet: DummyWallet

  constructor({ chains, options }: { chains: any[]; options: { wallet: DummyWallet } }) {
    super({ chains, options })
    this.wallet = options.wallet
  }

  async connect() {
    return {
      account: this.wallet.address,
      chain: { id: this.chains[0].id, unsupported: false },
    }
  }

  async disconnect() {}

  async getAccount() {
    return this.wallet.address
  }

  async getChainId() {
    return this.chains[0].id
  }

  async getProvider() {
    return createPublicClient({
      chain: this.chains[0],
      transport: custom({
        request: async ({ method, params }) => {
          if (method === 'eth_getBalance' && params[0] === this.wallet.address) {
            return BigInt(this.wallet.currentZil).toString()
          }
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            return [this.wallet.address]
          }
          throw new Error(`Метод ${method} не реализован`)
        },
      }),
    })
  }

  async getSigner() {
    return null
  }

  async isAuthorized() {
    return true
  }
}
