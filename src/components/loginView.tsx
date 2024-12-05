import { WalletConnector } from "@/contexts/walletConnector";
import { MOCK_CHAIN } from "@/misc/chainConfig";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "antd";

const LoginView: React.FC = () => {

  const {
    connectDummyWallet,
    isDummyWalletConnecting,
  } = WalletConnector.useContainer();

  const connectWallet = process.env.NEXT_PUBLIC_ENV_CHAIN_ID === MOCK_CHAIN.id.toString() ? (
    <Button
        type="primary"
        onClick={connectDummyWallet}
        loading={isDummyWalletConnecting}
        className="btn-primary-cyan rounded-lg"
      >
        CONNECT WALLET
    </Button>
  ) : (
    <ConnectButton />
  )

  return (
    <div className="relative bg-grey-400">
      <div className="text-end text-white">
        <h1 className="text-5xl font-bold">Liquid Staking <br/>with Zilliqa</h1>
        <p className="mt-1 text-sm">
        Help us Empower and secure the Zilliqa Chain
        </p>
      </div>

      <div className='flex flex-col items-end mt-16'>
        { connectWallet }
      </div>
    </div>
  )

}

export default LoginView;