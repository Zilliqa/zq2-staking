import StakingCalculator from "@/components/stakingCalculator"
import UnstakingCalculator from "@/components/unstakingCalculator"
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel"
import { WalletConnector } from "@/contexts/walletConnector"
import {
  convertTokenToZil,
  formatPercentage,
  formatUnitsToHumanReadable,
  formatUnitsWithMaxPrecision,
} from "@/misc/formatting"
import { StakingPool, StakingPoolType } from "@/misc/stakingPoolsConfig"
import {
  UserNonLiquidStakingPoolRewardData,
  UserStakingPoolData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useWatchAsset } from "wagmi"
import PlusIcon from "../assets/svgs/plus-icon.svg"
import Image from "next/image"
import CloseIcon from "../assets/svgs/close-icon.svg"
import FastFadeScroll from "@/components/FastFadeScroll"
import { formatUnits, parseEther } from "viem"
import arrow from "../assets/svgs/arrow.svg"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { Tooltip } from "antd"

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPool
  userStakingPoolData?: UserStakingPoolData
  userUnstakingPoolData?: Array<UserUnstakingPoolData>
  viewClaim?: boolean
  reward?: UserNonLiquidStakingPoolRewardData
}

const StakingPoolDetailsView: React.FC<StakingPoolDetailsViewProps> = ({
  stakingPoolData,
  userStakingPoolData,
  userUnstakingPoolData,
  viewClaim,
  reward,
}) => {
  const { selectStakingPoolForView } = StakingPoolsStorage.useContainer()

  const { zilAvailable } = WalletConnector.useContainer()

  const [selectedPane, setSelectedPane] = useState<string>("Stake")

  useEffect(() => {
    if (viewClaim === true) setSelectedPane("Claim")
    else setSelectedPane("Stake")
  }, [viewClaim])

  const isPoolLiquid = () =>
    stakingPoolData.definition.poolType === StakingPoolType.LIQUID
  const colorInfoEntry = (
    title: string,
    value: string | null,
    tooltip: string | JSX.Element | null
  ) => (
    <Tooltip
      placement="topLeft"
      arrow={true}
      overlayClassName="custom-tooltip"
      className=""
      title={tooltip}
    >
      <div
        className={`${isPoolLiquid() ? "lg:w-1/4 w-1/2 lg:text-left text-center" : " xl:text-left text-center w-1/3"}`}
      >
        <div
          className={`semi14 ${isPoolLiquid() ? "text-teal1" : "text-purple3"}`}
        >
          {value}
        </div>

        <div className="text-gray8 info-label">{title}</div>
      </div>
    </Tooltip>
  )
  const asideColorInfoEntry = (
    title: string,
    value: string | null,
    tooltip: string | JSX.Element | null
  ) => (
    <Tooltip
      key={title}
      placement="top"
      arrow={true}
      overlayClassName="custom-tooltip"
      className=""
      title={tooltip}
    >
      <div
        className={`${isPoolLiquid() ? "lg:text-left text-center" : "xl:text-left text-center"} w-2/3 `}
      >
        <div
          className={`semi14  ${isPoolLiquid() ? "text-teal1" : "text-purple3"}`}
        >
          {value}
        </div>

        <div className="text-gray8 xl:whitespace-nowrap info-label">
          {title}
        </div>
      </div>
    </Tooltip>
  )
  const greyInfoEntry = (
    title: string,
    value: string | JSX.Element | null,
    tooltip: string | JSX.Element | null
  ) => (
    <Tooltip
      key={title}
      placement="topLeft"
      arrow={true}
      overlayClassName="custom-tooltip"
      className=""
      title={tooltip}
    >
      <div className={`  ${isPoolLiquid() ? "lg:w-1/4 w-1/2" : "w-1/3"} `}>
        {value ? (
          <div className="semi14 text-gray7 xl:whitespace-nowrap">{value}</div>
        ) : (
          <div className="loading-blur">0000</div>
        )}
        <div className="text-gray8 info-label xl:whitespace-nowrap">
          {title}
        </div>
      </div>
    </Tooltip>
  )
  const pendingUnstakesValue = userUnstakingPoolData
    ?.filter((item) => item.availableAt > DateTime.now())
    .reduce((acc, item) => acc + item.zilAmount, 0n)

  const availableToClaim = userUnstakingPoolData
    ?.filter((item) => item.availableAt <= DateTime.now())
    .reduce((acc, item) => acc + item.zilAmount, 0n)

  const doesUserHoldAnyFundsInThisPool = !!(
    userStakingPoolData?.stakingTokenAmount ||
    pendingUnstakesValue ||
    availableToClaim
  )

  const humanReadableStakingToken = (value: bigint) =>
    formatUnitsToHumanReadable(value, stakingPoolData.definition.tokenDecimals)

  const { watchAsset } = useWatchAsset()

  const handleClickAaddToken = () =>
    watchAsset(
      {
        type: "ERC20",
        options: {
          address: stakingPoolData.definition.tokenAddress,
          symbol: stakingPoolData.definition.tokenSymbol,
          decimals: stakingPoolData.definition.tokenDecimals,
        },
      },
      {
        onSuccess: (data) => {
          console.log("Asset watched successfully:", data)
        },
        onError: (error) => {
          console.error("Failed to watch the asset:", error)
        },
      }
    )

  const greyInfoEntries = [
    stakingPoolData.data &&
      greyInfoEntry(
        "Voting Power",
        formatPercentage(stakingPoolData.data.votingPower),
        "Share of total staked ZIL controlled by the validator."
      ),

    stakingPoolData.data &&
      greyInfoEntry(
        isPoolLiquid() ? "Total Supply" : "Total Delegated",
        `${humanReadableStakingToken(stakingPoolData.data.tvl)} ${stakingPoolData.definition.tokenSymbol}`,
        isPoolLiquid()
          ? "The total supply of validator's Liquid Staking Token (LST)."
          : "Total ZIL staked through validator"
      ),

    stakingPoolData.data &&
      greyInfoEntry(
        "Commission",
        formatPercentage(stakingPoolData.data.commission),
        "Percentage of earned staking rewards paid to the validator."
      ),

    isPoolLiquid() &&
      stakingPoolData.data &&
      greyInfoEntry(
        "",
        <>
          1 {stakingPoolData.definition.tokenSymbol} = ~ <br />
          {formatUnitsWithMaxPrecision(
            convertTokenToZil(
              parseEther("1"),
              stakingPoolData.data.zilToTokenRate
            ),
            18,
            3
          )}{" "}
          ZIL
        </>,
        ""
      ),
  ]

  const availableEntries = greyInfoEntries.filter(Boolean)
  const columnCount = availableEntries.length
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  const { isWalletConnected } = WalletConnector.useContainer()
  const { stakingPoolForView } = StakingPoolsStorage.useContainer()
  const availableUnstake = userUnstakingPoolData
    ?.filter((claim) => claim.availableAt <= DateTime.now())
    .toSorted(
      (claimA, claimB) =>
        claimA.availableAt.diff(claimB.availableAt).milliseconds
    )

  const [isClicked, setIsClicked] = useState(false)

  const handleMouseDown = () => {
    setIsClicked(true)
  }

  const handleMouseUp = () => {
    setIsClicked(false)
  }

  const [isClickedClose, setIsClickedClose] = useState(false)

  const handleMouseDownClose = () => {
    setIsClickedClose(true)
  }

  const handleMouseUpClose = () => {
    setIsClickedClose(false)
  }

  return (
    <div className="relative pb-24 lg:pb-2 4k:pb-4 flex flex-col h-full ">
      <div className="items-center flex justify-between py-1 lg:py-7.5 px-4 lg:pr-2.5 4k:pr-6 xs:mx-5 lg:mx-7.5 4k:mx-10 ">
        <div className="max-lg:ms-1 items-center w-full flex justify-between mb-5">
          <div className="flex items-center">
            <span className="text-white1 bold33 lg:mr-6 mr-2">
              {stakingPoolData.definition.name}
            </span>

            {isPoolLiquid() && (
              <>
                <span className="lg:text-38 text-20 lg:h4 text-black2  font-light">
                  |
                </span>
                <span className="medium20 text-gray6 lg:ml-6 ml-2">
                  {stakingPoolData.definition.tokenSymbol}
                </span>
                <Tooltip
                  placement="top"
                  arrow={true}
                  overlayClassName="custom-tooltip"
                  title="Add token to wallet"
                >
                  <div
                    className={`ml-0.5 xxs:ml-4 rounded-160 border-[1px] border-transparent ${isClicked && "hover:!border-purple2"}`}
                  >
                    <div
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onClick={handleClickAaddToken}
                      onMouseLeave={handleMouseUp}
                      className={`group btn-primary-purple px-0.5 xxs:px-2 py-0.5 xxs:py-1.5 border-purple2 border-[1px] flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden
                        ${isClicked && "hover:!shadow-[0px_0px_0px_0px_#522EFF]"}`}
                    >
                      <Image
                        className="transition-all duration-300 flex-shrink-0 p-1"
                        src={PlusIcon}
                        alt="plus icon"
                        width={20}
                        height={20}
                      />
                      <div className="overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-28">
                        <span className="ml-1.5 mr-1 text-13 font-medium tracking-normal text-white3 whitespace-nowrap block transform translate-x-[-100%] group-hover:translate-x-0 transition-all duration-300 opacity-0 group-hover:opacity-100">
                          Add Token
                        </span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
          <div className="flex items-center">
            <div
              onMouseDown={handleMouseDownClose}
              onMouseUp={handleMouseUpClose}
              onMouseLeave={handleMouseUpClose}
              onClick={() => {
                selectStakingPoolForView(null)
              }}
              className={`group rounded-160 bg-gray12 text-white cursor-pointer duration-500 ease-in-out h-8 p-2.5 flex flex-row-reverse items-center justify-center transition-all
                ${isClickedClose && "bg-gray8"}`}
            >
              <Image
                className="flex-shrink-0 ml-0"
                src={CloseIcon}
                alt={"close icon"}
                width={12}
                height={12}
              />
              <div className="overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-16">
                <span className="ml-0.5 mr-2 text-13 text-white font-medium whitespace-nowrap block transform translate-x-full group-hover:translate-x-0 transition-all duration-300 opacity-0 group-hover:opacity-100">
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FastFadeScroll
        isPoolLiquid={stakingPoolData.definition.poolType}
        className="overflow-y-scroll max-lg:mx-2 lg:pr-5 4k:pr-6 xs:mx-5 lg:ml-7.5 lg:mr-5 4k:ml-12 4k:mr-6 "
      >
        {isPoolLiquid() ? (
          <div className="bg-grey-gradient  flex flex-col gap-2 px-2  max-lg:mt-5  rounded-xl">
            <div
              className={` ${doesUserHoldAnyFundsInThisPool ? "max-lg:pt-6 " : "py-6"} lg:py-6 4k:py-10 4k:px-16 lg:px-9.5 px-5`}
            >
              {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                <div
                  className={"flex flex-wrap max-lg:gap-y-4  4k:pb-6  pb-4 "}
                >
                  {colorInfoEntry(
                    "Available to Stake",
                    `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`,
                    "Your ZIL balance"
                  )}
                  {colorInfoEntry(
                    "Staked",
                    `${humanReadableStakingToken(
                      userStakingPoolData?.stakingTokenAmount || 0n
                    )} ${stakingPoolData.definition.tokenSymbol}`,
                    <>
                      <div>Amount of ZIL currently staked</div>
                      {isPoolLiquid() &&
                        userStakingPoolData &&
                        userStakingPoolData.stakingTokenAmount &&
                        stakingPoolData.data != null && (
                          <div className="mt-1">
                            {`                    
                      ( ~
                          ${formatUnitsToHumanReadable(
                            convertTokenToZil(
                              userStakingPoolData.stakingTokenAmount,
                              stakingPoolData.data.zilToTokenRate
                            ),
                            18
                          )} 
                      ZIL )`}
                          </div>
                        )}
                    </>
                  )}
                  {colorInfoEntry(
                    "Unstaked ",
                    pendingUnstakesValue
                      ? `${humanReadableStakingToken(
                          pendingUnstakesValue
                        )} ${stakingPoolData.definition.tokenSymbol}`
                      : "-",
                    <>
                      <div>
                        Amount of unstaked ZIL available after the unbonding
                        period
                      </div>
                      {isPoolLiquid() &&
                        userStakingPoolData &&
                        pendingUnstakesValue &&
                        stakingPoolData.data != null && (
                          <div className="mt-1">
                            {`                    
                      ( ~
                          ${formatUnitsToHumanReadable(
                            convertTokenToZil(
                              pendingUnstakesValue,
                              stakingPoolData.data.zilToTokenRate
                            ),
                            18
                          )} 
                      ZIL )`}
                          </div>
                        )}
                    </>
                  )}
                  {colorInfoEntry(
                    "Claimable Withdrawals",
                    availableToClaim
                      ? `${humanReadableStakingToken(availableToClaim)} ZIL`
                      : "-",
                    "Unstaked ZIL available to claim"
                  )}
                </div>
              )}

              <div
                className={`flex flex-wrap justify-center  max-lg:gap-y-4  lg:text-left text-center ${doesUserHoldAnyFundsInThisPool && "max-lg:border-t  border-gradient-3 max-lg:pt-4 "}
               ${!isExpanded || (doesUserHoldAnyFundsInThisPool && "max-lg:hidden")} 
               ${columnCount < 4 && "!text-center"}`}
              >
                {availableEntries}
              </div>
            </div>
            {availableEntries &&
              availableEntries.length > 0 &&
              doesUserHoldAnyFundsInThisPool && (
                <>
                  <button
                    onClick={toggleExpand}
                    className="bg-custom-grey-gradient py-1 rounded-b-xl  items-center justify-center w-full mx-auto max-lg:flex hidden"
                  >
                    <Image
                      src={arrow}
                      width={12}
                      height={6}
                      alt="Arrow"
                      className={` w-3 h-2 transform transition-transform duration-300 ${
                        !isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </>
              )}
          </div>
        ) : (
          <>
            <div className={" xl:flex hidden 4k:gap-5 gap-2 "}>
              <div
                className={` ${doesUserHoldAnyFundsInThisPool && isWalletConnected ? "w-2/3 " : "w-full"} bg-grey-gradient flex flex-col justify-center items-center  gap-2 max-xl:mt-5  rounded-xl`}
              >
                <div
                  className={`w-full ${doesUserHoldAnyFundsInThisPool ? "max-lg:pt-6 " : "py-6"} lg:py-6 4k:py-10 4k:px-16 lg:px-9.5 px-5`}
                >
                  {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                    <div
                      className={
                        "flex flex-wrap justify-center items-center max-lg:gap-y-4 4k:pb-6  pb-4 "
                      }
                    >
                      {colorInfoEntry(
                        "Available to stake",
                        `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`,
                        "Your ZIL balance"
                      )}
                      {colorInfoEntry(
                        "Staked",
                        `${humanReadableStakingToken(
                          userStakingPoolData?.stakingTokenAmount || 0n
                        )} ${stakingPoolData.definition.tokenSymbol}`,
                        "Amount of ZIL currently staked"
                      )}
                      {colorInfoEntry(
                        "Unstaked",
                        pendingUnstakesValue
                          ? `${humanReadableStakingToken(
                              pendingUnstakesValue
                            )} ${stakingPoolData.definition.tokenSymbol}`
                          : "-",
                        "Amount of unstaked ZIL available after the unbonding period"
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap  xl:text-left text-center  justify-center   max-lg:gap-y-4  ${doesUserHoldAnyFundsInThisPool && "max-lg:border-t  border-gradient-3 max-lg:pt-4 "}
               ${!isExpanded || (doesUserHoldAnyFundsInThisPool && "max-lg:hidden")}
               ${columnCount < 4 && !isWalletConnected && "!text-center"}`}
                  >
                    {availableEntries}
                  </div>
                </div>
              </div>
              {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                <div
                  className={
                    " flex bg-grey-gradient w-1/3  flex-col gap-2   max-xl:mt-5  rounded-xl"
                  }
                >
                  <div
                    className={` ${doesUserHoldAnyFundsInThisPool ? "max-xl:pt-6 " : "py-6"} lg:py-6 4k:py-10 4k:px-16 lg:px-9.5 px-5`}
                  >
                    {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                      <div
                        className={
                          "flex  flex-col flex-wrap gap-4 max-lg:gap-y-4     4k:pb-6   "
                        }
                      >
                        {asideColorInfoEntry(
                          "Claimable Withdrawals",
                          !!availableUnstake?.length
                            ? availableUnstake
                                .map(
                                  (item) =>
                                    `${parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL`
                                )
                                .join(", ")
                            : "-",
                          "Unstaked ZIL available to claim"
                        )}
                        {stakingPoolForView != null &&
                          asideColorInfoEntry(
                            "Claimable Rewards",
                            stakingPoolForView.userData.reward
                              ? `${parseFloat(formatUnits(stakingPoolForView.userData.reward?.zilRewardAmount ?? "0", 18)).toFixed(5)} ZIL`
                              : "-",
                            "Earned ZIL available to claim"
                          )}
                      </div>
                    )}
                  </div>
                  {availableEntries &&
                    availableEntries.length > 0 &&
                    doesUserHoldAnyFundsInThisPool && (
                      <>
                        <button
                          onClick={toggleExpand}
                          className="bg-custom-grey-gradient py-1 rounded-b-xl  items-center justify-center w-full mx-auto max-xl:flex hidden"
                        >
                          <Image
                            src={arrow}
                            width={12}
                            height={6}
                            alt="Arrow"
                            className={` w-3 h-2 transform transition-transform duration-300 ${
                              !isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </>
                    )}
                </div>
              )}
            </div>
            <div className="bg-grey-gradient xl:hidden flex flex-col  gap-2  max-lg:mt-5  rounded-xl">
              <div
                className={` ${doesUserHoldAnyFundsInThisPool ? "max-xl:pt-6 " : "py-6"} xl:py-6 4k:py-10 4k:px-16 lg:px-9.5 px-5`}
              >
                {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                  <div
                    className={
                      "flex flex-wrap justify-center items-center max-xl:gap-y-4    4k:pb-6  pb-4 "
                    }
                  >
                    {colorInfoEntry(
                      "Available to stake",
                      `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL staked`,
                      "Your ZIL balance"
                    )}
                    {colorInfoEntry(
                      "Staked",
                      `${humanReadableStakingToken(
                        userStakingPoolData?.stakingTokenAmount || 0n
                      )} ${stakingPoolData.definition.tokenSymbol}`,
                      "Amount of ZIL currently staked"
                    )}
                    {colorInfoEntry(
                      "Unstaked",
                      pendingUnstakesValue
                        ? `${humanReadableStakingToken(
                            pendingUnstakesValue
                          )} ${stakingPoolData.definition.tokenSymbol}`
                        : "-",
                      "Amount of unstaked ZIL available after the unbonding period"
                    )}
                    {stakingPoolForView != null &&
                      colorInfoEntry(
                        "Claimable Rewards",
                        stakingPoolForView.userData.reward
                          ? `${parseFloat(formatUnits(stakingPoolForView.userData.reward?.zilRewardAmount ?? "0", 18)).toFixed(5)} ZIL`
                          : "-",
                        "Earned ZIL available to claim"
                      )}
                  </div>
                )}
                <div
                  className={`flex flex-wrap justify-center  max-xl:gap-y-4  xl:text-left text-center ${doesUserHoldAnyFundsInThisPool && "max-xl:border-t  border-gradient-3 max-xl:pt-4 "}
             ${!isExpanded || (doesUserHoldAnyFundsInThisPool && "max-xl:hidden")}
             ${columnCount < 4 && !isWalletConnected && "!text-center"}`}
                >
                  {availableEntries}
                </div>
              </div>
              {availableEntries &&
                availableEntries.length > 0 &&
                doesUserHoldAnyFundsInThisPool && (
                  <>
                    <button
                      onClick={toggleExpand}
                      className="bg-custom-grey-gradient py-1 rounded-b-xl  items-center justify-center w-full mx-auto max-xl:flex hidden"
                    >
                      <Image
                        src={arrow}
                        width={12}
                        height={6}
                        alt="Arrow"
                        className={` w-3 h-2 transform transition-transform duration-300 ${
                          !isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </>
                )}
            </div>
          </>
        )}

        <div className="lg:mx-10 mx-3 grid grid-cols-3 my-4 lg:gap-20 gap-5">
          {["Stake", "Unstake", "Claim"].map((pane) => (
            <div
              key={pane}
              className={`semi13 text-center py-2 4k:py-6 cursor-pointer border-solid border-b transition-all duration-400 ease-in-out relative ${
                selectedPane === pane
                  ? "text-white1 border-black1 after:bg-colorful-gradient after:absolute after:h-[1px] after:w-0 after:bottom-0 after:left-0 after:animate-grow-width after:transition-all after:duration-300 before:bg-white before:absolute before:h-[1px] before:w-full before:bottom-0 before:left-0"
                  : "text-gray1 border-black1 hover:text-white after:bg-white after:absolute after:h-[1px] after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300"
              } `}
              onClick={() => setSelectedPane(pane)}
            >
              {pane}
            </div>
          ))}
        </div>

        <div className="flex-1 pb-10 mb-6 lg:mb-0 ">
          {selectedPane === "Stake" ? (
            <StakingCalculator />
          ) : selectedPane === "Unstake" ? (
            <UnstakingCalculator />
          ) : (
            <WithdrawZilPanel
              userUnstakingPoolData={userUnstakingPoolData}
              stakingPoolData={stakingPoolData}
              reward={reward}
            />
          )}
        </div>
      </FastFadeScroll>
    </div>
  )
}

export default StakingPoolDetailsView
