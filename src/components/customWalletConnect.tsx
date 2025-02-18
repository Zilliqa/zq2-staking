import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { WalletConnector } from "@/contexts/walletConnector"
import { MOCK_CHAIN } from "@/misc/chainConfig"
import { formatAddress } from "@/misc/formatting"
import { WalletOutlined } from "@ant-design/icons"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "antd"
import { useMemo } from "react"

/**
 * notConnectedClassName will be used for other cases if if connectedClassName or wrongNetworkClassName is not provided
 */
interface CustomWalletConnectProps {
  children: React.ReactNode
  notConnectedClassName: string
  connectedClassName?: string
  wrongNetworkClassName?: string
}

const CustomWalletConnect: React.FC<CustomWalletConnectProps> = ({
  children,
  notConnectedClassName,
  connectedClassName,
  wrongNetworkClassName,
}) => {
  const { appConfig } = AppConfigStorage.useContainer()

  const {
    isDummyWalletConnecting,
    connectDummyWallet,
    disconnectDummyWallet,
    isDummyWalletConnected,
    walletAddress,
  } = WalletConnector.useContainer()

  if (appConfig.chainId === MOCK_CHAIN.id) {
    if (!isDummyWalletConnected) {
      return (
        <Button
          type="primary"
          onClick={connectDummyWallet}
          loading={isDummyWalletConnecting}
          className={notConnectedClassName}
        >
          {children}
        </Button>
      )
    } else {
      return (
        <Button
          type="primary"
          className="group relative btn-primary-gradient-aqua max-lg:px-5 max-lg:w-fit lg:min-w-[160px]"
          onClick={disconnectDummyWallet}
        >
          <div className=" group-hover:hidden transition-opacity flex items-center justify-center">
            <WalletOutlined className="mr-2 !text-black-100" />
            {formatAddress(walletAddress || "")}
          </div>
          <span className=" !hidden group-hover:!block transition-opacity  items-center justify-center">
            Disconnect
          </span>
        </Button>
      )
    }
  } else {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          mounted,
          openAccountModal,
          openChainModal,
          openConnectModal,
        }) => {
          if (!mounted) {
            return (
              <Button className={notConnectedClassName}>refreshing...</Button>
            )
          }

          // Not connected
          if (!account || !chain) {
            return (
              <Button
                onClick={openConnectModal}
                className={notConnectedClassName}
              >
                {children}
              </Button>
            )
          }

          // Wrong network
          if (chain.unsupported) {
            return (
              <Button
                onClick={openChainModal}
                className={wrongNetworkClassName ?? notConnectedClassName}
              >
                Switch network
              </Button>
            )
          }

          // Connected and correct network
          return (
            <Button
              onClick={openAccountModal}
              className={connectedClassName ?? notConnectedClassName}
            >
              {account.displayName} | {account.balanceDecimals?.toFixed(0)}{" "}
              {account.balanceSymbol}
            </Button>
          )
        }}
      </ConnectButton.Custom>
    )
  }
}

export default CustomWalletConnect
