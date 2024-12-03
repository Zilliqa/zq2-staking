import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage, formattedTokenValueInZil } from "@/misc/formatting";

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

  const [zilToUnstake, setZilToUnstake] = useState<string>("0");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      setZilToUnstake(inputValue);
    }
  };

  const handleBlur = () => {
    let valueTemp = zilToUnstake;
    if (zilToUnstake.charAt(zilToUnstake.length - 1) === '.' || zilToUnstake === '-') {
      valueTemp = zilToUnstake.slice(0, -1);
    }
    setZilToUnstake(valueTemp.replace(/0*(\d+)/, '$1'));
  };

  useEffect(() => {
    setZilToUnstake("0");
  }, [stakingPoolForView])

  const stakedTokenAvailable = stakingPoolForView?.userData?.staked?.stakedZil || 0;

  const zilToUnstakeNumber = parseFloat(zilToUnstake);
  const zilToUnstakeOk =  !isNaN(zilToUnstakeNumber) && zilToUnstakeNumber <= stakedTokenAvailable;
  const canUnstake = stakingPoolForView?.stakingPool.data && zilToUnstakeNumber > 0 && zilToUnstakeNumber <= stakedTokenAvailable;

  return stakingPoolForView && (
    <div className="bg-black">
      <div>
        <div className="flex justify-between my-3 p-5 border-2 bg-[#20202580] bg-opacity-50">
          <div className='grid text-3xl justify-center my-auto'>
            <Input
                className={`!bg-[#20202580] !border-[#20202580] ${zilToUnstakeOk ? "!text-white" : "!text-red-500"} !text-3xl`}
                value={zilToUnstake}
                onChange={handleChange}
                onBlur={handleBlur}
                suffix={stakingPoolForView.stakingPool.definition.tokenSymbol}
                status={ !zilToUnstakeOk ? "error" : undefined }
              />
              <div className='flex items-center text-xs ml-2 mt-3'>
                {
                  stakingPoolForView!.stakingPool.data ? <>
                    ~{formattedTokenValueInZil(zilToUnstakeNumber, stakingPoolForView.stakingPool.data.zilToTokenRate)}
                  </> : <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                }
                ZIL
              </div>
            
          </div>
          <div className='grid'>
            <Button className='mb-3 btn-primary-white' onClick={() => setZilToUnstake(stakingPoolForView.userData?.staked?.stakedZil.toString() || "0")} >MAX</Button>
            <Button className="btn-primary-white" onClick={() => setZilToUnstake("0")}>MIN</Button>
          </div>
        </div>

        <div className="flex justify-between my-3">
          <p className="flex items-center text-lg font-bold">You will receive</p>
          <p className="flex items-center">
            Reward fee
            {
              stakingPoolForView!.stakingPool.data ? <>
                {formatPercentage(stakingPoolForView!.stakingPool.data.commission)}
              </> : <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
            }
          </p>
        </div>
        
        <div className="flex justify-between my-3">
          <p className="text-gray-500">Max transaction cost {zilToUnstake ? '0.01' : '0' }$</p>
          <p className="flex items-center text-gray-500">
            Annual % rate:
            {
              stakingPoolForView!.stakingPool.data ? <>
                {formatPercentage(stakingPoolForView!.stakingPool.data.apr)}
              </> : <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
            }
          </p>
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
                disabled={!canUnstake}
                onClick={() => onStakeClick(zilToUnstakeNumber)}
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