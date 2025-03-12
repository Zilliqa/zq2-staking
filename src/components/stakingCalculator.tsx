import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useEffect, useRef, useState } from "react"
import { Button, Input, InputRef, Tooltip } from "antd"
import { WalletConnector } from "@/contexts/walletConnector"
import {
  formatPercentage,
  convertZilValueInToken,
  getHumanFormDuration,
  convertTokenToZil,
  formatUnitsWithMaxPrecision,
} from "@/misc/formatting"
import { formatUnits, parseEther } from "viem"
import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import CustomWalletConnect from "./customWalletConnect"
import { DateTime } from "luxon"
import LastTransaction from "@/components/lastTransaction"

const StakingCalculator: React.FC = () => {
  const inputRef = useRef<InputRef | null>(null)

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

  const [zilToStake, setZilToStake] = useState<string>("0")

  const [isMinValue, setIsMinValue] = useState(false)
  const [isMaxValue, setIsMaxValue] = useState(false)

  const minValue = formatUnits(
    stakingPoolForView?.stakingPool.definition.minimumStake || 0n,
    18
  )
  const allZil = formatUnits(zilAvailable || 0n, 18)
  const roundedToNiceNumber = allZil.split(".")[0]
  const maxValue = parseFloat(roundedToNiceNumber) - stakingCallZilFees

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

      setIsMinValue(inputValue === `${minValue}`)
      setIsMaxValue(inputValue === `${maxValue}`)
    }
  }
  const [isFocused, setIsFocused] = useState(true)

  const handleFocus = () => {
    if (parseEther(minValue) < (zilAvailable || 0n)) setIsFocused(true)
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
    } else if (!isWalletConnected) {
      return {
        canStake: false,
        whyCantStake: "Please connect your wallet first.",
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

  const [isMinHovered, setIsMinHovered] = useState(false)
  const [isMaxHovered, setIsMaxHovered] = useState(false)

  return (
    stakingPoolForView && (
      <>
        <div className="">
          <Tooltip
            placement="bottomLeft"
            arrow={true}
            overlayClassName="custom-tooltip"
            className=""
            title={
              canStake
                ? `Stake ZIL with ${stakingPoolForView!.stakingPool.data ? formatPercentage(stakingPoolForView?.stakingPool.data.apr) : 0} APR`
                : whyCantStake
            }
          >
            <div
              className={`transition-all duration-300 border-transparent bg-gray-gradient
              ${
                isWalletConnected &&
                ` ${isFocused && "ant-input-affix-wrapper-focused !border-transparent !bg-focus-gradient "}
                  ${isMaxValue && "bg-teal-gradient !border-teal"}
                  ${isMaxHovered && "!bg-teal-gradient"}
                  ${isMinValue && "bg-purple-gradient"}
                  ${isMinHovered && "!bg-purple-gradient"}
                  ${!canStake && zilToStake != "0" && zilToStake != "" && "!bg-red-gradient"}`
              } flex justify-between lg:gap-10 4k:gap-14 mb-2.5 lg:mb-4 4k:mb-6 p-3 lg:p-5 xl:p-7 4k:p-10 rounded-xl items-center`}
            >
              <div className="h-fit self-center">
                <div className=" flex items-center gap-2">
                  <div
                    className={`${
                      !isWalletConnected ? "text-gray3" : "text-white1"
                    } bold33`}
                  >
                    ZIL
                  </div>
                  <Input
                    ref={inputRef}
                    placeholder="0"
                    className={` ${
                      zilToStake === "0" || zilToStake === ""
                        ? "text-gray2"
                        : "text-white1"
                    } 
                        
                    ${
                      !isWalletConnected
                        ? "placeholder-gray3"
                        : "placeholder-gray2"
                    }
                         flex items-baseline !bg-transparent !border-transparent !shadow-none bold33 px-0`}
                    value={zilToStake !== "0" ? zilToStake || "" : ""}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    status={!canStake ? "warning" : undefined}
                    disabled={!isWalletConnected}
                  />
                </div>

                <span className="flex items-center whitespace-nowrap ">
                  {stakingPoolForView!.stakingPool.data ? (
                    <>
                      {isPoolLiquid() && (
                        <span
                          className={` mr-3 ${
                            !isWalletConnected && "text-gray3"
                          } medium17`}
                        >
                          ~
                          {!isNaN(zilToStakeNumber) &&
                          !isNaN(
                            stakingPoolForView.stakingPool.data.zilToTokenRate
                          )
                            ? convertZilValueInToken(
                                zilToStakeNumber,
                                stakingPoolForView.stakingPool.data
                                  .zilToTokenRate
                              )
                            : ""}{" "}
                          {
                            stakingPoolForView.stakingPool.definition
                              .tokenSymbol
                          }{" "}
                        </span>
                      )}
                      <span
                        className={`
                         ${
                           !isWalletConnected
                             ? "text-gray3"
                             : stakingPoolForView?.stakingPool.definition
                                   .poolType === StakingPoolType.LIQUID
                               ? "text-tealPrimary"
                               : "text-purple2"
                         } medium17 mr-1`}
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
                    className={`
                        ${
                          !isWalletConnected
                            ? "text-gray3"
                            : stakingPoolForView?.stakingPool.definition
                                  .poolType === StakingPoolType.LIQUID
                              ? "text-tealPrimary"
                              : "text-purple2"
                        } medium17`}
                  >
                    APR
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-3 ">
                <Button
                  className={`btn-secondary-teal ${isMaxValue && "!border-tealPrimary"}`}
                  onClick={onMaxClick}
                  onMouseEnter={() => setIsMaxHovered(true)}
                  onMouseLeave={() => setIsMaxHovered(false)}
                  disabled={
                    !isWalletConnected ||
                    parseEther(minValue) > (zilAvailable || 0n)
                  }
                >
                  MAX
                </Button>
                <Button
                  className={`btn-secondary-purple ${isMinValue && "!border-purplePrimary"}`}
                  onClick={onMinClick}
                  onMouseEnter={() => setIsMinHovered(true)}
                  onMouseLeave={() => setIsMinHovered(false)}
                  disabled={!isWalletConnected}
                >
                  MIN
                </Button>
              </div>
            </div>
          </Tooltip>
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
                      overlayClassName="custom-tooltip"
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

            <LastTransaction txHash={stakingCallTxHash} />

            <div className="flex justify-between pt-2.5 lg:pt-5 4k:pt-7 mt-2.5 lg:mt-4 4k:mt-6 border-t border-black1 lg:pb-10">
              <div className="flex flex-col lg:gap-2.5 gap-1 4k:gap-4 regular-base">
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
                <div>
                  <Tooltip
                    placement="top"
                    arrow={true}
                    overlayClassName="custom-tooltip"
                    className=""
                    title="How long before you can claim your ZIL after unstaking."
                  >
                    Unbonding Period: {unboudingPeriod}{" "}
                  </Tooltip>{" "}
                </div>
              </div>
              <div className="flex flex-col lg:gray-base gray-base2 xl:gap-2.5 4k:gap-5 xl:items-end justify-start">
                {isPoolLiquid() && (
                  <div className="flex  max-lg:gap-2 max-xl:justify-between max-lg:items-start flex-row xl:gap-5 4k:gap-6">
                    <div className=" ">Rate</div>
                    {stakingPoolForView!.stakingPool.data ? (
                      <div className="text-gray1">
                        <>
                          1{" "}
                          {
                            stakingPoolForView.stakingPool.definition
                              .tokenSymbol
                          }{" "}
                          =~
                          {formatUnitsWithMaxPrecision(
                            convertTokenToZil(
                              parseEther("1"),
                              stakingPoolForView.stakingPool.data.zilToTokenRate
                            ),
                            18,
                            5
                          )}
                        </>{" "}
                        ZIL
                      </div>
                    ) : (
                      <div className="loading-blur ml-1 "> 1 ZIL = ~00%</div>
                    )}
                  </div>
                )}
                <div
                  className={`${
                    stakingPoolForView?.stakingPool.definition.poolType ===
                    StakingPoolType.LIQUID
                      ? "text-tealPrimary"
                      : "text-purple2"
                  }  flex flex-row xl:gap-5 4k:gap-6 `}
                >
                  <Tooltip
                    placement="top"
                    arrow={true}
                    overlayClassName="custom-tooltip"
                    className=" mr-1"
                    title="Annual Percentage Rate"
                  >
                    <span
                      className={`${
                        stakingPoolForView?.stakingPool.definition.poolType ===
                        StakingPoolType.LIQUID
                          ? "text-tealPrimary"
                          : "text-purple2"
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
