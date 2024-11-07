import { Button, Modal } from 'antd';
import { UserOutlined, MenuOutlined, SearchOutlined, BellOutlined, RightOutlined, ArrowRightOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import { WalletConnector } from '@/contexts/walletConnector';
import StakingPoolsList from '@/components/stakingPoolsList';
import StakingCalculator from '@/components/stakingCalculator';
import StakingPoolDetailsView from '@/components/stakingPoolDetailsView';
import { useState } from 'react';

const HomePage = () => {
  const {
    connectWallet,
    isWalletConnected,
    isWalletConnecting,
    stakedZilAvailable,
    zilAvailable,
    walletAddress,
    disconnectWallet,
  } = WalletConnector.useContainer();

  const {
    stakingPoolForView,
    selectStakingPoolForStaking,
    selectStakingPoolForView
  } = StakingPoolsStorage.useContainer();

  const [isDummyPopupOpen, setIsDummyPopupOpen] = useState(false);
  const [dummyPopupContent, setDummyPopupContent] = useState<string | null>(null);

  const onStake = (zilToStake: number) => {
    setDummyPopupContent(`Now User gonna approve the wallet transaction for staking ${zilToStake} ZIL`);
    setIsDummyPopupOpen(true);
  }

  const onUnstake = () => {
    setDummyPopupContent(`Now User gonna approve the wallet transaction for unstaking`);
    setIsDummyPopupOpen(true);
  }

  const onClaimRewards = (reward: number) => {
    setDummyPopupContent(`Now User gonna approve the wallet transaction for claiming ${reward} rewards`);
    setIsDummyPopupOpen(true);
  }

  return (
    <div className="h-screen w-screen relative bg-[url('https://s3-alpha-sig.figma.com/img/acca/f051/9680833a8fdb37b0832ba5eaa00687e3?Expires=1731888000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=SifuNWtD60CUj-Z2RX3XVGB2XbymEPkmFrbgdnjwkEL2dn6BQjqOH43KjAAIf905WUJtCp4HWTU1rIFrG04uO7t2A8o2-Esx4bMXo5aMZdJtaDwaEx~xuKEQcxdBGhry7~8IfSqs~AdsIYpvs~2MeuLE7dv4hr1jcU6G2r3LKFrW9DMDUc6H4Umkz3yxFuXyl0HABYDhBHEzUhRccwsHczrfIG9TMQKp3hDK2leHrRgf0q7I73yjqUYxJNw97j4UpCGgDjNII1jNMe9KeY5A8xTSkXkB2GvbNXn-A~1V9iKuugWYvCKogUx6GD2OeE5DoxOZpkd-ehlJnbK3~5oLTg__')] bg-center bg-no-repeat bg-cover bg-origin-content">

      {/* Header */}
      <div className="absolute z-50 top-0 left-0 h-[4em] w-full flex items-center justify-between p-4 text-white border-b-2 border-white">
        <div className="flex items-center">
          <img src="https://zil-dev.cdn.prismic.io/zil-dev/f3b97b97-e98b-4767-9b24-9474b9c20a83_Asset+1.svg" alt="Zilliqa Logo" className="h-8 w-auto" />
        </div>

        <div className="flex items-center space-x-4">
          <SearchOutlined className="text-xl" />
          <a href="#" className="hover:underline">
            HELP
          </a>
          <a href="#" className="hover:underline">
            DEV DOCS
          </a>
          <BellOutlined className="text-xl" />
          <UserOutlined className="text-xl" />
          <MenuOutlined className="text-xl" />
        </div>
      </div>


      {/* Left column */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 h-screen gap-5 pt-[4em]">
        <div className="p-8">
          <StakingPoolsList />
          <StakingCalculator onStakeClick={onStake} />
        </div>

        {/* Right column - only visible on desktop */}
        <div className="hidden md:grid h-full">
          <div>
            {
              stakingPoolForView ? (
                <StakingPoolDetailsView
                  selectStakingPoolForStaking={selectStakingPoolForStaking}
                  stakingPoolData={stakingPoolForView.stakingPool}
                />
              ) : (
                <div className="items-center justify-center text-center text-white p-8">
                  <h1 className="text-4xl font-bold">Liquid Staking with Zilliqa</h1>
                    <p className="mt-4 text-lg">
                      Help us Empower and secure the Zilliqa Chain
                    </p>
                </div>
              )
            }
          </div>

          {/* User data section */}
          <div className='mt-auto'>
            {
              isWalletConnected ? <div className='p-8'>
                {
                  stakingPoolForView && (
                    <div className='flex justify-between my-5 gap-3'>
                      <Button
                        type="default"
                        size="large"
                        className='btn-primary-white text-3xl w-full'
                        disabled={(stakingPoolForView.userData?.stakedZil || 0) === 0}
                        onClick={onUnstake}
                      >
                        UNSTAKE <ArrowRightOutlined className='ml-2' />
                      </Button>

                      <Button
                        type="default"
                        size="large"
                        className='btn-primary-cyan text-3xl w-full'
                        disabled={(stakingPoolForView.userData?.rewardAcumulated || 0) === 0}
                        onClick={() => onClaimRewards(stakingPoolForView.userData?.rewardAcumulated || 0)}
                      >
                        CLAIM <ArrowRightOutlined className='ml-2' />
                      </Button>
                    </div>
                  )
                }

                <div className='border-2 border-black p-2'>
                  <div className='flex justify-between'>
                    <p className="text-lg">Wallet Address: {walletAddress}</p>
                    <Button onClick={disconnectWallet}>Disconnect</Button>
                  </div>
                  <div className='flex justify-between'>
                    <p className="text-lg">{zilAvailable} ZIL</p>
                    <p>{zilAvailable * 0.06}$</p>
                  </div>
                  <div>
                    <p className="mt-4 text-lg">{stakedZilAvailable} stZIL</p>
                  </div>
                </div>
              </div> : (
                <div className='flex flex-col items-center my-32'>
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
              )
            }
          </div>
        </div>

        {
          stakingPoolForView && (
              <div className='absolute block md:hidden top-0 left-0 z-25 bg-black pt-[4em] h-full'>
                <div className='flex justify-end p-3'>
                  <CloseCircleOutlined className='m-2 text-5xl' onClick={() => selectStakingPoolForView(null)} />
                </div>
                <StakingPoolDetailsView
                  selectStakingPoolForStaking={(stakingPoolId) => {
                    selectStakingPoolForView(null);
                    selectStakingPoolForStaking(stakingPoolId);
                  }}
                  stakingPoolData={stakingPoolForView.stakingPool}
                />
              </div>
          )
        }

      </div>

      <Modal title="User Wallet Interaction" open={isDummyPopupOpen} onOk={() => setIsDummyPopupOpen(false)} onCancel={() => setIsDummyPopupOpen(false)}>
        <div>
          {dummyPopupContent}
        </div>
      </Modal>

    </div>
  );
};

export default HomePage;
