import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage, formattedTokenValueInZil } from "@/misc/formatting";

interface UnstakingCalculatorProps {
  onUnstakeClick: (zilToStake: number) => void;
}

const UnstakingCalculator: React.FC<UnstakingCalculatorProps> = ({
  onUnstakeClick
}) => {
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
  
  const handleFocus = () => {
    if (zilToUnstake === '0.00') setZilToUnstake('');
 };

  const handleBlur = () => {
    let valueTemp = zilToUnstake;
    if (zilToUnstake.charAt(zilToUnstake.length - 1) === '.' || zilToUnstake === '-') {
      valueTemp = zilToUnstake.slice(0, -1);
    }
    setZilToUnstake(valueTemp.replace(/0*(\d+)/, '$1'));
    if (zilToUnstake === '') setZilToUnstake('0.00');

  };

  useEffect(() => {
    setZilToUnstake("0.00");
  }, [stakingPoolForView])

  const stakedTokenAvailable = stakingPoolForView?.userData?.staked?.stakedZil || 0;

  const zilToUnstakeNumber = parseFloat(zilToUnstake);
  const zilToUnstakeOk =  !isNaN(zilToUnstakeNumber) && zilToUnstakeNumber <= stakedTokenAvailable;
  const canUnstake = stakingPoolForView?.stakingPool.data && zilToUnstakeNumber > 0 && zilToUnstakeNumber <= stakedTokenAvailable;

  return stakingPoolForView && (
    <div className="bg-black">
      <div>
      <div className="flex justify-between gap-10 my-2.5 lg:my-7.5 p-3 lg:p-5 xl:p-7.5 bg-darkbg rounded-3xl">
      <div className='h-fit self-center'>
            <Input
                className={`h3 flex items-baseline !bg-transparent !border-transparent ${
                  zilToUnstakeOk ? '!text-gray4' : '!text-red1'
                }`}                
                value={zilToUnstake}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                prefix={stakingPoolForView.stakingPool.definition.tokenSymbol}
                status={ !zilToUnstakeOk ? "error" : undefined }
              />
              <div className='flex items-center '>
              <span className="body1">

                {
                  stakingPoolForView!.stakingPool.data ? <>
                    ~{formattedTokenValueInZil(zilToUnstakeNumber, stakingPoolForView.stakingPool.data.zilToTokenRate)}
                  </> : <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                }
                ZIL
              </span>
              <span className="body1 ml-2 text-aqua1">
                      ~5 days
                    </span>
                    </div>
            
          </div>
          <div className="flex flex-col gap-3 max-w-[100px]">
          <Button                 
          className="btn-secondary-colored text-aqua2 hover:!text-aqua2 hover:!border-aqua2 border-aqua2"
 onClick={() => setZilToUnstake(stakingPoolForView.userData?.staked?.stakedZil.toString() || "0")} >MAX</Button>
            <Button                
            className="btn-secondary-colored text-purple1 hover:!text-purple1 hover:!border-purple1 border-purple1"
 onClick={() => setZilToUnstake("0")}>MIN</Button>
          </div>
        </div>

        <div className="flex justify-between pt-2.5 lg:pt-5 border-t border-black2">
            <div className="flex flex-col gap-3.5 regular-base">
              <div className=" ">
                Commission Fee:{' '}
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    {' '}
                    {formatPercentage(
                      stakingPoolForView!.stakingPool.data.commission
                    )}{' '}
                  </>
                ) : (
                  <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                )}
              </div>
              <div className="">
                Max transaction cost: {zilToUnstake ? '0.01' : '0'}$
              </div>
              <div className="text-aqua1 ">
                Unbonding Period: {zilToUnstake ? '0.01' : '0'}$
              </div>
            </div>
            <div className="flex flex-col max-xl:justify-between xl:gap-3.5 xl:items-end">
              <div className="base flex flex-col xl:flex-row xl:gap-5">
                <div>Rate</div>
                <div>{`1 ZIL = zilToTokenRate ${stakingPoolForView.stakingPool.definition.tokenSymbol}`}</div>
              </div>
              <div className=" regular-base flex flex-row xl:gap-5">
                <div>APR:</div>
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    ~{formatPercentage(
                      stakingPoolForView!.stakingPool.data.apr
                    )}
                  </>
                ) : (
                  <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                )}
              </div>
            </div>
          </div>
        
          <div className="flex mt-10 l:mt-12.5 mb-5">
            <Button
              type="default"
              size="large"
              className="btn-primary-gradient-aqua-lg lg:btn-primary-gradient-aqua"
              disabled={!canUnstake}
              onClick={() => onUnstakeClick(zilToUnstakeNumber)}
            >
              UNSTAKE
            </Button>
          </div>
 
      </div>
    </div>
  )
}

export default UnstakingCalculator;