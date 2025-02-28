import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useRef, useState } from "react"
import { Button, Input, InputRef, Tooltip } from "antd"
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
  const inputRef = useRef<InputRef | null>(null)
  const { appConfig } = AppConfigStorage.useContainer()

  const { isWalletConnected } = WalletConnector.useContainer()

  const { zilAvailable } = WalletConnector.useContainer()
  const {
    stake,
    preparingStakingTx,
    isStakingInProgress,
    stakingCallTxHash,
    stakeContractCallError,
    stakingCallZilFees,
  } = StakingOperations.useContainer()

  const { stakingPoolForView } = StakingPoolsStorage.useContainer()

  const [zilToStake, setZilToStake] = useState<string>(
    formatUnits(
      stakingPoolForView?.stakingPool.definition.minimumStake || 0n,
      18
    )
  )

  const [isMinValue, setIsMinValue] = useState(false)
  const [isMaxValue, setIsMaxValue] = useState(false)

  const minValue = formatUnits(stakingPoolForView?.stakingPool.definition.minimumStake || 0n, 18);
  const allZil = formatUnits(zilAvailable || 0n, 18)
  const roundedToNiceNumber = allZil.split(".")[0]
  const maxValue =
    parseFloat(roundedToNiceNumber) - stakingCallZilFees

  const onMinClick = () => {
    setIsMaxValue(false)
    setIsMinValue(true)
    setZilToStake(`${minValue}`)
  }

  const onMaxClick = () => {
    setIsMaxValue(true)
    setIsMinValue(false)
    setZilToStake(`${maxValue}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^-?\d*(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
      setZilToStake(inputValue)

      setIsMinValue(
        inputValue ===
          `${minValue}`
      )
      setIsMaxValue(
        inputValue ===
          `${maxValue}`
      )
    }
  }
  const [isFocused, setIsFocused] = useState(true)

  const handleFocus = () => {
    if (zilToStake === "") onMinClick()
    setIsFocused(true)
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
    setIsFocused(false)
  }

  const zilToStakeNumber = parseFloat(zilToStake)
  const zilInWei = parseEther(zilToStake)

  const { canStake, whyCantStake } = (() => {
    if (!stakingPoolForView?.stakingPool.data) {
      return {
        canStake: false,
        whyCantStake: "Loading staking pool data",
      }
    } else if (zilToStakeNumber <= 0 || isNaN(zilToStakeNumber)) {
      return {
        canStake: false,
        whyCantStake: "Please enter a valid amount",
      }
    } else if (zilInWei > (zilAvailable || 0n)) {
      return {
        canStake: false,
        whyCantStake: "Insufficient ZIL balance",
      }
    } else if (
      zilInWei + parseEther(`${stakingCallZilFees}`) >
      (zilAvailable || 0n)
    ) {
      return {
        canStake: false,
        whyCantStake: `Remaining ZIL balance insufficient for ${stakingCallZilFees} ZIL transaction fee`,
      }
    } else if (
      zilInWei < stakingPoolForView.stakingPool.definition.minimumStake
    ) {
      return {
        canStake: false,
        whyCantStake: `Amount ${zilToStakeNumber} ZIL is below minimum stake ${formatUnits(stakingPoolForView.stakingPool.definition.minimumStake, 18)} ZIL`,
      }
    } else {
      return {
        canStake: true,
        whyCantStake: "",
      }
    }
  })()

  const isPoolLiquid = () =>
    stakingPoolForView?.stakingPool.definition.poolType ===
    StakingPoolType.LIQUID

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

  return (
    stakingPoolForView && (
      <>
        <div className="">
          <div
            className={`transition-all duration-300 border-transparent
${
  isPoolLiquid()
    ? "hover:!border-aqua1 hover:shadow-[inset_0_0_7px_3px_rgba(0,208,198,0.3),inset_0_0_15px_8px_rgba(0,208,198,0.15)]"
    : "hover:!border-purple5 hover:shadow-[inset_0_0_7px_3px_rgba(91,111,255,0.3),inset_0_0_15px_8px_rgba(91,111,255,0.15)]"
}
          ${isFocused && "ant-input-affix-wrapper-focused !border-transparent"}
           !bg-transparent flex justify-between lg:gap-10 4k:gap-14 my-2.5 lg:my-4 4k:my-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl items-center`}
          >
            <div className="h-fit self-center">
              <div className=" flex items-center gap-2">
                <div
                  className={`${
                    zilToStake === "0" || zilToStake === ""
                      ? "text-gray8"
                      : !canStake && isWalletConnected
                        ? "text-red1"
                        : "text-white1"
                  } bold33`}
                >
                  ZIL
                </div>
                <Input
                  ref={inputRef}
                  className={` ${
                    zilToStake === "0" || zilToStake === ""
                      ? "text-gray8"
                      : !canStake && isWalletConnected
                        ? "text-red1"
                        : "text-white1"
                  } flex items-baseline !bg-transparent !border-transparent !shadow-none bold33 px-0`}
                  value={zilToStake}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  status={!canStake ? "warning" : undefined}
                />
              </div>
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
                    <span
                      className={`${
                        stakingPoolForView?.stakingPool.definition.poolType ===
                        StakingPoolType.LIQUID
                          ? "text-aqua1"
                          : "text-purple3"
                      } medium17 ml-2 mr-1`}
                    >
                      ~
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </span>
                  </>
                ) : (
                  <div className="loading-blur mr-1  ">
                    {" "}
                    ~ formatPercentage{" "}
                  </div>
                )}
                <span
                  className={`${
                    stakingPoolForView?.stakingPool.definition.poolType ===
                    StakingPoolType.LIQUID
                      ? "text-aqua1"
                      : "text-purple3"
                  } medium17`}
                >
                  APR
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-3 ">
              <Button
                className={`btn-secondary-teal ${isMaxValue && "!border-aqua1"}`}
                onClick={onMaxClick}
              >
                MAX
              </Button>
              <Button
                className={`btn-secondary-purple ${isMinValue && "!border-purple4"}`}
                onClick={onMinClick}
              >
                MIN
              </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex mt-2 mb-3">
              {isWalletConnected ? (
                <>
                  {canStake || isStakingInProgress ? (
                    <Button
                      type="default"
                      size="large"
                      className={`${
                        stakingPoolForView?.stakingPool.definition.poolType ===
                        StakingPoolType.LIQUID
                          ? "btn-primary-teal-lg lg:btn-primary-teal "
                          : "btn-primary-purple-lg lg:btn-primary-purple "
                      } mx-auto lg:w-1/2 w-2/3 `}
                      onClick={() =>
                        stake(
                          stakingPoolForView.stakingPool.definition.address,
                          zilInWei
                        )
                      }
                      loading={isStakingInProgress}
                    >
                      {preparingStakingTx
                        ? "Confirm in wallet"
                        : isStakingInProgress
                          ? "Processing"
                          : "Stake"}
                    </Button>
                  ) : (
                    <Tooltip
                      placement="top"
                      arrow={true}
                      color="#555555"
                      title={whyCantStake}
                    >
                      <Button
                        type="default"
                        size="large"
                        className="btn-primary-teal-lg lg:btn-primary-teal  mx-auto lg:w-1/2 w-2/3"
                        disabled={true}
                      >
                        Stake
                      </Button>
                    </Tooltip>
                  )}
                </>
              ) : (
                <CustomWalletConnect notConnectedClassName="btn-primary-teal sm:px-10 sm:max-w-fit mx-auto lg:w-1/2 w-2/3">
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
                  Last staking transaction:{" "}
                  <span className="text-white underline">
                    {" "}
                    {formatAddress(stakingCallTxHash)}
                  </span>
                </Link>
              </div>
            )}

            <div className="flex justify-between pt-2.5 lg:pt-5 4k:pt-7 border-t border-black2 lg:pb-10">
              <div className="flex flex-col lg:gap-3.5 gap-1 4k:gap-4 regular-base">
                <div className=" flex ">
                  Commission Fee:{" "}
                  {stakingPoolForView!.stakingPool.data ? (
                    <>
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.commission
                      )}
                    </>
                  ) : (
                    <div className="loading-blur ml-1  "> 10% </div>
                  )}
                </div>
                <div>Max transaction cost: ~{stakingCallZilFees} ZIL</div>
                <div>Unbonding Period: {unboudingPeriod}</div>
              </div>
              <div className="flex flex-col lg:gray-base gray-base2 xl:gap-3.5 4k:gap-5 xl:items-end justify-start">
                {isPoolLiquid() && (
                  <div className="flex  max-lg:gap-2 max-xl:justify-between max-lg:items-start flex-row xl:gap-5 4k:gap-6">
                    <div className=" ">Rate</div>
                    {stakingPoolForView!.stakingPool.data ? (
                      <div className="text-gray9">{`1 ZIL = ~${stakingPoolForView.stakingPool.data.zilToTokenRate.toPrecision(3)} ${stakingPoolForView.stakingPool.definition.tokenSymbol}`}</div>
                    ) : (
                      <div className="loading-blur ml-1 "> 1 ZIL = ~00%</div>
                    )}
                  </div>
                )}
                <div
                  className={`${
                    stakingPoolForView?.stakingPool.definition.poolType ===
                    StakingPoolType.LIQUID
                      ? "text-aqua1"
                      : "text-purple3"
                  }  flex flex-row xl:gap-5 4k:gap-6 `}
                >
                  <Tooltip
                    placement="top"
                    arrow={true}
                    color="#555555"
                    className=" mr-1"
                    title="Annual Percentage Rate"
                  >
                    <span
                      className={`${
                        stakingPoolForView?.stakingPool.definition.poolType ===
                        StakingPoolType.LIQUID
                          ? "text-aqua1"
                          : "text-purple3"
                      } lg:gray-base gray-base2 `}
                    >
                      APR{" "}
                    </span>
                  </Tooltip>
                  {stakingPoolForView!.stakingPool.data ? (
                    <>
                      ~
                      {formatPercentage(
                        stakingPoolForView!.stakingPool.data.apr
                      )}
                    </>
                  ) : (
                    <div className="loading-blur ml-1 "> ~00%</div>
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
