import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage } from "@/misc/formatting";

interface UnstakingCalculatorProps {
  onStakeClick: (zilToStake: number) => void;
}

const UnstakingCalculator: React.FC<UnstakingCalculatorProps> = ({
  onStakeClick
}) => {
  const {
    connectWallet,
    isWalletConnecting,
    isWalletConnected
  } = WalletConnector.useContainer();

  const {
    stakingPoolForView
  } = StakingPoolsStorage.useContainer();

  const [zilToUnstake, setZilToUnstake] = useState(0);


  useEffect(() => {
    setZilToUnstake(0);
  }, [stakingPoolForView])

  return stakingPoolForView && (
    <div className="bg-black">
      <div>
        <div className="flex justify-between my-3 p-5 border-2 bg-[#20202580] bg-opacity-50">
          <div className='grid text-3xl justify-center my-auto'>
            <div>
              {zilToUnstake} stZIL
            </div>
            <div className='text-xs'>
              {zilToUnstake} ZIL
            </div>
            
          </div>
          <div className='grid'>
            <Button className='mb-3 btn-primary-white' onClick={() => setZilToUnstake(stakingPoolForView.userData?.stakedZil || 0)} >MAX</Button>
            <Button className="btn-primary-white" onClick={() => setZilToUnstake(0)}>MIN</Button>
          </div>
        </div>

        <div className="flex justify-between my-3">
          <p className="text-lg font-bold">You will receive</p>
          <p>Reward fee {formatPercentage(stakingPoolForView!.stakingPool.commission)}</p>
        </div>
        
        <div className="flex justify-between my-3">
          <p className="text-gray-500">Max transaction cost {zilToUnstake ? '0.01' : '0' }$</p>
          <p className="text-gray-500">Annual % rate: {formatPercentage(stakingPoolForView!.stakingPool.apy)}</p>
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
                disabled={zilToUnstake === 0}
                onClick={() => onStakeClick(zilToUnstake)}
              >
                UNSTAKE
              </Button>
          </div>
          )
        }
      </div>
    </div>
  )
}

export default UnstakingCalculator;