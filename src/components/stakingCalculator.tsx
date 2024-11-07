import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useState } from "react";
import { Button } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage } from "@/misc/formatting";

interface StakingCalculatorProps {
  onStakeClick: (zilToStake: number) => void;
}

const StakingCalculator: React.FC<StakingCalculatorProps> = ({
  onStakeClick
}) => {
  const {
    zilAvailable,
    connectWallet,
    isWalletConnecting,
    isWalletConnected
  } = WalletConnector.useContainer();

  const {
    stakingPoolForStaking
  } = StakingPoolsStorage.useContainer();

  const [zilToStake, setZilToStake] = useState(0);

  return (
    <div className="bg-black p-10">
      <div className="text-4xl pb-5">
        Calculator
      </div>

      {
        stakingPoolForStaking && (
          <div>
            <div className="flex justify-between my-3 p-5 border-2 bg-[#20202580] bg-opacity-50">
              <div className='grid text-3xl justify-center my-auto'>
                <div>
                  {zilToStake} ZIL
                </div>
                <div className='text-xs'>
                  ~{zilToStake} stZIL + {formatPercentage(stakingPoolForStaking!.stakingPool.apy)} APY
                </div>
                
              </div>
              <div className='grid'>
                <Button className='mb-3 btn-primary-white' onClick={() => setZilToStake(zilAvailable)} >MAX</Button>
                <Button className="btn-primary-white" onClick={() => setZilToStake(0)}>MIN</Button>
              </div>
            </div>

            <div className="flex justify-between my-3">
              <p className="text-lg font-bold">You will receive</p>
              <p>Reward fee {formatPercentage(stakingPoolForStaking!.stakingPool.rewardFee)}</p>
            </div>
            
            <div className="flex justify-between my-3">
              <p className="text-gray-500">Max transaction cost {zilToStake ? '0.01' : '0' }$</p>
              <p className="text-gray-500">Annual % rate: {formatPercentage(stakingPoolForStaking!.stakingPool.apy)}</p>
            </div>

            {
              !isWalletConnected ? (
                <div className="mt-8">
                  <Button
                    onClick={connectWallet}
                    loading={isWalletConnecting}
                    type="primary"
                    className="w-full text-3xl btn-primary-cyan"
                  >
                    Connect Wallet First
                  </Button>
                </div>
              ) : (
                <div className='flex my-5'>
                  <Button
                    type="default"
                    size="large"
                    className='w-full text-3xl btn-primary-white'
                    disabled={zilToStake === 0}
                    onClick={() => onStakeClick(zilToStake)}
                  >
                    STAKE
                  </Button>
              </div>
              )
            }
          </div>
        )
      }

    </div>
  )
}

export default StakingCalculator;