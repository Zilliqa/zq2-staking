import LoginView from '@/components/loginView';
import StakingPoolDetailsView from '@/components/stakingPoolDetailsView';
import StakingPoolsList from '@/components/stakingPoolsList';
import WithdrawZilView from '@/components/withdrawZilView';
import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import { ConnectedWalletType, WalletConnector } from '@/contexts/walletConnector';
import { MOCK_CHAIN } from '@/misc/chainConfig';
import { formatAddress } from '@/misc/formatting';
import { LeftOutlined, WalletOutlined } from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Modal } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import ArrowBack from '../assets/svgs/arrow-back-white.svg'
import ArrowNext from '../assets/svgs/arrow-next-black.svg'


const HomePage = () => {
  const {
    connectDummyWallet,
    isWalletConnected,
    isDummyWalletConnecting,
    zilAvailable,
    walletAddress,
    disconnectDummyWallet,
    dummyWalletPopupContent,
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
    connectedWalletType,
  } = WalletConnector.useContainer();

  const {
    stakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForView,
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer();

  const [mobileShowClaims, setMobileShowClaims] = useState<boolean>(false);

  const mobileOverlayWrapper = (children: React.ReactNode) => (
    <div className='absolute lg:hidden top-0 left-0 z-25 h-full w-full bg-black p-4 pt-[5em]'>
      {children}
    </div>
  )

  const desktopColumnContent = (
    <div className="hidden lg:grid h-full">
      {
        !isWalletConnected ? (
          <LoginView />
        ) : stakingPoolForView ? (
          <div className="bg-black xs:pt-5 lg:pt-7.5 xs:px-5 lg:px-7.5 rounded-lg">
            <StakingPoolDetailsView
              selectStakingPoolForStaking={(stakingPoolId) => {
                selectStakingPoolForView(null);
                selectStakingPoolForStaking(stakingPoolId);
              }}
              stakingPoolData={stakingPoolForView.stakingPool}
              userStakingPoolData={stakingPoolForView.userData.staked}
              userUnstakingPoolData={stakingPoolForView.userData.unstaked}
            />
          </div>
        ) : (
          <WithdrawZilView />
        )
      }
    </div>
  )

  const mobileOverlayContent = mobileShowClaims
    ? mobileOverlayWrapper(<WithdrawZilView />)
    : stakingPoolForView && mobileOverlayWrapper(
      <StakingPoolDetailsView
        selectStakingPoolForStaking={(stakingPoolId) => {
          selectStakingPoolForView(null);
          selectStakingPoolForStaking(stakingPoolId);
        }}
        stakingPoolData={stakingPoolForView.stakingPool}
        userStakingPoolData={stakingPoolForView.userData.staked}
        userUnstakingPoolData={stakingPoolForView.userData.unstaked}
      />
    )

  const connectWallet = process.env.NEXT_PUBLIC_ENV_CHAIN_ID === MOCK_CHAIN.id.toString() ? (
    <Button
        type="primary"
        onClick={connectDummyWallet}
        loading={isDummyWalletConnecting}
        className="btn-primary-gradient-aqua-lg "
      >
        CONNECT WALLET
    </Button>
  ) : (
    <ConnectButton />
  )

  const mobileBottomNavition = (
    <div className='fixed bottom-0 left-0 lg:hidden w-full mt-7.5'>
      <div className='flex justify-between gap-1 mb-4 mx-2.5'>
      {
        isWalletConnected ? (
          <>
            {
              mobileShowClaims && (
                <div className='min-w-[200px] xs:min-w-[320px] mx-auto'>
                  <Button
                    type="default"
                    size="large"
                    className='btn-secondary-lg group'
                    onClick={() => {
                      setMobileShowClaims(false);
                    }}
                  >
                    <Image
                        className="mr-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                        src={ArrowBack}
                        alt={`arrow icon`}
                        width={24}
                        height={24}
                      />
                     { stakingPoolForView ? stakingPoolForView?.stakingPool.definition.name : "Back" }  
                  </Button></div>
                )
            }
            {
              !mobileShowClaims && stakingPoolForView && (
                <div className='w-1/2'>
                <Button
                  type="default"
                  size="large"
                  className='btn-secondary-lg group'
                  onClick={() => {
                    selectStakingPoolForView(null);
                  }}
                > <Image
                    className="mr-1 xs:mr-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                    src={ArrowBack}
                    alt={`arrow icon`}
                    width={24}
                    height={24}
                  /> 
                  Back
                </Button></div>
              )
            }

            {
              !mobileShowClaims && availableForUnstaking.length + pendingUnstaking.length != 0  && (
                <div className={`h-inherit ${stakingPoolForView ? "w-1/2" : "w-full"}`}>
                <Button
                  type="default"
                  size="large"
                  className='btn-primary-gradient-aqua-lg group'
                  onClick={() => setMobileShowClaims(true)}
                >
                 {availableForUnstaking.length + pendingUnstaking.length} Claims
                 <Image
                className="ml-1 xs:ml-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={ArrowNext}
                alt={`arrow icon`}
                width={24}
                height={24}
              />
                </Button>
                </div>
              )
            }
          </>
        ) : (
          connectWallet
        )
      }
    </div></div>
  )

  return (
    <div className="h-screen w-screen relative">

      {/* Header */}
      <div className="absolute z-50 top-0 left-0 h-[4em] w-full flex items-center justify-center text-white border-b-2 border-white">
        <div className="flex max-w-screen-2xl w-full justify-between px-4">

          <div className="flex items-center">
            <Image
              src="https://zil-dev.cdn.prismic.io/zil-dev/f3b97b97-e98b-4767-9b24-9474b9c20a83_Asset+1.svg"
              alt="Zilliqa Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center space-x-4">
            {
              !isWalletConnected ? (
                connectWallet
              ) : (
                <>
                  {
                    connectedWalletType === ConnectedWalletType.MockWallet ? (
                      <div>
                        <div
                          className='group w-32 relative btn-primary-cyan rounded-lg h-[2.5em]'
                          onClick={disconnectDummyWallet}
                        >
                          <div className='absolute inset-0 group-hover:opacity-0 transition-opacity flex items-center justify-center'>
                            <WalletOutlined className="mr-2 !text-black-100"/>
                            {formatAddress(walletAddress || '')}
                          </div>
                          <span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                            Disconnect
                          </span>
                        </div>

                        {
                          zilAvailable === null ? (
                            <div className="animated-gradient h-[2.5em] w-[4em]"></div>
                          ) : (
                            <span className="btn-primary-cyan rounded-lg h-[2.5em]">
                              <span>{zilAvailable} ZIL</span>
                            </span>
                          )
                        }
                      </div>
                    ) : (
                      <ConnectButton />
                    )
                  }
                </>     
              )
            }
          </div>
        </div>
      </div>

      <div className="relative max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 h-screen gap-5 px-4 pt-[5em]">
        {/* Left column */}
        <div className="bg-black xs:p-6 rounded-2.5xl">
          <StakingPoolsList />
        </div>

        { desktopColumnContent }

        { mobileOverlayContent }
        { mobileBottomNavition }
      </div>

      <Modal
        title="User Wallet Interaction"
        open={isDummyWalletPopupOpen}
        okButtonProps={{ className: 'btn-primary-cyan' }}
        onOk={() => setIsDummyWalletPopupOpen(false)}
        onCancel={() => setIsDummyWalletPopupOpen(false)}
      >
        <div>
          {dummyWalletPopupContent}
        </div>
      </Modal>

    </div>
  );
};

export default HomePage;
