import Image from "next/image";
import ArrowRight from "../assets/svgs/arrow-right-black.svg";
import ArrowRightWhite from "../assets/svgs/arrow-right-white.svg";
import { AppConfigStorage } from "@/contexts/appConfigStorage";
import { WalletConnector } from "@/contexts/walletConnector";
import { MOCK_CHAIN } from "@/misc/chainConfig";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "antd";


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
            <Button
              onClick={openConnectModal}
              className="btn-primary-gradient-aqua !w-fit px-14 group flex items-center"
            >
              Connect Wallet
              <Image
                className="ml-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={ArrowRightWhite}
                alt={`arrow icon`}
                width={24}
                height={24}
              />
            </Button>
          )
        }

        // Wrong network
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              style={{
                padding: "10px 20px",
                background: "#ff5252",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Wrong Network
            </button>
          )
        }
        // Connected and correct network
        return (
          <button onClick={openAccountModal} className="btn-primary-aqua">
            {account.displayName}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}

const LoginView: React.FC = () => {
  const { appConfig } = AppConfigStorage.useContainer();

  const { connectDummyWallet, isDummyWalletConnecting } =
    WalletConnector.useContainer();

  const connectWallet =
    appConfig.chainId === MOCK_CHAIN.id ? (
      <Button
        type="primary"
        onClick={connectDummyWallet}
        loading={isDummyWalletConnecting}
        className="btn-primary-gradient-aqua-lg !w-fit px-11 group"
      >
        Connect Wallet
        <Image
          className="ml-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
          src={ArrowRightWhite}
          alt={`arrow icon`}

          width={24}
          height={24}
        />
      </Button>
    ) : (
      <CustomConnectButton />
    )

  return (
    <div className="relative">
      <div className="text-center p-4">
        <h1 className="hero-v2 text-white">Staking Portal</h1>
        <p className="mt-6 body2-v2 text-white4">

          Help us Empower and secure the Zilliqa Chain{" "}
        </p>
      </div>

      <div className="flex flex-col items-center mt-12.5 ">{connectWallet}</div>

    </div>
  )
}

export default LoginView
