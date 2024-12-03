import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage, formattedZilValueInToken } from "@/misc/formatting";

interface StakingCalculatorProps {
  onStakeClick: (zilToStake: number) => void;
}

const StakingCalculator: React.FC<StakingCalculatorProps> = ({
  onStakeClick
}) => {
  const {
    zilAvailable
  } = WalletConnector.useContainer();

  const {
    stakingPoolForView
  } = StakingPoolsStorage.useContainer();

  const [zilToStake, setZilToStake] = useState<string>("");

  useEffect(() => {
    setZilToStake("0");
  }, [stakingPoolForView])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      setZilToStake(inputValue);
    }
  };

  const handleBlur = () => {
    let valueTemp = zilToStake;
    if (zilToStake.charAt(zilToStake.length - 1) === '.' || zilToStake === '-') {
      valueTemp = zilToStake.slice(0, -1);
    }
    setZilToStake(valueTemp.replace(/0*(\d+)/, '$1'));
  };

  const zilToStakeNumber = parseFloat(zilToStake);
  const zilToStakeOk =  !isNaN(zilToStakeNumber) && zilToStakeNumber <= zilAvailable;
  const canStake = stakingPoolForView?.stakingPool.data && zilToStakeNumber > 0 && zilToStakeNumber <= zilAvailable;

  return stakingPoolForView && (
    <>
      <div>
        <div className="flex justify-between my-3 p-5 border-2 bg-[#20202580] bg-opacity-50">
          <div className='grid text-3xl justify-center my-auto'>
            <Input
              className={`!bg-[#20202580] !border-[#20202580] ${zilToStakeOk ? "!text-white" : "!text-red-500"} !text-3xl`}
              value={zilToStake}
              onChange={handleChange}
              onBlur={handleBlur}
              suffix="ZIL"
              status={ !zilToStakeOk ? "error" : undefined }
            />
            <div className='flex items-center text-xs ml-2 mt-3'>
              {
                stakingPoolForView!.stakingPool.data ? <>
                  ~{formattedZilValueInToken(zilToStakeNumber, stakingPoolForView.stakingPool.data.zilToTokenRate)} {stakingPoolForView.stakingPool.definition.tokenSymbol} + {formatPercentage(stakingPoolForView!.stakingPool.data.apr)}
                </> : <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
              }
              APR
            </div>
            
          </div>
          <div className='grid'>
            <Button className='mb-3 btn-primary-white' onClick={() => setZilToStake(`${zilAvailable}`)} >MAX</Button>
            <Button className="btn-primary-white" onClick={() => setZilToStake("0")}>MIN</Button>
          </div>
        </div>

        <div className="flex justify-between my-3">
          <p className="text-lg font-bold">You will receive</p>
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
          <p className="text-gray-500">Max transaction cost {zilToStake ? '0.01' : '0' }$</p>
          <p className="flex items-center text-gray-500">
            Annual % rate:
            {
              stakingPoolForView!.stakingPool.data ? <>
                {formatPercentage(stakingPoolForView!.stakingPool.data.apr)}
              </> : <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
            }
          </p>
        </div>

        <div className='flex my-5'>
          <Button
            type="default"
            size="large"
            className='w-full text-3xl btn-primary-white'
            disabled={!canStake}
            onClick={() => onStakeClick(zilToStakeNumber)}
          >
            STAKE
          </Button>
      </div>
      </div>
    </>
  )
}

export default StakingCalculator;