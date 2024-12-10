import { WalletConnector } from '@/contexts/walletConnector';
import { MOCK_CHAIN } from '@/misc/chainConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from 'antd';
import Image from 'next/image';
import ArrowRight from '../assets/svgs/arrow-right-black.svg'

const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        // Not connected
        if (!account || !chain) {
          return (
            <button
              onClick={openConnectModal}
              className="btn-primary-gradient-aqua !w-fit px-14 group flex items-center"
            >
              Sign In / Connect Wallet
              <Image
                className="ml-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={ArrowRight}
                alt={`arrow icon`}
                width={24}
                height={24}
              />
            </button>
          );
        }

        // Wrong network
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              style={{
                padding: '10px 20px',
                background: '#ff5252',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Wrong Network
            </button>
          );
        }

        // Connected and correct network
        return (
          <button
            onClick={openAccountModal}
            className="btn-primary-aqua"
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};

const LoginView: React.FC = () => {
  const { connectDummyWallet, isDummyWalletConnecting } =
    WalletConnector.useContainer();

  const connectWallet =
    process.env.NEXT_PUBLIC_ENV_CHAIN_ID ===
    MOCK_CHAIN.id.toString() ? (
      <Button
        type="primary"
        onClick={connectDummyWallet}
        loading={isDummyWalletConnecting}
        className="btn-primary-gradient-aqua-lg !w-fit px-14 group"
      >
        Sign In / Connect Wallet
        <Image
                className="ml-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={ArrowRight}
                alt={`arrow icon`}
                width={24}
                height={24}
              />
      </Button>
    ) : (
      <CustomConnectButton />
    );

  return (
    <div className="relative">
      <div className="text-end p-4">
        <h1 className="hero text-white">Staking Portal</h1>
        <p className="mt-5 body2">
          Help us Empower and secure the Zilliqa Chain{' '}
        </p>
      </div>

      <div className="flex flex-col items-end mt-16 ">
        {connectWallet}
      </div>
    </div>
  );
};

export default LoginView;
