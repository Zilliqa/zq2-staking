import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage, convertZilValueInToken, getTxExplorerUrl, formatAddress } from "@/misc/formatting";
import { formatUnits, parseEther } from "viem";
import { StakingOperations } from "@/contexts/stakingOperations";
 import { AppConfigStorage } from "@/contexts/appConfigStorage";
import Link from "next/link";


const StakingCalculator: React.FC = () => {
  const {
    appConfig
  } = AppConfigStorage.useContainer();

  const {
    zilAvailable,
  } = WalletConnector.useContainer();

  const {
    stake,
    isStakingInProgress,
    stakingCallTxHash,
    stakeContractCallError,
  } = StakingOperations.useContainer();

  const {
    stakingPoolForView
  } = StakingPoolsStorage.useContainer();

  const [zilToStake, setZilToStake] = useState<string>(formatUnits(stakingPoolForView?.stakingPool.definition.minimumStake || 0n, 18));

  useEffect(() => {
    setZilToStake("0.00");
  }, [stakingPoolForView]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (
      reg.test(inputValue) ||
      inputValue === '' ||
      inputValue === '-'
    ) {
      setZilToStake(inputValue);
    }
  };

  const handleFocus = () => {
     if (zilToStake === '0.00') setZilToStake('');
  };

  const handleBlur = () => {
    let valueTemp = zilToStake;
    
    if (
      zilToStake.charAt(zilToStake.length - 1) === '.' ||
      zilToStake === '-'
    ) {
      valueTemp = zilToStake.slice(0, -1);
    }
    setZilToStake(valueTemp.replace(/0*(\d+)/, '$1'));

    if (zilToStake === '') setZilToStake('0.00');
  };

  const zilToStakeNumber = parseFloat(zilToStake);
        
  const zilInWei = parseEther(zilToStake);
  const zilToStakeOk =  !isNaN(zilToStakeNumber) && zilToStakeNumber <= (zilAvailable || 0n);
  const canStake = stakingPoolForView?.stakingPool.data && zilToStakeNumber > 0 && zilToStakeNumber <= (zilAvailable || 0n);

  const onMinClick = () => {
    setZilToStake(`${formatUnits(stakingPoolForView?.stakingPool.definition.minimumStake || 0n, 18) }`)
  }

  const onMaxClick = () => {
    setZilToStake(`${formatUnits(zilAvailable || 0n, 18) }`)
  }
  

  return (
    stakingPoolForView && (
      <>
        <div>
          <div className="flex justify-between gap-10 my-2.5 lg:my-7.5 p-3 lg:p-5 xl:p-7.5 bg-darkbg rounded-3xl">
            <div className="h-fit self-center">
              <Input
                className={`h3 flex items-baseline !bg-transparent !border-transparent ${
                  zilToStakeOk ? '!text-gray4' : '!text-red1'
                }`}
                value={zilToStake}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                prefix="ZIL"
                status={!zilToStakeOk ? 'error' : undefined}
              />
              <span className="flex items-center ">
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    <span className="body1">
                      ~
                      {convertZilValueInToken(
                        zilToStakeNumber,
                        stakingPoolForView.stakingPool.data
                          .zilToTokenRate
                      )}{' '}
                      {
                        stakingPoolForView.stakingPool.definition
                          .tokenSymbol
                      }{' '}
                    </span>
                    <span className="body1 ml-2 text-aqua1">
                      ~
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </span>
                  </>
                ) : (
                  <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                )}
                <span className="body1 text-aqua1"> APR</span>
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-[100px]">
              <Button
                className="btn-secondary-colored text-aqua2 hover:!text-aqua2 hover:!border-aqua2 border-aqua2"
                onClick={onMaxClick}
              >
                MAX
              </Button>
              <Button
                className="btn-secondary-colored text-purple1 hover:!text-purple1 hover:!border-purple1 border-purple1"
                onClick={onMinClick}
              >
                MIN
              </Button>
            </div>
          </div>

          <div className="flex justify-between pt-2.5 lg:pt-5 border-t border-black2">
            <div className="flex flex-col gap-3.5 regular-base">
              <div className=" ">
                Commission Fee:{' '}
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    {formatPercentage(
                      stakingPoolForView!.stakingPool.data.commission
                    )}
                  </>
                ) : (
                  <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                )}
              </div>
              <div className="">
                Max transaction cost: {zilToStake ? '0.01' : '0'}$
              </div>
            </div>
            <div className="flex flex-col max-xl:justify-between xl:gap-3.5 xl:items-end">
              <div className="base flex flex-col xl:flex-row xl:gap-5">
                <div>Rate</div>
                   {stakingPoolForView!.stakingPool.data && (
                <div>{`1 ZIL = ~${convertZilValueInToken(zilToStakeNumber, stakingPoolForView.stakingPool.data.zilToTokenRate)} ${stakingPoolForView.stakingPool.definition.tokenSymbol}`}</div>
                  )}
              </div>
              <div className=" regular-base text-aqua1 flex flex-row xl:gap-5">
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
              disabled={!canStake}
              onClick={() => stake(stakingPoolForView.stakingPool.definition.address, zilInWei)}
              loading={isStakingInProgress}            >
              STAKE
            </Button>
          </div>
        </div>

        {
          stakingCallTxHash !== undefined && (
            <div className="text-center gradient-bg-1 py-2">
              <Link rel="noopener noreferrer" target="_blank" href={getTxExplorerUrl(stakingCallTxHash, appConfig.chainId)} passHref={true}>
                Last staking transaction: {formatAddress(stakingCallTxHash)}
              </Link>
            </div>
          )
        } 

        {stakeContractCallError && (
          <div className="text-red-500 text-center">
            {stakeContractCallError.message}
          </div>
        )}
    </>
    )
  );
};

export default StakingCalculator; 