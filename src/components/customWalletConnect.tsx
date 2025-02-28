import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { WalletConnector } from "@/contexts/walletConnector"
import { MOCK_CHAIN } from "@/misc/chainConfig"
import { formatAddress, formatUnitsToHumanReadable } from "@/misc/formatting"
import { WalletOutlined } from "@ant-design/icons"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "antd"

/**
 * notConnectedClassName will be used for other cases if if connectedClassName or wrongNetworkClassName is not provided
 */
interface CustomWalletConnectProps {
  children: React.ReactNode
  notConnectedClassName: string
}

const CustomWalletConnect: React.FC<CustomWalletConnectProps> = ({
  children,
  notConnectedClassName,
}) => {
  const { appConfig } = AppConfigStorage.useContainer()

  const {
    isDummyWalletConnecting,
    connectDummyWallet,
    disconnectDummyWallet,
    isDummyWalletConnected,
    walletAddress,
    zilAvailable,
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
          className="group relative btn-primary-teal max-lg:px-5 max-lg:w-fit lg:min-w-[160px]"
          onClick={disconnectDummyWallet}
        >
          <div className=" group-hover:hidden transition-opacity flex items-center justify-center">
            <WalletOutlined className="mr-2 !text-black-100" />
            {formatAddress(walletAddress || "")} |{" "}
            {formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL
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
        {({ account, chain, mounted, openConnectModal }) => {
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

          // all other cases
          return (
            <div className="flex w-fit justify-end items-center ">
              <ConnectButton />
            </div>
          )
        }}
      </ConnectButton.Custom>
    )
  }
}

export default CustomWalletConnect
