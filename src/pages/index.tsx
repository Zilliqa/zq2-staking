import LoginView from '@/components/loginView';
import StakingPoolDetailsView from '@/components/stakingPoolDetailsView';
import StakingPoolsList from '@/components/stakingPoolsList';
import WithdrawZilView from '@/components/withdrawZilView';
import { AppConfigStorage } from '@/contexts/appConfigStorage';
import { StakingOperations } from '@/contexts/stakingOperations';
import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import { ConnectedWalletType, WalletConnector } from '@/contexts/walletConnector';
import { MOCK_CHAIN } from '@/misc/chainConfig';
import { formatAddress } from '@/misc/formatting';
import { WalletOutlined } from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Modal } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ArrowBack from '../assets/svgs/arrow-back-white.svg'
import ArrowNext from '../assets/svgs/arrow-next-black.svg'
import Logo from '../assets/svgs/logo.svg'


const HomePage = () => {

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
       setIsVisible(true);
   }, []);

  const {
    appConfig
  } = AppConfigStorage.useContainer();

  const {
    connectDummyWallet,
    isWalletConnected,
    isDummyWalletConnecting,
    walletAddress,
    disconnectDummyWallet,
    connectedWalletType,
  } = WalletConnector.useContainer();

  const {
    dummyWalletPopupContent,
    isDummyWalletPopupOpen,
    setIsDummyWalletPopupOpen,
  } = StakingOperations.useContainer();

  const {
    stakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForView,
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer();

  const [mobileShowClaims, setMobileShowClaims] = useState<boolean>(false);

  const mobileOverlayWrapper = (children: React.ReactNode) => (
    <div className='absolute lg:hidden top-0 left-0 z-25 h-full w-full bg-black p-4'>
      {children}
    </div>
  )

  const desktopColumnContent = (
    <div className="hidden lg:grid h-full">
      {
        !isWalletConnected && !stakingPoolForView ? (
          <LoginView />
        ) : stakingPoolForView  ? (
          <div className="bg-black xs:pt-5 lg:pt-7.5 xs:px-5 lg:px-7.5 rounded-2.5xl max-h-[80vh]
         ">
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

  const connectWallet = appConfig.chainId === MOCK_CHAIN.id ? (
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
    <div className='fixed bottom-0 left-0 lg:hidden w-full mt-7.5 bg-black pt-1.5'>
      <div className='flex justify-between gap-1 mb-4 mx-2.5'>
      {
        isWalletConnected ? (
          <>
            {
              mobileShowClaims && (
                <div className='max-lg:w-full lg:min-w-[320px] mx-auto'>
                  <Button
                    type="default"
                    size="large"
                    className='btn-secondary-lg group justify-start'
                    onClick={() => {
                      setMobileShowClaims(false);
                    }}
                  >
                    <Image
                        className="mx-1 xs:mx-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
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
                <div className={`${!mobileShowClaims && availableForUnstaking.length + pendingUnstaking.length != 0 ? "w-1/2" : "w-full"}`}>
                <Button
                  type="default"
                  size="large"
                  className='btn-secondary-lg group justify-start'
                  onClick={() => {
                    selectStakingPoolForView(null);
                  }}
                > <Image
                    className="mx-1 xs:mx-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
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
                  className='btn-primary-gradient-aqua-lg group justify-end'
                  onClick={() => setMobileShowClaims(true)}
                >
                 {availableForUnstaking.length + pendingUnstaking.length} Claims
                 <Image
                className="mx-1 xs:mx-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
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
      <>
       {       stakingPoolForView && (
              <div className='w-1/2'>
              <Button
                type="default"
                size="large"
                className='btn-secondary-lg group justify-start'
                onClick={() => {
                  selectStakingPoolForView(null);
                }}
              > <Image
                  className="mx-1 xs:mx-3 h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:-translate-x-2"
                  src={ArrowBack}
                  alt={`arrow icon`}
                  width={24}
                  height={24}
                /> 
                Back
              </Button></div>
            ) }
            <div className={`flex items-center justify-center h-[58.79px] bg-[#0e76fd] rounded-lg ${stakingPoolForView ? "w-1/2" : "w-full"}`}>
            {connectWallet}
           </div>
            </>
  
        )
      }
    </div></div>
  )

  return (
    <div  className={`h-screen w-screen relative transition-opacity duration-1000 ${
      isVisible ? "opacity-100" : "opacity-0"
      }`}>

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
            {
              !isWalletConnected ? (
                connectWallet
              ) : (
                <>
                  {
                    connectedWalletType === ConnectedWalletType.MockWallet ? (
                     
                        <Button type="primary"
                          className='group relative btn-primary-gradient-aqua-lg min-w-[214px] lg:min-w-[160px]'
                          onClick={disconnectDummyWallet}
                        >
                          <div className=' group-hover:hidden transition-opacity flex items-center justify-center'>
                            <WalletOutlined className="mr-2 !text-black-100"/>
                            {formatAddress(walletAddress || '')}
                          </div>
                            <span className=' !hidden group-hover:!block transition-opacity  items-center justify-center'>
                            Disconnect
                          </span>  
                        </Button>
                   
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

      <div className={` ${(mobileShowClaims || stakingPoolForView || availableForUnstaking.length + pendingUnstaking.length != 0) ? 'lg:h-[90vh] h-[80vh] ' : ' h-[90vh] ' } relative max-w-screen-2xl mx-auto 
      overflow-y-hidden `}>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 px-4 lg:px-8 xl:px-12 pt-3 lg:pt-[4vh]'>
        {/* Left column */}
        <div className="bg-white/[9%] p-4 xs:p-6 rounded-2.5xl">
          <StakingPoolsList />
        </div>

        { desktopColumnContent }

        { mobileOverlayContent }
        { mobileBottomNavition }
        </div>
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
