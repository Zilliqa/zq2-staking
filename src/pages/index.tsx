import LoginView from "@/components/loginView"
import StakingPoolDetailsView from "@/components/stakingPoolDetailsView"
import StakingPoolsList from "@/components/stakingPoolsList"
import WithdrawZilView from "@/components/withdrawZilView"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { WalletConnector } from "@/contexts/walletConnector"
import Intercom from "@intercom/messenger-js-sdk"
import { Modal } from "antd"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ArrowBackAqua from "../assets/svgs/arrow-back-aqua.svg"
import MobilePopup from "@/components/mobilePopup"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import Header from "@/components/header"
import FaqButton from "@/components/faqButton"

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [viewClaim, setViewClaim] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const { appConfig, isPreviewAuthenticated } = AppConfigStorage.useContainer()
  const router = useRouter()

  if (appConfig.appUrl === "https://stake.zilliqa.com") {
    router.replace("/coming-soon")
  }

  if (
    appConfig.appUrl === "https://stake-preview.zilliqa.com" &&
    !isPreviewAuthenticated
  ) {
    router.replace("/preview_auth")
  }

  const { isWalletConnected, walletAddress } = WalletConnector.useContainer()

  const {
    dummyWalletPopupContent,
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
  } = StakingOperations.useContainer()

  const {
    stakingPoolForView,
    selectStakingPoolForView,
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer()

  const [mobileShowClaims, setMobileShowClaims] = useState<boolean>(false)

  useEffect(() => {
    if (walletAddress) {
      Intercom({
        app_id: appConfig.intercomKey,
        user_id: walletAddress,
      })
    }
  }, [walletAddress])

  useEffect(() => {
    if (router.query.claims) {
      selectStakingPoolForView(null)
      setMobileShowClaims(true)
    } else {
      setMobileShowClaims(false)
    }
  }, [router.query.claims])

  const mobileOverlayWrapper = (children: React.ReactNode) => (
    <div className="absolute lg:hidden top-0 left-0 z-25 h-full w-full lg:bg-black1/65 max-lg:pb-12 py-5 4k:p-6 border-t-[0.6px] border-[#4B4B4B] rounded-t-3xl">
      {children}
    </div>
  )

  const desktopColumnContent = (
    <div className="hidden lg:block h-full 4k:h-[70vh] max-4k:items-center overflow-hidden">
      {!isWalletConnected && !stakingPoolForView ? (
        <LoginView />
      ) : stakingPoolForView ? (
        <div className="bg-black1/[68%] 4k:rounded-2.5xl rounded-tl-2.5xl h-full">
          <StakingPoolDetailsView
            stakingPoolData={stakingPoolForView.stakingPool}
            userStakingPoolData={stakingPoolForView.userData.staked}
            userUnstakingPoolData={stakingPoolForView.userData.unstaked}
            viewClaim={viewClaim}
            reward={stakingPoolForView.userData.reward}
          />
        </div>
      ) : (
        <WithdrawZilView setViewClaim={setViewClaim} />
      )}
    </div>
  )

  const mobileOverlayContent =
    mobileShowClaims && !stakingPoolForView
      ? mobileOverlayWrapper(<WithdrawZilView setViewClaim={setViewClaim} />)
      : stakingPoolForView &&
        mobileOverlayWrapper(
          <StakingPoolDetailsView
            stakingPoolData={stakingPoolForView.stakingPool}
            userStakingPoolData={stakingPoolForView.userData.staked}
            userUnstakingPoolData={stakingPoolForView.userData.unstaked}
            reward={stakingPoolForView.userData.reward}
          />
        )

  const mobileBottomNavition = (
    <div className="fixed bottom-0 left-0 lg:hidden w-full mt-7t-1.5">
      <div className="flex justify-between items-center gap-1 mb-5 mt-2 mx-5 md:mx-7">
        {isWalletConnected ? (
          <>
            <div className="flex justify-between items-center w-full max-lg:mr-16">
              {mobileShowClaims || stakingPoolForView ? (
                <div className="max-lg:w-full lg:min-w-[320px] mx-auto">
                  <div
                    className="justify-start flex items-center bold12"
                    onClick={() => {
                      router.back()
                    }}
                  >
                    <Image
                      className="mr-2 xs:mr-3 transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                      src={ArrowBackAqua}
                      alt={"arrow icon"}
                      width={8}
                      height={4.5}
                    />
                    Back
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`justify-start bold12 relative max-lg:w-full lg:min-w-[320px] mx-auto whitespace-nowrap
                        ${!mobileShowClaims || (mobileShowClaims && stakingPoolForView) ? "text-tealPrimary" : "text-gray1"}
                        `}
                  onClick={() => {
                    if (stakingPoolForView) {
                      return
                    }

                    router.push(
                      {
                        query: {},
                      },
                      undefined,
                      { shallow: true }
                    )
                  }}
                >
                  {stakingPoolForView
                    ? `${stakingPoolForView.stakingPool.definition.name}`
                    : "Validators"}

                  <span
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 w-1 h-1
                  ${!mobileShowClaims || (mobileShowClaims && stakingPoolForView) ? "bg-tealPrimary " : " bg-transparent"}
                     rounded-full`}
                  />
                </div>

                <div
                  className={`h-inherit
                      ${stakingPoolForView ? "w-1/2" : "w-full"}`}
                >
                  <div
                    className={
                      "justify-start flex items-center whitespace-nowrap "
                    }
                    onClick={() => {
                      router.push(
                        {
                          query: { claims: true },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }}
                  >
                    <div
                      className={` relative
                    ${mobileShowClaims && !stakingPoolForView ? "text-tealPrimary" : "text-gray1"}
                   whitespace-nowrap bold12`}
                    >
                      Claims
                      {mobileShowClaims && !stakingPoolForView && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-1 h-1 bg-tealPrimary rounded-full" />
                      )}
                    </div>
                    {availableForUnstaking.length + pendingUnstaking.length !=
                      0 && (
                      <div
                        className={`bg-red1 text-white rounded-full px-2 h-4 w-4
                      text-8 font-bold p-0.5 ml-1 mb-5 items-center flex justify-center
                     ${availableForUnstaking.length + pendingUnstaking.length != 0 && "text-white"}`}
                      >
                        {availableForUnstaking.length + pendingUnstaking.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {stakingPoolForView && (
              <div className="w-1/2">
                <div className="max-lg:w-full lg:min-w-[320px] mx-auto">
                  <div
                    className="justify-start flex items-center bold12"
                    onClick={() => {
                      router.back()
                    }}
                  >
                    <Image
                      className="mr-2 xs:mr-3 transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                      src={ArrowBackAqua}
                      alt={"arrow icon"}
                      width={8}
                      height={4.5}
                    />
                    Back
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  const [isOpen, setIsOpen] = useState(true)

  const [selectedPoolType, setSelectedPoolType] = useState(
    StakingPoolType.LIQUID
  )

  return (
    <>
      <div
        className={`h-screen w-screen relative transition-opacity duration-1000 overflow-hidden flex flex-col gap-3 lg:gap-[4vh] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header start*/}
        <Header
          showBackButton={true}
          onBack={() => {}}
          title="Home Page"
          selectedPoolType={selectedPoolType}
          isWalletConnected={!!isWalletConnected}
          onClick={() => router.back()}
        />
        {/* Header section end */}
        <div className="grow relative mx-auto overflow-y-hidden max-w-screen-4k w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 4k:gap-14 h-full max-lg:pb-16">
            {/* Left column */}
            <div
              className={`lg:bg-white/[9%] py-4 xs:py-6 4k:py-10 max-4k:rounded-s-none rounded-tr-2.5xl ${mobileOverlayContent && "max-lg:hidden"} overflow-hidden h-full flex flex-col `}
            >
              <StakingPoolsList
                selectedPoolType={selectedPoolType}
                setSelectedPoolType={setSelectedPoolType}
                setViewClaim={setViewClaim}
              />
            </div>

            {desktopColumnContent}

            {mobileOverlayContent}

            <MobilePopup
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              isWalletConnected={!!isWalletConnected}
            />

            {mobileBottomNavition}
          </div>
        </div>

        <Modal
          title="User Wallet Interaction"
          open={isDummyWalletPopupOpen}
          okButtonProps={{ className: "btn-primary-cyan" }}
          okText="Confirm tx"
          cancelText="Cancel"
          onOk={dummyWalletPopupContent?.onOk}
          onCancel={dummyWalletPopupContent?.onCancel}
        >
          <div>{dummyWalletPopupContent?.content}</div>
        </Modal>
      </div>
      <FaqButton />
    </>
  )
}

export default HomePage
