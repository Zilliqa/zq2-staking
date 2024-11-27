import { WalletConnector } from "@/contexts/walletConnector";
import { RightOutlined } from '@ant-design/icons';
import { Button } from "antd";

const LoginView: React.FC = () => {

  const {
    connectWallet,
    isWalletConnecting,
  } = WalletConnector.useContainer();

  return (
    <div className="relative bg-grey-400">
      <div className="text-end text-white">
        <h1 className="text-5xl font-bold">Liquid Staking <br/>with Zilliqa</h1>
        <p className="mt-1 text-sm">
        Help us Empower and secure the Zilliqa Chain
        </p>
      </div>

      <div className='flex flex-col items-end mt-16'>
        <Button
          type="primary"
          size="large"
          onClick={connectWallet}
          loading={isWalletConnecting}
          className="mt-8 btn-primary-cyan text-3xl min-w-1/2"
        >
          SIGN IN / CONNECT WALLET<RightOutlined />
        </Button>
      </div>
    </div>
  )

}

export default LoginView;