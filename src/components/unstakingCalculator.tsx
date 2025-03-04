import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useRef, useState } from "react"
import { Button, Input, InputRef, Tooltip } from "antd"
import {
  formatPercentage,
  convertTokenToZil,
  formatUnitsToHumanReadable,
  getHumanFormDuration,
  getTxExplorerUrl,
  formatAddress,
} from "@/misc/formatting"
import { formatUnits, parseEther, parseUnits } from "viem"
import { StakingOperations } from "@/contexts/stakingOperations"
import { DateTime } from "luxon"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import FastFadeScroll from "@/components/FastFadeScroll"
import { WalletConnector } from "@/contexts/walletConnector"
import CustomWalletConnect from "./customWalletConnect"
import Link from "next/link"
import { AppConfigStorage } from "@/contexts/appConfigStorage"

const UnstakingCalculator: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null)

  const { appConfig } = AppConfigStorage.useContainer()
  const { isWalletConnected } = WalletConnector.useContainer()
  const { stakingPoolForView } = StakingPoolsStorage.useContainer()

  const [isFocused, setIsFocused] = useState(true)

  const {
    unstake,
    isUnstakingInProgress,
    unstakingCallTxHash,
    unstakeContractCallError,
    unstakingCallZilFees,
    preparingUnstakingTx,
  } = StakingOperations.useContainer()

  const [tokensToUnstake, setZilToUnstake] = useState<string>("0")

  const stakedTokenAvailable =
    stakingPoolForView?.userData?.staked?.stakingTokenAmount || 0n
  const poolTokenDecimals =
    stakingPoolForView?.stakingPool.definition.tokenDecimals || 18

  const maxValue = formatUnits(stakedTokenAvailable, poolTokenDecimals)
  const onMaxClick = () => {
    setZilToUnstake(maxValue)

    setIsMaxValue(true)
    setIsMinValue(false)
  }

  const [isMinValue, setIsMinValue] = useState(false)
  const [isMaxValue, setIsMaxValue] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^-?\d*(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
      setIsMinValue(inputValue === "1")
      setIsMaxValue(inputValue === maxValue)

      console.log(isMinValue, "min and ", isMaxValue, "max")
      setZilToUnstake(inputValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    let valueTemp = tokensToUnstake
    if (
      tokensToUnstake.charAt(tokensToUnstake.length - 1) === "." ||
      tokensToUnstake === "-"
    ) {
      valueTemp = tokensToUnstake.slice(0, -1)
    }
    setZilToUnstake(valueTemp.replace(/0*(\d+)/, "$1"))
    setIsFocused(false)
  }

  const tokenToUnstakeInBaseUnit = parseUnits(
    tokensToUnstake,
    poolTokenDecimals
  )

  const unboudingPeriod = getHumanFormDuration(
    DateTime.now().plus({
      minutes:
        stakingPoolForView?.stakingPool.definition.withdrawPeriodInMinutes || 0,
    })
  )

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const isPoolLiquid = () =>
    stakingPoolForView?.stakingPool.definition.poolType ===
    StakingPoolType.LIQUID

  const isUnstakingAvailable =
    (stakingPoolForView?.userData.staked?.stakingTokenAmount || 0n) !== 0n

  const { canUnstake, whyCantUnstake } = (() => {
    if (!stakingPoolForView?.stakingPool.data) {
      return {
        canUnstake: false,
        whyCantUnstake: "Loading staking data",
      }
    } else if (!isUnstakingAvailable) {
      return {
        canUnstake: false,
        whyCantUnstake: "No staked balance",
      }
    } else if (tokenToUnstakeInBaseUnit <= 0n) {
      return {
        canUnstake: false,
        whyCantUnstake: "Enter a valid amount",
      }
    } else if (stakedTokenAvailable < tokenToUnstakeInBaseUnit) {
      return {
        canUnstake: false,
        whyCantUnstake: "Insufficient staked balance",
      }
    } else {
      return {
        canUnstake: true,
        whyCantUnstake: "Send an unstake transaction",
      }
    }
  })()

  return (
    stakingPoolForView && (
      <FastFadeScroll
        isPoolLiquid={stakingPoolForView?.stakingPool.definition.poolType}
        className={"flex-1 overflow-y-scroll"}
      >
        <Tooltip
          placement="bottomLeft"
          arrow={true}
          overlayClassName="custom-tooltip"
          className=""
          title="Enter amount to request unstake."
        >
          <div
            className={`transition-all duration-300 border-transparent
${
  isUnstakingAvailable &&
  ` ${
    isPoolLiquid()
      ? "hover:border-aqua1 hover:shadow-[inset_0_0_7px_3px_rgba(0,208,198,0.3),inset_0_0_15px_8px_rgba(0,208,198,0.15)]"
      : "hover:border-purple5 hover:shadow-[inset_0_0_7px_3px_rgba(91,111,255,0.3),inset_0_0_15px_8px_rgba(91,111,255,0.15)]"
  }
          ${isFocused && "ant-input-affix-wrapper-focused !border-transparent"} `
}
           !bg-transparent flex justify-between lg:gap-10 4k:gap-14 mb-2.5 lg:mb-4 4k:mb-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl items-center`}
          >
            <div className="h-fit self-center">
              <div className=" flex items-center gap-2">
                <div
                  className={`${
                    tokensToUnstake === "0" || tokensToUnstake === ""
                      ? "text-gray8"
                      : !canUnstake && isWalletConnected
                        ? "text-red1"
                        : "text-white1"
                  } bold33`}
                >
                  {" "}
                  {stakingPoolForView.stakingPool.definition.tokenSymbol}{" "}
                </div>

                <Input
                  ref={inputRef}
                  className={`${
                    tokensToUnstake === "0" || tokensToUnstake === ""
                      ? "text-gray8"
                      : !canUnstake && isWalletConnected
                        ? "text-red1"
                        : "text-white1"
                  } placeholder-gray8 flex items-baseline !bg-transparent !border-transparent !shadow-none bold33 px-0`}
                  value={tokensToUnstake !== "0" ? tokensToUnstake || "" : ""}
                  placeholder="0"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  status={!canUnstake ? "error" : undefined}
                  disabled={!isUnstakingAvailable}
                />
              </div>
              <div className="flex items-center ">
                {isPoolLiquid() && (
                  <span className="medium17">
                    {stakingPoolForView!.stakingPool.data ? (
                      <>
                        {" "}
                        ~
                        {formatUnitsToHumanReadable(
                          convertTokenToZil(
                            tokenToUnstakeInBaseUnit,
                            stakingPoolForView.stakingPool.data.zilToTokenRate
                          ),
                          18
                        )}
                      </>
                    ) : (
                      <div className="loading-blur ">00</div>
                    )}{" "}
                    ZIL
                  </span>
                )}

                <span
                  className={`${
                    !isUnstakingAvailable
                      ? "!text-gray-500"
                      : isPoolLiquid()
                        ? "text-aqua1"
                        : "text-purple3"
                  } medium17 ml-3 `}
                >
                  {unboudingPeriod}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                className={`btn-secondary-teal ${isMaxValue && "!border-aqua1"}`}
                onClick={onMaxClick}
                disabled={!isUnstakingAvailable}
              >
                MAX
              </Button>
              <Button
                className={`btn-secondary-purple ${isMinValue && "!border-purple4"}`}
                onClick={() => {
                  setZilToUnstake("1")
                  setIsMinValue(true)
                  setIsMaxValue(false)
                }}
                disabled={!isUnstakingAvailable}
              >
                MIN
              </Button>
            </div>
          </div>
        </Tooltip>
        <div className="flex flex-col justify-between">
          <div className="flex mt-2 mb-3">
            {isWalletConnected ? (
              <Tooltip
                placement="top"
                arrow={true}
                overlayClassName="custom-tooltip"
                title={whyCantUnstake}
              >
                <Button
                  type="default"
                  size="large"
                  className={`${
                    isPoolLiquid()
                      ? "btn-primary-teal-lg lg:btn-primary-teal"
                      : "btn-primary-purple-lg lg:btn-primary-purple"
                  }  mx-auto lg:w-1/2 w-2/3`}
                  disabled={!canUnstake}
                  onClick={() =>
                    unstake(
                      stakingPoolForView.stakingPool.definition.address,
                      tokenToUnstakeInBaseUnit
                    )
                  }
                  loading={isUnstakingInProgress}
                >
                  {preparingUnstakingTx
                    ? "Confirm in wallet"
                    : isUnstakingInProgress
                      ? "Processing"
                      : "Unstake"}
                </Button>
              </Tooltip>
            ) : (
              <CustomWalletConnect notConnectedClassName="btn-primary-teal sm:px-10 sm:max-w-fit  mx-auto lg:w-1/2 w-2/3">
                Connect wallet
              </CustomWalletConnect>
            )}
          </div>

          {unstakingCallTxHash !== undefined && (
            <div className="text-center mb-3 regular-base ">
              <Link
                rel="noopener noreferrer"
                target="_blank"
                href={getTxExplorerUrl(unstakingCallTxHash, appConfig.chainId)}
                passHref={true}
              >
                Last staking transaction:{" "}
                <span className="text-white underline">
                  {" "}
                  {formatAddress(unstakingCallTxHash)}
                </span>
              </Link>
            </div>
          )}

          <div className="flex justify-between pt-2.5 lg:pt-5 4k:pt-7 border-t border-black2 lg:pb-10">
            <div className="flex flex-col lg:gap-3.5 gap-1 regular-base">
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
                  <div className="loading-blur">1.1% </div>
                )}
              </div>
              <div className="">
                Max transaction cost: ~{unstakingCallZilFees} ZIL
              </div>
              <div
                className={`${isPoolLiquid() ? "text-aqua1" : "text-purple3"} `}
              >
                <Tooltip
                  placement="top"
                  arrow={true}
                  overlayClassName="custom-tooltip"
                  className=""
                  title="How long before you can claim your ZIL after unstaking."
                >
                  <span>Unbonding Period: {unboudingPeriod}</span>
                </Tooltip>
              </div>
            </div>
            <div className="flex flex-col lg:gray-base gray-base2 xl:gap-3.5 4k:gap-5 xl:items-end justify-start">
              {isPoolLiquid() && (
                <div className="flex flex-col max-xl:justify-between  max-lg:items-start xl:gap-3.5 xl:items-end">
                  <div className="flex   xl:gap-5 4k:gap-6">
                    <div className="lg:gray-base">Rate</div>
                    <div className="text-gray9">
                      {stakingPoolForView!.stakingPool.data ? (
                        <>
                          1{" "}
                          {
                            stakingPoolForView.stakingPool.definition
                              .tokenSymbol
                          }{" "}
                          =~
                          {formatUnitsToHumanReadable(
                            convertTokenToZil(
                              parseEther("1"),
                              stakingPoolForView.stakingPool.data.zilToTokenRate
                            ),
                            18
                          )}
                        </>
                      ) : (
                        <div className="loading-blur "> 1Zil =~ 1zil</div>
                      )}
                      ZIL
                    </div>
                  </div>
                </div>
              )}

              <div className="text-gray9  flex flex-row xl:gap-5 4k:gap-6">
                <Tooltip
                  placement="top"
                  arrow={true}
                  overlayClassName="custom-tooltip"
                  className=" mr-1"
                  title="Annual Percentage Rate"
                >
                  <span className="lg:gray-base  ">APR </span>
                </Tooltip>

                {stakingPoolForView!.stakingPool.data ? (
                  <>
                    ~
                    {formatPercentage(stakingPoolForView!.stakingPool.data.apr)}
                  </>
                ) : (
                  <div className="loading-blur  "> ~11%</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {unstakeContractCallError && (
          <div className="text-red1 text-center">
            {unstakeContractCallError.message}
          </div>
        )}
      </FastFadeScroll>
    )
  )
}

export default UnstakingCalculator
