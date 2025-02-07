import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useState } from "react"
import { Button, Input, Tooltip } from "antd"

import {
  formatPercentage,
  convertTokenToZil,
  formatUnitsToHumanReadable,
  getHumanFormDuration,
} from "@/misc/formatting"
import { formatUnits, parseEther } from "viem"
import { StakingOperations } from "@/contexts/stakingOperations"
import { DateTime } from "luxon"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"

const UnstakingCalculator: React.FC = () => {
  const { stakingPoolForView } = StakingPoolsStorage.useContainer()

  const { unstake, isUnstakingInProgress, unstakeContractCallError } =
    StakingOperations.useContainer()

  const [zilToUnstake, setZilToUnstake] = useState<string>("0")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^-?\d*(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
      setZilToUnstake(inputValue)
    }
  }

  const handleFocus = () => {
    if (zilToUnstake === "") onMaxClick()
  }

  const handleBlur = () => {
    let valueTemp = zilToUnstake
    if (
      zilToUnstake.charAt(zilToUnstake.length - 1) === "." ||
      zilToUnstake === "-"
    ) {
      valueTemp = zilToUnstake.slice(0, -1)
    }
    setZilToUnstake(valueTemp.replace(/0*(\d+)/, "$1"))
    if (zilToUnstake === "") onMaxClick()
  }

  useEffect(() => {
    setZilToUnstake("1")
  }, [stakingPoolForView])

  const stakedTokenAvailable =
    stakingPoolForView?.userData?.staked?.stakingTokenAmount || 0

  const zilToUnstakeNumber = parseFloat(zilToUnstake)
  const zilInWei = parseEther(zilToUnstake)
  const zilToUnstakeOk =
    !isNaN(zilToUnstakeNumber) && zilToUnstakeNumber <= stakedTokenAvailable
  const canUnstake =
    stakingPoolForView?.stakingPool.data &&
    zilToUnstakeNumber > 0 &&
    zilToUnstakeNumber <= stakedTokenAvailable

  const onMaxClick = () => {
    setZilToUnstake(
      `${formatUnits(
        stakingPoolForView?.userData?.staked?.stakingTokenAmount || 0n,
        stakingPoolForView?.stakingPool.definition.tokenDecimals || 18
      )}`
    )
  }

  const unboudingPeriod = getHumanFormDuration(
    DateTime.now().plus({
      minutes:
        stakingPoolForView?.stakingPool.definition.withdrawPeriodInMinutes || 0,
    })
  )

  const isPoolLiquid = () =>
    stakingPoolForView?.stakingPool.definition.poolType ===
    StakingPoolType.LIQUID

  return (
    stakingPoolForView && (
      <div>
        <div>
          <div className="flex justify-between gap-10 my-2.5 lg:my-7.5 p-3 lg:p-5 xl:p-7 bg-grey-gradient rounded-xl items-center">
            <div className="h-fit self-center">
              <Input
                className="flex items-baseline !bg-transparent !border-transparent !text-white1 text-40 font-semibold"
                //    ${
                //   zilToUnstakeOk ? '!text-white1' : '!text-red1'
                // }
                value={zilToUnstake}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                prefix={stakingPoolForView.stakingPool.definition.tokenSymbol}
                status={!zilToUnstakeOk ? "error" : undefined}
              />
              <div className="flex items-center ">
                {isPoolLiquid() && (
                  <span className="body2-medium">
                    {stakingPoolForView!.stakingPool.data ? (
                      <>
                        ~
                        {formatUnitsToHumanReadable(
                          convertTokenToZil(
                            zilInWei,
                            stakingPoolForView.stakingPool.data.zilToTokenRate
                          ),
                          18
                        )}
                      </>
                    ) : (
                      <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                    )}
                    ZIL
                  </span>
                )}
                <span className="body2-medium ml-2 text-aqua1">
                  {unboudingPeriod}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 max-w-[100px]">
              <Button
                className="btn-secondary-colored text-aqua1 hover:!text-aqua1 border-0 bg-aqua5 hover:!bg-aqua5"
                onClick={onMaxClick}
              >
                MAX
              </Button>
              <Button
                className="btn-secondary-colored text-purple3 hover:!text-purple1 border-0 bg-purple4 hover:!bg-purple4"
                onClick={() => setZilToUnstake("0")}
              >
                MIN
              </Button>
            </div>
          </div>

          <div className="flex justify-between pt-2.5 lg:pt-5 border-t border-black2">
            <div className="flex flex-col gap-3.5 regular-base">
              <div className=" ">
                Commission Fee:{" "}
                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    {" "}
                    {formatPercentage(
                      stakingPoolForView!.stakingPool.data.commission
                    )}{" "}
                  </>
                ) : (
                  <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                )}
              </div>
              <div className="">
                Max transaction cost: {zilToUnstake ? "0.01" : "0"}$
              </div>
              <div className="text-aqua1 ">
                Unbonding Period: {unboudingPeriod}
              </div>
            </div>
            <div className="flex flex-col max-xl:justify-between xl:gap-3.5 xl:items-end">
              {isPoolLiquid() && (
                <div className="flex flex-col xl:flex-row xl:gap-5">
                  <div className="gray-base">Rate</div>
                  <div className="text-gray9">
                    {stakingPoolForView!.stakingPool.data ? (
                      <>
                        1{" "}
                        {stakingPoolForView.stakingPool.definition.tokenSymbol}{" "}
                        = ~
                        {formatUnitsToHumanReadable(
                          convertTokenToZil(
                            parseEther("1"),
                            stakingPoolForView.stakingPool.data.zilToTokenRate
                          ),
                          18
                        )}
                      </>
                    ) : (
                      <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                    )}
                    ZIL
                  </div>
                </div>
              )}

              <div className="text-gray9 flex flex-row xl:gap-5">
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

          {unstakeContractCallError && (
            <div className="text-red1 text-center">
              {unstakeContractCallError.message}
            </div>
          )}
          <div className="flex mt-10 l:mt-12.5 mb-5">
            <Button
              type="default"
              size="large"
              className="btn-primary-gradient-aqua-lg lg:btn-primary-gradient-aqua mx-auto w-1/2"
              disabled={!canUnstake}
              onClick={() =>
                unstake(
                  stakingPoolForView.stakingPool.definition.address,
                  zilInWei
                )
              }
              loading={isUnstakingInProgress}
            >
              Unstake
            </Button>
          </div>
        </div>
      </div>
    )
  )
}

export default UnstakingCalculator
