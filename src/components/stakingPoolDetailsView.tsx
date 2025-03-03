import StakingCalculator from "@/components/stakingCalculator"
import UnstakingCalculator from "@/components/unstakingCalculator"
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel"
import { WalletConnector } from "@/contexts/walletConnector"
import {
  convertTokenToZil,
  formatPercentage,
  formatUnitsToHumanReadable,
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
      placement="top"
      arrow={true}
      overlayClassName="custom-tooltip"
      className=""
      title={tooltip}
    >
      <div
        className={`${isPoolLiquid() ? "lg:w-1/4 w-1/2 lg:text-left text-center" : " xl:text-left text-center w-1/3"}`}
      >
        <div
          className={`semi14 ${isPoolLiquid() ? "text-aqua1" : "text-purple5"}`}
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
          className={`semi14  ${isPoolLiquid() ? "text-aqua1" : "text-purple5"}`}
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
      placement="top"
      arrow={true}
      overlayClassName="custom-tooltip"
      className=""
      title={tooltip}
    >
      <div
        key={title}
        className={`  ${isPoolLiquid() ? "lg:w-1/4 w-1/2" : "w-1/3"} `}
      >
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
        "Voting power",
        formatPercentage(stakingPoolData.data.votingPower),
        "The share of total staked ZIL controlled by the validator."
      ),

    stakingPoolData.data &&
      greyInfoEntry(
        "Total supply",
        `${humanReadableStakingToken(stakingPoolData.data.tvl)} ${stakingPoolData.definition.tokenSymbol}`,
        "The total supply of a Liquid Staking validator’s Liquid Staking Token (LST)."
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
          {parseFloat(
            formatUnits(
              convertTokenToZil(
                parseEther("1"),
                stakingPoolData.data.zilToTokenRate
              ),
              18
            )
          ).toFixed(2)}{" "}
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

  return (
    <div className="relative pb-2 4k:pb-4  lg:pr-4 4k:pr-6 flex flex-col h-full ">
      <div className="items-center flex justify-between py-1 lg:py-7.5">
        <div className="max-lg:ms-1 items-center w-full flex justify-between mb-5">
          <div className="flex items-center">
            <span className="text-white1 bold33 lg:mr-6 mr-2">
              {stakingPoolData.definition.name}
            </span>

            {isPoolLiquid() && (
              <>
                <span className="lg:text-38 text-20 lg:h4 text-black3  font-light">
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
                  {/* <div className=" ml-4 btn-primary-purple p-2 border-purple4 border-[1px]">
                  <Image
                    onClick={handleClickAaddToken}
                    className="h-[28px] w-[28px] cursor-pointer"
                    src={PlusIcon}
                    alt="arrow icon"
                    width={28}
                    height={28}
                  /></div> */}
                  {/* <div className="group ml-4 btn-primary-purple p-2 border-purple4 border-[1px] flex items-center justify-center w-fit transition-all duration-300 overflow-hidden">
  <Image
    onClick={handleClickAaddToken}
    className="h-[28px] w-[28px] cursor-pointer transition-all duration-300"
    src={PlusIcon}
    alt="plus icon"
    width={28}
    height={28}
  />
  <span className="ml-2 text-white opacity-0 hidden w-0 group-hover:w-fit group-hover:opacity-100 group-hover:block transition-all duration-500 whitespace-nowrap">
    Add Token
  </span>
</div> */}

{/* <div className="group ml-4 btn-primary-purple p-2 border-purple4 border-[1px] flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden">
  <Image
    onClick={handleClickAaddToken}
    className="h-[28px] w-[28px] transition-all duration-300 flex-shrink-0"
    src={PlusIcon}
    alt="plus icon"
    width={28}
    height={28}
  />
  <div className="overflow-hidden transition-all duration-300 w-0 group-hover:w-auto">
    <span className="ml-2 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
      Add Token
    </span>
  </div>
</div> */}

<div className="group ml-4 btn-primary-purple p-2 border-purple4 border-[1px] flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden">
  <Image
    onClick={handleClickAaddToken}
    className="h-[28px] w-[28px] transition-all duration-300 flex-shrink-0"
    src={PlusIcon}
    alt="plus icon"
    width={28}
    height={28}
  />
  <div className="overflow-hidden transition-all duration-300 w-0 group-hover:w-auto">
    <span className="mx-2 text-white whitespace-nowrap block transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 delay-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
      Add Token
    </span>
  </div>
</div>

                </Tooltip>
              </>
            )}
          </div>
          <div className="flex items-center">
            <div
              className="hover:cursor-pointer hover:opacity-80"
              onClick={() => {
                selectStakingPoolForView(null)
              }}
            >
              <Image
                className=""
                src={CloseIcon}
                alt={"close icon"}
                width={26}
                height={26}
              />
            </div>
          </div>
        </div>
      </div>
      <FastFadeScroll
        isPoolLiquid={stakingPoolData.definition.poolType}
        className="overflow-y-scroll"
      >
        {isPoolLiquid() ? (
          <div className="bg-grey-gradient  flex flex-col gap-2  max-lg:mt-5  rounded-xl">
            <div
              className={` ${doesUserHoldAnyFundsInThisPool ? "max-lg:pt-6 " : "py-6"} lg:py-6 4k:py-10 4k:px-16 lg:px-9.5 px-5`}
            >
              {doesUserHoldAnyFundsInThisPool && isWalletConnected && (
                <div
                  className={"flex flex-wrap max-lg:gap-y-4  4k:pb-6  pb-4 "}
                >
                  {colorInfoEntry(
                    "Available to stake",
                    `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`,
                    "The maximum amount of ZIL you can stake with this validator."
                  )}
                  {colorInfoEntry(
                    "Staked",
                    `${humanReadableStakingToken(
                      userStakingPoolData?.stakingTokenAmount || 0n
                    )} ${stakingPoolData.definition.tokenSymbol}`,
                    "The amount of ZIL you have currently staked with this validator."
                  )}
                  {colorInfoEntry(
                    "Unstaked ",
                    pendingUnstakesValue
                      ? `${humanReadableStakingToken(
                          pendingUnstakesValue
                        )} ${stakingPoolData.definition.tokenSymbol}`
                      : "-",
                    "The amount of ZIL you have unstaked from this validator."
                  )}
                  {colorInfoEntry(
                    "Claimable Withdrawals",
                    availableToClaim
                      ? `${humanReadableStakingToken(availableToClaim)} ${
                          stakingPoolData.definition.tokenSymbol
                        }`
                      : "-",
                    "The amount of unstaked ZIL available to claim."
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
                        "The maximum amount of ZIL you can stake with this validator."
                      )}
                      {colorInfoEntry(
                        "Staked",
                        `${humanReadableStakingToken(
                          userStakingPoolData?.stakingTokenAmount || 0n
                        )} ${stakingPoolData.definition.tokenSymbol}`,
                        "The amount of ZIL you have currently staked with this validator."
                      )}
                      {colorInfoEntry(
                        "Unstaked",
                        pendingUnstakesValue
                          ? `${humanReadableStakingToken(
                              pendingUnstakesValue
                            )} ${stakingPoolData.definition.tokenSymbol}`
                          : "-",
                        "The amount of ZIL you have unstaked from this validator."
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
                          "The amount of unstaked ZIL available to claim."
                        )}
                        {stakingPoolForView != null &&
                          asideColorInfoEntry(
                            "Claimable Rewards",
                            stakingPoolForView.userData.reward
                              ? `${parseFloat(formatUnits(stakingPoolForView.userData.reward?.zilRewardAmount ?? "0", 18)).toFixed(5)} ZIL`
                              : "-",
                            "The amount of earned ZIL available to claim."
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
                      `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`,
                      "The maximum amount of ZIL you can stake with this validator."
                    )}
                    {colorInfoEntry(
                      "Staked ",
                      `${humanReadableStakingToken(
                        userStakingPoolData?.stakingTokenAmount || 0n
                      )} ${stakingPoolData.definition.tokenSymbol}`,
                      "The amount of ZIL you have currently staked with this validator."
                    )}
                    {colorInfoEntry(
                      "Unstaked",
                      pendingUnstakesValue
                        ? `${humanReadableStakingToken(
                            pendingUnstakesValue
                          )} ${stakingPoolData.definition.tokenSymbol}`
                        : "-",
                      "The amount of ZIL you have unstaked from this validator."
                    )}
                    {colorInfoEntry(
                      "Claimable Withdrawals",
                      !!availableUnstake?.length
                        ? availableUnstake
                            .map(
                              (item) =>
                                `${parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL`
                            )
                            .join(", ")
                        : "-",
                      "The amount of unstaked ZIL available to claim."
                    )}
                    {stakingPoolForView != null &&
                      colorInfoEntry(
                        "Claimable Rewards",
                        stakingPoolForView.userData.reward
                          ? `${parseFloat(formatUnits(stakingPoolForView.userData.reward?.zilRewardAmount ?? "0", 18)).toFixed(5)} ZIL`
                          : "-",
                        "The amount of earned ZIL available to claim."
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
              className={`semi13 text-center py-2 4k:py-6 cursor-pointer border-solid border-b ${
                selectedPane === pane
                  ? "text-white1 border-gradient-1"
                  : "text-gray1 border-black2"
              } `}
              onClick={() => setSelectedPane(pane)}
            >
              {pane}
            </div>
          ))}
        </div>

        <div className="flex-1 pb-4 mb-16 lg:mb-0 ">
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
