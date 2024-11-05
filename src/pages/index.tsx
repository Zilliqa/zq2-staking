import { Button, Collapse } from 'antd';
import { UserOutlined, MenuOutlined, SearchOutlined, BellOutlined, RightOutlined } from '@ant-design/icons';
import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import StakingPoolCard from '@/components/stakingPoolCard';
import { WalletConnector } from '@/contexts/walletConnector';
import { useState } from 'react';

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
}


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
    combinedStakingPoolsData,
    selectStakingPool,
    selectedStakingPool,
  } = StakingPoolsStorage.useContainer();

  const [zilToStake, setZilToStake] = useState(0);

  const navigatorItems = [
    {
      key: "staking_pools",
      label: "Staking Pools",
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinedStakingPoolsData.map(({ stakingPool, userData }) => (
            <StakingPoolCard
              key={stakingPool.name}
              stakingPoolData={stakingPool}
              userStakingPoolData={userData}
              isStakingPoolSelected={selectedStakingPool?.id === stakingPool.id}
              onClick={() => selectStakingPool(stakingPool.id)}
            />
          ))}
        </div>
      ),
    },
    {
      key: "calculator",
      label: "Calculator",
      children: selectedStakingPool && (
          <div>
            <div className="flex justify-between my-3 p-5 border-2 bg-gray-50">
              <div className='grid text-3xl justify-center my-auto'>
                <div>
                  {zilToStake} ZIL
                </div>
                <div className='text-xs'>
                  ~{zilToStake} stZIL + {formatPercentage(selectedStakingPool!.apy)} APY
                </div>
                
              </div>
              <div className='grid'>
                <Button className='mb-3' onClick={() => setZilToStake(zilAvailable)} >MAX</Button>
                <Button onClick={() => setZilToStake(0)}>MIN</Button>
              </div>
            </div>

            <div className="flex justify-between my-3">
              <p className="text-lg font-bold">You will receive</p>
              <p>Reward fee {formatPercentage(selectedStakingPool.rewardFee)}</p>
            </div>
            
            <div className="flex justify-between my-3">
              <p className="text-gray-500">Max transaction cost {zilToStake ? '0.01' : '0' }$</p>
              <p className="text-gray-500">Annual % rate: {formatPercentage(selectedStakingPool!.apy)}</p>
            </div>

            <div className='flex my-5'>
              <Button
                type="default"
                size="large"
                className='w-full text-3xl'
              >
                Stake
              </Button>
            </div>
          </div>
      )
    }
  ]

  const activeKeys = selectedStakingPool && isWalletConnected ? ['staking_pools', 'calculator'] : ['staking_pools'];

  return (
    <div className="h-screen relative">

      {/* Header */}
      <div className="fixed z-50 top-0 left-0 h-[4em] w-full flex items-center justify-between p-4 bg-yellow-50 text-black">
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
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen gap-5 pt-[4em]">
        <div className="text-white p-8 bg-green-400">
          <Collapse items={navigatorItems} activeKey={activeKeys} />

          {
            !isWalletConnected && <div className="mt-8">
              <Button
                onClick={connectWallet}
                loading={isWalletConnecting}
                type="primary"
                className="w-full"
              >
                Connect Wallet First
              </Button>
            </div>
          }
        </div>

        {/* Right column - only visible on desktop */}
        <div className="hidden md:grid bg-blue-400 h-full">

          <div>
            {
              selectedStakingPool ? (
                <div className="bg-grey-400 h-full p-8">
                  <div className='text-3xl'>
                    {selectedStakingPool.name}
                  </div>
                  <div className='text-lg'>
                    info
                  </div>
                  <div className='text-lg'>
                    {selectedStakingPool.description}
                  </div>
                </div>
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
                  selectedStakingPool && (
                    <div className='flex my-5'>
                      <Button
                        type="default"
                        size="large"
                        className='w-full text-3xl'
                      >
                        Unstake
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
                    className="mt-8 bg-teal-500 border-none hover:bg-teal-600"
                  >
                    SIGN IN / CONNECT WALLET<RightOutlined />
                  </Button>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
