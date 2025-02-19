import StakingCalculator from "@/components/stakingCalculator"
import UnstakingCalculator from "@/components/unstakingCalculator"
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel"
import { WalletConnector } from "@/contexts/walletConnector"
import { formatPercentage, formatUnitsToHumanReadable } from "@/misc/formatting"
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

import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"

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

  const colorInfoEntry = (title: string, value: string | null) => (
    <div>
      <div className="semi14 text-aqua1">{value}</div>
      <div className="text-gray8 info-label">{title}</div>
    </div>
  )

  const greyInfoEntry = (title: string, value: string | JSX.Element | null) => (
    <div key={title}>
      {value ? (
        <div className="semi14 text-gray7 xl:whitespace-nowrap">{value}</div>
      ) : (
        <div className="animated-gradient h-[1.5em] w-[4em]"></div>
      )}
      <div className="text-gray8 info-label xl:whitespace-nowrap">{title}</div>
    </div>
  )

  const isPoolLiquid = () =>
    stakingPoolData.definition.poolType === StakingPoolType.LIQUID

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
        formatPercentage(stakingPoolData.data.votingPower)
      ),

    stakingPoolData.data &&
      greyInfoEntry(
        "Total supply",
        `${humanReadableStakingToken(stakingPoolData.data.tvl)} ${stakingPoolData.definition.tokenSymbol}`
      ),

    stakingPoolData.data &&
      greyInfoEntry(
        "Commission",
        formatPercentage(stakingPoolData.data.commission)
      ),

    isPoolLiquid() &&
      stakingPoolData.data &&
      greyInfoEntry(
        "",
        <>
          1 ZIL ~ <br />
          {stakingPoolData.data.zilToTokenRate.toPrecision(3)}{" "}
          {stakingPoolData.definition.tokenSymbol}
        </>
      ),
  ]

  const availableEntries = greyInfoEntries.filter(Boolean)
  const columnCount = availableEntries.length

  return (
    <div className="relative pb-2 4k:pb-4 pr-2 lg:pr-4 4k:pr-6 flex flex-col h-full">
      <div className="items-center flex justify-between py-1 lg:py-7.5">
        <div className="max-lg:ms-1 items-center w-full flex justify-between">
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

                <Image
                  onClick={handleClickAaddToken}
                  className="h-[28px] w-[28px] ml-4 cursor-pointer"
                  src={PlusIcon}
                  alt="arrow icon"
                  width={28}
                  height={28}
                />
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

      <div className="bg-grey-gradient py-6 4k:py-10 flex flex-col gap-4 4k:gap-6 4k:px-16 lg:px-9.5 px-5 rounded-xl">
        {doesUserHoldAnyFundsInThisPool && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 4k:gap-6 pb-4 4k:pb-6 border-b border-black2/50">
            {colorInfoEntry(
              "Available to stake",
              `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`
            )}
            {colorInfoEntry(
              "Staked",
              `${humanReadableStakingToken(
                userStakingPoolData?.stakingTokenAmount || 0n
              )} ${stakingPoolData.definition.tokenSymbol}`
            )}
            {colorInfoEntry(
              "Unstake Requested ",
              pendingUnstakesValue
                ? `${humanReadableStakingToken(
                    pendingUnstakesValue
                  )} ${stakingPoolData.definition.tokenSymbol}`
                : "-"
            )}
            {colorInfoEntry(
              "Available to claim",
              availableToClaim
                ? `${humanReadableStakingToken(availableToClaim)} ${
                    stakingPoolData.definition.tokenSymbol
                  }`
                : "-"
            )}
          </div>
        )}

        <div
          className={`grid gap-4 4k:gap-6 text-center ${
            columnCount === 1
              ? "grid-cols-1"
              : columnCount === 2
                ? "grid-cols-2"
                : columnCount === 3
                  ? "grid-cols-3"
                  : "grid-cols-4"
          }`}
        >
          {availableEntries}
        </div>
      </div>
      <div className="grid grid-cols-3 my-2 4k:my-4">
        {["Stake", "Unstake", "Claim"].map((pane) => (
          <div
            key={pane}
            className={`semi13 text-center py-4 4k:py-6 cursor-pointer border-solid border-b ${
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

      <FastFadeScroll className="flex-1 pb-4 mb-16 lg:mb-0 overflow-y-scroll">
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
      </FastFadeScroll>
    </div>
  )
}

export default StakingPoolDetailsView
