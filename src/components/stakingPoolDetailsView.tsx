import StakingCalculator from "@/components/stakingCalculator";
import UnstakingCalculator from "@/components/unstakingCalculator";
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel";
import { WalletConnector } from "@/contexts/walletConnector";
import { getViemClient } from "@/misc/chainConfig";
import {
  formatPercentage,
  formatUnitsToHumanReadable,
} from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import {
  UserStakingPoolData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig";
import { Button } from "antd";
import { DateTime } from "luxon";
import { useState } from "react";
import { useWatchAsset } from "wagmi";
import { useWalletClient } from "wagmi";
import Plus from "../assets/svgs/plus.svg";
import PlusIcon from "../assets/svgs/plus-icon.svg";
import Image from "next/image";

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPool
  userStakingPoolData?: UserStakingPoolData
  userUnstakingPoolData?: Array<UserUnstakingPoolData>
  selectStakingPoolForStaking: (stakingPoolId: string) => void
}

const StakingPoolDetailsView: React.FC<StakingPoolDetailsViewProps> = ({
  stakingPoolData,
  userStakingPoolData,
  userUnstakingPoolData,
}) => {
  const { zilAvailable } = WalletConnector.useContainer()

  const [selectedPane, setSelectedPane] = useState<string>("Stake");

  const colorInfoEntry = (title: string, value: string | null) => (
    <div>
      <div className="body2-semibold text-aqua2">{value}</div>
      <div className="text-gray8 info-label">{title}</div>
    </div>
  )

  const greyInfoEntry = (title: string, value: string | JSX.Element | null) => (
    <div>
      {value ? (
        <div className="body2-semibold text-gray7 xl:whitespace-nowrap">
          {value}
        </div>
      ) : (
        <div className="animated-gradient h-[1.5em] w-[4em]"></div>
      )}
      <div className="text-gray8 info-label xl:whitespace-nowrap">{title}</div>
    </div>
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
    formatUnitsToHumanReadable(value, stakingPoolData.definition.tokenDecimals);

  const { watchAsset } = useWatchAsset();

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
          console.log("Asset watched successfully:", data);
        },
        onError: (error) => {
          console.error("Failed to watch the asset:", error);
        },
      },
    );
  
  return (
    <div
      className="relative overflow-y-auto max-h-[calc(90vh-10vh)] sm:max-h-[calc(90vh-15vh)]
      scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 pb-2
       pr-2 lg:pr-4"
    >
      <div className="items-center flex justify-between py-1 lg:py-7.5">
        <div className="max-lg:ms-1 items-center flex">
          <span className="text-white1 text-48 font-bold mr-6">
            {stakingPoolData.definition.name}
          </span>
          <span className="text-38 lg:h4 text-black3  font-light">|</span>
          <span className="body1 lg:h4 text-gray6 ml-6 font-medium">
            {stakingPoolData.definition.tokenSymbol}
          </span>
          <Image
            onClick={handleClickAaddToken}
            className="h-[28px] w-[28px] ml-4 cursor-pointer"
            src={PlusIcon}
            alt={`arrow icon`}
            width={28}
            height={28}
          />
        </div>
        {/* <div>
          <Button
            onClick={handleClickAaddToken}
            className="btn-primary-gradient-aqua-lg lg:btn-primary-gradient-aqua group"
          >
            <Image
              className="h-[24px] w-[24px] transform transition-transform ease-out duration-500 group-hover:rotate-180"
              src={Plus}
              alt={"arrow icon"}
              width={24}
              height={24}
            />
            <span className="!hidden sm:!block lg:!hidden xl:!block ">
              Add Token
            </span>
          </Button>
        </div> */}
      </div>

      <div className="bg-grey-gradient py-6 flex flex-col gap-4 px-9.5 rounded-xl">
        {doesUserHoldAnyFundsInThisPool && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-black2/50">
            {colorInfoEntry(
              "Available to stake",
              `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`,

            )}
            {colorInfoEntry(
              "Staked",
              `${humanReadableStakingToken(
                userStakingPoolData?.stakingTokenAmount || 0n,
              )} ${stakingPoolData.definition.tokenSymbol}`,
            )}
            {colorInfoEntry(
              "Unstake",
              pendingUnstakesValue
                ? `${humanReadableStakingToken(
                    pendingUnstakesValue,
                  )} ${stakingPoolData.definition.tokenSymbol}`
                : "-",
            )}
            {colorInfoEntry(
              "Available to claim",
              availableToClaim
                ? `${humanReadableStakingToken(availableToClaim)} ${
                    stakingPoolData.definition.tokenSymbol
                  }`
                : "-",

            )}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {greyInfoEntry(
            "Voting power",
            stakingPoolData.data &&
              formatPercentage(stakingPoolData.data.votingPower),
          )}
          {greyInfoEntry(
            "Total supply",
            stakingPoolData.data &&
              `${humanReadableStakingToken(
                stakingPoolData.data.tvl,
              )} ${stakingPoolData.definition.tokenSymbol}`,
          )}
          {greyInfoEntry(
            "Commission",
            stakingPoolData.data &&
              formatPercentage(stakingPoolData.data.commission),
          )}
          {greyInfoEntry(
            "",
            stakingPoolData.data && (
              <>
                1 ZIL ~ <br />
                {stakingPoolData.data.zilToTokenRate.toPrecision(3)}{" "}
                {stakingPoolData.definition.tokenSymbol}
              </>
            ),
          )}
        </div>
      </div>
      <div className="grid grid-cols-3">
        {["Stake", "Unstake", "Claim"].map((pane) => (
          <div
            key={pane}
            className={`body1 lg:base text-center py-7 cursor-pointer border-solid border-b ${
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

      {selectedPane === "Stake" ? (
        <StakingCalculator />
      ) : selectedPane === "Unstake" ? (
        <UnstakingCalculator />
      ) : (
        <WithdrawZilPanel
          userUnstakingPoolData={userUnstakingPoolData}
          stakingPoolData={stakingPoolData}
        />
      )}
    </div>
  )
}

export default StakingPoolDetailsView
