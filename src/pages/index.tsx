import LoginView from "@/components/loginView"
import StakingPoolDetailsView from "@/components/stakingPoolDetailsView"
import StakingPoolsList from "@/components/stakingPoolsList"
import WithdrawZilView from "@/components/withdrawZilView"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import {
  ConnectedWalletType,
  WalletConnector,
} from "@/contexts/walletConnector"
import { MOCK_CHAIN } from "@/misc/chainConfig"
import { formatAddress } from "@/misc/formatting"
import { WalletOutlined } from "@ant-design/icons"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button, Modal } from "antd"
import Image from "next/image"
import { useEffect, useState } from "react"
import ArrowBack from "../assets/svgs/arrow-back-white.svg"
import ArrowBackAqua from "../assets/svgs/arrow-back-aqua.svg"

import Star from "../assets/svgs/star.svg"
import Logo from "../assets/svgs/logo.svg"

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const { appConfig } = AppConfigStorage.useContainer()

  const {
    connectDummyWallet,
    isWalletConnected,
    isDummyWalletConnecting,
    walletAddress,
    disconnectDummyWallet,
    connectedWalletType,
  } = WalletConnector.useContainer()

  const {
    dummyWalletPopupContent,
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
  } = StakingOperations.useContainer()

  const {
    stakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForView,
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer()

  const [mobileShowClaims, setMobileShowClaims] = useState<boolean>(false)

  const mobileOverlayWrapper = (children: React.ReactNode) => (
    <div className="absolute lg:hidden top-0 left-0 z-25 h-full w-full lg:bg-black4/65 p-4">
      {children}
    </div>
  )

  const desktopColumnContent = (
    <div className="hidden lg:grid h-full items-center">
      {!isWalletConnected && !stakingPoolForView ? (
        <LoginView />
      ) : stakingPoolForView ? (
        <div
          className="bg-black4/[68%] rounded-2.5xl xs:px-5 lg:px-7.5 h-full 
         "
        >
          <StakingPoolDetailsView
            selectStakingPoolForStaking={(stakingPoolId) => {
              selectStakingPoolForView(null)
              selectStakingPoolForStaking(stakingPoolId)
            }}
            stakingPoolData={stakingPoolForView.stakingPool}
            userStakingPoolData={stakingPoolForView.userData.staked}
            userUnstakingPoolData={stakingPoolForView.userData.unstaked}
          />
        </div>
      ) : (
        <WithdrawZilView />
      )}
    </div>
  )

  const mobileOverlayContent = mobileShowClaims
    ? mobileOverlayWrapper(<WithdrawZilView />)
    : stakingPoolForView &&
      mobileOverlayWrapper(
        <StakingPoolDetailsView
          selectStakingPoolForStaking={(stakingPoolId) => {
            selectStakingPoolForView(null)
            selectStakingPoolForStaking(stakingPoolId)
          }}
          stakingPoolData={stakingPoolForView.stakingPool}
          userStakingPoolData={stakingPoolForView.userData.staked}
          userUnstakingPoolData={stakingPoolForView.userData.unstaked}
        />
      )

  const connectWallet =
    appConfig.chainId === MOCK_CHAIN.id ? (
      <Button
        type="primary"
        onClick={connectDummyWallet}
        loading={isDummyWalletConnecting}
        className="btn-primary-gradient-aqua sm:px-10 w-full sm:max-w-fit"
      >
        CONNECT WALLET
      </Button>
    ) : (
      <ConnectButton />
    )

  const mobileBottomNavition = (
    <div className="fixed bottom-0 left-0 lg:hidden w-full mt-7.5  pt-1.5">
      <div className="flex justify-between items-center gap-1 mb-5 mt-2 mx-2.5 sm:mx-4 md:mx-6">
        {isWalletConnected ? (
          <>
            <div className="flex justify-between items-center w-full">
              <div>
                {mobileShowClaims && (
                  <div className="max-lg:w-full lg:min-w-[320px] mx-auto">
                    <a
                      className="justify-start flex items-center bold12-s"
                      onClick={() => {
                        setMobileShowClaims(false)
                      }}
                    >
                      {" "}
                      <Image
                        className="mx-1 xs:mx-3 transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                        src={ArrowBackAqua}
                        alt={"arrow icon"}
                        width={8}
                        height={4.5}
                      />
                      Back
                    </a>
                  </div>
                )}

                {!mobileShowClaims && stakingPoolForView && (
                  <div
                    className={`${!mobileShowClaims && availableForUnstaking.length + pendingUnstaking.length != 0 ? "w-1/2" : "w-full"}`}
                  >
                    {" "}
                    <a
                      className="justify-start flex items-center bold12-s"
                      onClick={() => {
                        selectStakingPoolForView(null)
                      }}
                    >
                      {" "}
                      <Image
                        className="mx-1 xs:mx-3 transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                        src={ArrowBackAqua}
                        alt={"arrow icon"}
                        width={8}
                        height={4.5}
                      />
                      Back
                    </a>
                  </div>
                )}

                {!mobileShowClaims && !stakingPoolForView && (
                  <div
                    className={`${!mobileShowClaims && availableForUnstaking.length + pendingUnstaking.length != 0 ? "w-1/2" : "w-full"}`}
                  >
                    {" "}
                    <a
                      className="justify-start"
                      onClick={() => {
                        selectStakingPoolForView(null)
                      }}
                    >
                      <Button className="btn-primary-gradient-aqua px-5 py-2 group flex items-center gap-1">
                        <Image
                          className=" h-2 w-2"
                          src={Star}
                          alt="star icon"
                          width={8}
                          height={8}
                        />
                        <Image
                          className=" h-2 w-2"
                          src={Star}
                          alt="star icon"
                          width={8}
                          height={8}
                        />
                        <Image
                          className=" h-2 w-2"
                          src={Star}
                          alt="star icon"
                          width={8}
                          height={8}
                        />
                      </Button>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  className={`justify-start bold12-s relative max-lg:w-full lg:min-w-[320px] mx-auto
                        ${mobileShowClaims ? "text-gray5" : "text-aqua1"}
                        `}
                  onClick={() => {
                    setMobileShowClaims(false)
                  }}
                >
                  {stakingPoolForView
                    ? "Validator"
                    : !stakingPoolForView
                      ? "Staking"
                      : ""}
                  {!mobileShowClaims && (
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-1 h-1 bg-aqua1 rounded-full" />
                  )}
                </a>

                <div
                  className={`h-inherit
                      ${stakingPoolForView ? "w-1/2" : "w-full"}`}
                >
                  <a
                    className={
                      "justify-start flex items-center whitespace-nowrap "
                    }
                    onClick={() => setMobileShowClaims(true)}
                  >
                    {" "}
                    <div
                      className={` relative
                    ${mobileShowClaims ? "text-aqua1" : "text-gray5"}
                   whitespace-nowrap bold12-s`}
                    >
                      My Claims
                      {mobileShowClaims && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-1 h-1 bg-aqua1 rounded-full" />
                      )}
                    </div>
                    {availableForUnstaking.length + pendingUnstaking.length !=
                      0 && (
                      <div
                        className={`bg-red2 text-white rounded-full px-2 h-4 w-4
                      text-8 font-bold p-0.5 ml-1 mb-5 items-center flex justify-center
                     ${availableForUnstaking.length + pendingUnstaking.length != 0 && "text-white"}`}
                      >
                        {availableForUnstaking.length + pendingUnstaking.length}
                      </div>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {stakingPoolForView && (
              <div className="w-1/2">
                <div className="max-lg:w-full lg:min-w-[320px] mx-auto">
                  <a
                    className="justify-start flex items-center bold12-s"
                    onClick={() => {
                      selectStakingPoolForView(null)
                    }}
                  >
                    <Image
                      className="mx-1 xs:mx-3 transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                      src={ArrowBackAqua}
                      alt={"arrow icon"}
                      width={8}
                      height={4.5}
                    />
                    Back
                  </a>
                </div>
              </div>
            )}
            <div
              className={`flex items-center h-[58.79px] w-full ${stakingPoolForView ? "justify-end" : "justify-center"}`}
            >
              {connectWallet}
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div
      className={`h-screen w-screen relative transition-opacity duration-1000 overflow-hidden ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="h-[10vh] w-full flex items-center justify-center text-white border-b-[0.5px] border-gray2">
        <div className="flex max-w-screen-2xl w-full justify-between px-4 lg:px-8 xl:px-12 ">
          <div className="flex items-center">
            <Image
              //src="https://zil-dev.cdn.prismic.io/zil-dev/f3b97b97-e98b-4767-9b24-9474b9c20a83_Asset+1.svg"
              src={Logo}
              alt="Zilliqa Logo"
              width={32}
              height={32}
              className="h-10 md:h-12 w-auto"
            />
          </div>

          <div className="flex items-center space-x-4">
            {!isWalletConnected ? (
              connectWallet
            ) : (
              <>
                {connectedWalletType === ConnectedWalletType.MockWallet ? (
                  <Button
                    type="primary"
                    className="group relative btn-primary-gradient-aqua-lg min-w-[214px] lg:min-w-[160px]"
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
                ) : (
                  <ConnectButton />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={` ${mobileShowClaims || stakingPoolForView || availableForUnstaking.length + pendingUnstaking.length != 0 ? "h-[90vh]" : " h-[100vh] "} relative mx-auto 
      overflow-y-hidden `}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-3 lg:pt-[4vh]">
          {/* Left column */}
          <div
            className={`lg:bg-white/[9%] p-4 xs:p-6 rounded-s-none rounded-2.5xl ${mobileOverlayContent && "max-lg:hidden"}`}
          >
            <StakingPoolsList />
          </div>

          {desktopColumnContent}

          {mobileOverlayContent}
          {mobileBottomNavition}
        </div>
      </div>

      <Modal
        title="User Wallet Interaction"
        open={isDummyWalletPopupOpen}
        okButtonProps={{ className: "btn-primary-cyan" }}
        onOk={() => setIsDummyWalletPopupOpen(false)}
        onCancel={() => setIsDummyWalletPopupOpen(false)}
      >
        <div>{dummyWalletPopupContent}</div>
      </Modal>
    </div>
  )
}

export default HomePage
