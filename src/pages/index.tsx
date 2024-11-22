import { Button, Modal } from 'antd';
import { RightOutlined, ArrowRightOutlined, CloseCircleOutlined, WalletOutlined, LeftOutlined } from '@ant-design/icons';
import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import { WalletConnector } from '@/contexts/walletConnector';
import StakingPoolsList from '@/components/stakingPoolsList';
import StakingPoolDetailsView from '@/components/stakingPoolDetailsView';
import LoginView from '@/components/loginView';
import WithdrawZilView from '@/components/withdrawZilView';
import { formatAddress } from '@/misc/formatting';
import { useState } from 'react';

const HomePage = () => {
  const {
    connectWallet,
    isWalletConnected,
    isWalletConnecting,
    zilAvailable,
    walletAddress,
    disconnectWallet,
    dummyWalletPopupContent,
    isDummyWalletPopupOpen,
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen
  } = WalletConnector.useContainer();

  const {
    stakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForView,
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer();

  const onClaimRewards = (reward: number) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for claiming ${reward} rewards`);
    setIsDummyWalletPopupOpen(true);
  }

  const [mobileShowClaims, setMobileShowClaims] = useState<boolean>(false);

  const mobileOverlayView = (children: React.ReactNode) => (
    <div className='absolute md:hidden top-0 left-0 z-25 h-full w-full bg-black w-full p-4 pt-[5em]'>
      {children}
    </div>
  )

  return (
    <div className="h-screen w-screen relative bg-[url('https://s3-alpha-sig.figma.com/img/2094/27b4/0031fd7fbc83ae7020637ddc7c563ea4?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Kqd3RVzZ5qHkIJoS4q45mvtbfLBVz3iJA879jwkqn3PydxJUjtSd9LX-FGW~Zkey9mCDOO-ZiX4fSGl2O-Ur9Ck3qL-jNorGoxxzhvN8MrBCdMBis2gyc11glVLh4dUR7sohttYIffOETquCISkigUJjPZStuvI2qP806mwwtQTKnqmf4Of5Dw07bjERivJEvMiI34LdDyEeUjo97qeqWaZBhZA2E1YFdBJcsZ3UpaZm63Lo93lU5T7MSz6tPfcIJIi7tov8E~X6iuxE-pZV~jrslzcq1tYURdMYif~36n-Jomo3POBd2Ln0HPWIl-K~8s6tp2xkV7l7Otr2w4a2xQ__')] bg-center bg-no-repeat bg-cover bg-origin-content">

      {/* Header */}
      <div className="absolute z-50 top-0 left-0 h-[4em] w-full flex items-center justify-center text-white border-b-2 border-white">
        <div className="flex max-w-screen-2xl w-full justify-between px-4">

          <div className="flex items-center">
            <img src="https://zil-dev.cdn.prismic.io/zil-dev/f3b97b97-e98b-4767-9b24-9474b9c20a83_Asset+1.svg" alt="Zilliqa Logo" className="h-8 w-auto" />
          </div>

          <div className="flex items-center space-x-4">
            {
              !isWalletConnected ? (
                <Button
                  type="primary"
                  onClick={connectWallet}
                  loading={isWalletConnecting}
                  className="btn-primary-cyan rounded-lg"
                >
                  CONNECT WALLET
                </Button>
              ) : (
                <div className='flex gap-3'>
                  <div
                    className='group w-32 relative btn-primary-cyan rounded-lg'
                    onClick={disconnectWallet}
                  >
                    <div className='absolute inset-0 group-hover:opacity-0 transition-opacity flex items-center justify-center'>
                      <WalletOutlined className="mr-2 !text-black-100"/>
                      {formatAddress(walletAddress || '')}
                    </div>
                    <span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      Disconnect
                    </span>
                  </div>

                  <span className="btn-primary-cyan rounded-lg">
                    {zilAvailable} ZIL
                  </span>
                </div>
                
              )
            }
          </div>
        </div>
      </div>

      <div className="relative max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 h-screen gap-5 px-4 pt-[5em]">
        {/* Left column */}
        <div className="bg-black p-5 rounded-lg">
          <StakingPoolsList />
        </div>

        {/* Right column - only visible on desktop */}
        <div className="hidden md:grid h-full">
          {
            !isWalletConnected ? (
              <LoginView />
            ) : stakingPoolForView ? (
              <div className="bg-black p-5 rounded-lg">
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

        {/* Mobile only */}
          {
            mobileShowClaims
              ? mobileOverlayView(<WithdrawZilView />)
             : stakingPoolForView && mobileOverlayView(
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
          }

          <div className='fixed bottom-0 left-0 flex md:hidden justify-between w-full gap-1'>
            {
              isWalletConnected ? (
                <>
                  {
                    mobileShowClaims && (
                        <Button
                          type="default"
                          size="large"
                          className='btn-primary-white text-3xl w-full'
                          onClick={() => {
                            setMobileShowClaims(false);
                          }}
                        >
                          <LeftOutlined /> { stakingPoolForView ? stakingPoolForView?.stakingPool.name : "Validators" }
                        </Button>
                      )
                  }

                  {
                    !mobileShowClaims && stakingPoolForView && (
                      <Button
                        type="default"
                        size="large"
                        className='btn-primary-white text-3xl w-full'
                        onClick={() => {
                          selectStakingPoolForView(null);
                        }}
                      >
                        <LeftOutlined /> Validators
                      </Button>
                    )
                  }

                  {
                    !mobileShowClaims && (
                      <Button
                        type="default"
                        size="large"
                        className='btn-primary-cyan text-3xl w-full'
                        onClick={() => setMobileShowClaims(true)}
                      >
                        Claims ({availableForUnstaking.length + pendingUnstaking.length})
                      </Button>
                    )
                  }
                </>
              ) : (
                <Button
                  type="primary"
                  onClick={connectWallet}
                  loading={isWalletConnecting}
                  className="btn-primary-cyan text-3xl w-full"
                >
                  CONNECT WALLET<RightOutlined/>
                </Button>
              )
            }
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
