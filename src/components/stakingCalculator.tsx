import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useState } from "react"
import { Button, Input, Tooltip } from "antd"
import { WalletConnector } from "@/contexts/walletConnector"

import {
  formatPercentage,
  convertZilValueInToken,
  getTxExplorerUrl,
  formatAddress,
} from "@/misc/formatting"
import { formatUnits, parseEther } from "viem"
import { StakingOperations } from "@/contexts/stakingOperations"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import Link from "next/link"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"

const StakingCalculator: React.FC = () => {
  const { appConfig } = AppConfigStorage.useContainer()

  const { zilAvailable } = WalletConnector.useContainer()
  const {
    stake,
    isStakingInProgress,
    stakingCallTxHash,
    stakeContractCallError,
  } = StakingOperations.useContainer()

  const { stakingPoolForView } = StakingPoolsStorage.useContainer()

  const [zilToStake, setZilToStake] = useState<string>(
    formatUnits(
      stakingPoolForView?.stakingPool.definition.minimumStake || 0n,
      18
    )
  )

  useEffect(() => {
    onMinClick()
  }, [stakingPoolForView])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^-?\d*(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
      setZilToStake(inputValue)
    }
  }

  const handleFocus = () => {
    if (zilToStake === "") onMinClick()
  }

  const handleBlur = () => {
    let valueTemp = zilToStake
    if (
      zilToStake.charAt(zilToStake.length - 1) === "." ||
      zilToStake === "-"
    ) {
      valueTemp = zilToStake.slice(0, -1)
    }
    setZilToStake(valueTemp.replace(/0*(\d+)/, "$1"))

    if (zilToStake === "") onMinClick()
  }

  const zilToStakeNumber = parseFloat(zilToStake)

  const zilInWei = parseEther(zilToStake)
  const zilToStakeOk =
    !isNaN(zilToStakeNumber) && zilToStakeNumber <= (zilAvailable || 0n)
  const canStake =
    stakingPoolForView?.stakingPool.data &&
    zilToStakeNumber > 0 &&
    zilToStakeNumber <= (zilAvailable || 0n)

  const onMinClick = () => {
    setZilToStake(
      `${formatUnits(stakingPoolForView?.stakingPool.definition.minimumStake || 0n, 18)}`
    )
  }

  const onMaxClick = () => {
    setZilToStake(`${formatUnits(zilAvailable || 0n, 18)}`)
  }

  const isPoolLiquid = () =>
    stakingPoolForView?.stakingPool.definition.poolType ===
    StakingPoolType.LIQUID

  return (
    stakingPoolForView && (
      <>
        <div>
          <div className="flex justify-between gap-10 my-2.5 lg:my-7.5 p-3 lg:p-5 xl:p-7 bg-grey-gradient rounded-xl items-center">
            <div className="h-fit self-center">
              <Input
                className="flex items-baseline !bg-transparent !border-transparent !text-white1 bold33"
                //   ${
                //   zilToStakeOk ? '!text-white1' : '!text-red1'
                // }

                value={zilToStake}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                prefix="ZIL"
                status={!zilToStakeOk ? "error" : undefined}
              />
              <span className="flex items-center whitespace-nowrap ">
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    {isPoolLiquid() && (
                      <span className="medium17">
                        ~
                        {!isNaN(zilToStakeNumber) &&
                        !isNaN(
                          stakingPoolForView.stakingPool.data.zilToTokenRate
                        )
                          ? convertZilValueInToken(
                              zilToStakeNumber,
                              stakingPoolForView.stakingPool.data.zilToTokenRate
                            )
                          : ""}{" "}
                        {stakingPoolForView.stakingPool.definition.tokenSymbol}{" "}
                      </span>
                    )}
                    <span className="medium17 ml-2 text-aqua1">
                      ~
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </span>
                  </>
                ) : (
                  <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                )}
                <span className="medium17 text-aqua1"> APR</span>
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-[100px]">
              <Button
                className="btn-secondary-colored text-aqua1 hover:!text-aqua1 border-0 bg-tealDark hover:!bg-tealDark"
                onClick={onMaxClick}
              >
                MAX
              </Button>
              <Button
                className="btn-secondary-colored text-purple3 hover:!text-purple1 border-0 bg-PurpleDarker hover:!bg-PurpleDarker"
                onClick={onMinClick}
              >
                MIN
              </Button>
            </div>
          </div>
          <div className="flex mt-10 l:mt-12.5 mb-5">
            <Button
              type="default"
              size="large"
              className="btn-primary-gradient-aqua-lg lg:btn-primary-gradient-aqua mx-auto w-1/2"
              disabled={!canStake}
              onClick={() =>
                stake(
                  stakingPoolForView.stakingPool.definition.address,
                  zilInWei
                )
              }
              loading={isStakingInProgress}
            >
              Stake
            </Button>
          </div>
          <div className="flex justify-between pt-2.5 lg:pt-5 border-t border-black2">
            <div className="flex flex-col gap-3.5 regular-base">
              <div className=" ">
                Commission Fee:{" "}
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
                Max transaction cost: {zilToStake ? "0.01" : "0"}$
              </div>
            </div>
            <div className="flex flex-col max-xl:justify-between xl:gap-3.5 xl:items-end">
              {isPoolLiquid() && (
                <div className="flex flex-col xl:flex-row xl:gap-5">
                  <div className="gray-base">Rate</div>
                  {stakingPoolForView!.stakingPool.data && (
                    <div className="text-gray9">{`1 ZIL = ~${stakingPoolForView.stakingPool.data.zilToTokenRate} ${stakingPoolForView.stakingPool.definition.tokenSymbol}`}</div>
                  )}
                </div>
              )}
              <div className="text-gray9 text-aqua1 flex flex-row xl:gap-5">
                <Tooltip
                  placement="top"
                  arrow={true}
                  color="#555555"
                  className=" mr-1"
                  title="Annual Percentage Rate"
                >
                  <span className="gray-base">APR </span>
                </Tooltip>
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    ~
                    {formatPercentage(stakingPoolForView!.stakingPool.data.apr)}
                  </>
                ) : (
                  <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                )}
              </div>
            </div>
          </div>

          
        </div>

        {stakingCallTxHash !== undefined && (
          <div className="text-center gradient-bg-1 py-2">
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={getTxExplorerUrl(stakingCallTxHash, appConfig.chainId)}
              passHref={true}
            >
              Last staking transaction: {formatAddress(stakingCallTxHash)}
            </Link>
          </div>
        )}

        {stakeContractCallError && (
          <div className="text-red1 text-center">
            {stakeContractCallError.message}
          </div>
        )}
      </>
    )
  )
}

export default StakingCalculator
