import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useState } from "react"
import { Button, Input, Tooltip } from "antd"
import { WalletConnector } from "@/contexts/walletConnector"

import {
  formatPercentage,
  convertZilValueInToken,
  getTxExplorerUrl,
  formatAddress,
  getHumanFormDuration,
} from "@/misc/formatting"
import { formatUnits, parseEther } from "viem"
import { StakingOperations } from "@/contexts/stakingOperations"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import Link from "next/link"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import CustomWalletConnect from "./customWalletConnect"
import { DateTime } from "luxon"

const StakingCalculator: React.FC = () => {
  const { appConfig } = AppConfigStorage.useContainer()

  const { connectDummyWallet, isWalletConnected, isDummyWalletConnecting } =
    WalletConnector.useContainer()

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

      const unboudingPeriod = getHumanFormDuration(
        DateTime.now().plus({
          minutes:
            stakingPoolForView?.stakingPool.definition.withdrawPeriodInMinutes || 0,
        })
      )

  return (
    stakingPoolForView && (
      <>
        <div className="">
          <div className="flex justify-between lg:gap-10 4k:gap-14 my-2.5 lg:my-4 4k:my-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl items-center">
            <div className="h-fit self-center">
              <Input
                className="flex items-baseline !bg-transparent !border-transparent !text-white1 bold33 px-0"
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
                    <span className="medium17 ml-2 text-aqua1 mr-1">
                      ~
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </span>
                  </>
                ) : (
                  <div className="animated-gradient mr-1 h-[1.5em] w-[3em]"></div>
                )}
                <span className="medium17 text-aqua1">APR</span>
              </span>
            </div>

            <div className="flex flex-col gap-3 ">
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
          <div className="flex flex-col">
            <div className="flex mt-2 mb-3">
              {isWalletConnected ? (
                <Button
                  type="default"
                  size="large"
                  className="btn-primary-gradient-aqua-lg lg:btn-primary-gradient-aqua  mx-auto lg:w-1/2 w-2/3"
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
              ) : (
                <CustomWalletConnect notConnectedClassName="btn-primary-gradient-aqua sm:px-10 sm:max-w-fit  mx-auto lg:w-1/2 w-2/3">
                  Connect wallet
                </CustomWalletConnect>
              )}
            </div>
       
        {stakingCallTxHash !== undefined && (
          <div className="text-center mb-3 regular-base ">
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={getTxExplorerUrl(stakingCallTxHash, appConfig.chainId)}
              passHref={true}
            >
              Last staking transaction: <span className="text-white underline"> {formatAddress(stakingCallTxHash)}</span> 
            </Link>
          </div>
        )}

            <div className="flex justify-between pt-2.5 lg:pt-5 4k:pt-7 border-t border-black2 ">
              <div className="flex flex-col gap-3.5 4k:gap-4 regular-base">
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
                <div className="">Max transaction cost: 3 ZIL</div>
                <div className="text-aqua1 ">
                Unbonding Period: {unboudingPeriod}
              </div>
              </div>
              <div className="flex flex-col max-xl:justify-between xl:gap-3.5 4k:gap-5 xl:items-end">
                {isPoolLiquid() && (
                  <div className="flex flex-col xl:flex-row xl:gap-5 4k:gap-6">
                    <div className="gray-base">Rate</div>
                    {stakingPoolForView!.stakingPool.data && (
                      <div className="text-gray9">{`1 ZIL = ~${stakingPoolForView.stakingPool.data.zilToTokenRate.toPrecision(3)} ${stakingPoolForView.stakingPool.definition.tokenSymbol}`}</div>
                    )}
                  </div>
                )}
                <div className="text-aqua1 flex flex-row xl:gap-5 4k:gap-6">
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
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </>
                  ) : (
                    <div className="animated-gradient ml-1 h-[1em] w-[2em]"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


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
