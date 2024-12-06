import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { formatPercentage, convertTokenToZil, formatUnitsToHumanReadable } from "@/misc/formatting";
import { formatUnits, parseEther } from "viem";
import { StakingOperations } from "@/contexts/stakingOperations";


const UnstakingCalculator: React.FC = () => {
  const {
    stakingPoolForView
  } = StakingPoolsStorage.useContainer();

  const {
    unstake,
    isUnstakingInProgress,
    unstakeContractCallError,
  } = StakingOperations.useContainer();

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

  const stakedTokenAvailable = stakingPoolForView?.userData?.staked?.stakingTokenAmount || 0;

  const zilToUnstakeNumber = parseFloat(zilToUnstake);
  const zilInWei = parseEther(zilToUnstake);
  const zilToUnstakeOk =  !isNaN(zilToUnstakeNumber) && zilToUnstakeNumber <= stakedTokenAvailable;
  const canUnstake = stakingPoolForView?.stakingPool.data && zilToUnstakeNumber > 0 && zilToUnstakeNumber <= stakedTokenAvailable;

  const onMaxClick = () => {
    setZilToUnstake(`${formatUnits(
      stakingPoolForView?.userData?.staked?.stakingTokenAmount || 0n,
      stakingPoolForView?.stakingPool.definition.tokenDecimals || 18)
    }`)
  }

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
                    ~{formatUnitsToHumanReadable(
                      convertTokenToZil(zilInWei, stakingPoolForView.stakingPool.data.zilToTokenRate),
                      18
                    )}
                  </> : <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                }
                ZIL
              </div>
            
          </div>
          <div className='grid'>
            <Button className='mb-3 btn-primary-white' onClick={onMaxClick} >MAX</Button>
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

        {unstakeContractCallError && (
          <div className="text-red-500 text-center">
            {unstakeContractCallError.message}
          </div>
        )}

        <div className='flex my-5'>
          <Button
            type="default"
            size="large"
            className='w-full text-3xl btn-primary-white'
            disabled={!canUnstake}
            onClick={() => unstake(stakingPoolForView.stakingPool.definition.address, zilInWei)}
            loading={isUnstakingInProgress}
          >
            UNSTAKE
          </Button>
        </div>

      </div>
    </div>
  )
}

export default UnstakingCalculator;