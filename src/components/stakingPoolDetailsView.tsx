import StakingCalculator from "@/components/stakingCalculator";
import UnstakingCalculator from "@/components/unstakingCalculator";
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel";
import { StakingOperations } from "@/contexts/stakingOperations";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage, formatUnitsToHumanReadable } from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import { UserStakingPoolData, UserUnstakingPoolData } from "@/misc/walletsConfig";
import { DateTime } from "luxon";
import { useState } from "react";

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPool;
  userStakingPoolData?: UserStakingPoolData;
  userUnstakingPoolData?: Array<UserUnstakingPoolData>;
  selectStakingPoolForStaking: (stakingPoolId: string) => void;
}

const StakingPoolDetailsView: React.FC<StakingPoolDetailsViewProps> = ({
  stakingPoolData,
  userStakingPoolData,
  userUnstakingPoolData,
}) => {

  const {
    zilAvailable,
  } = WalletConnector.useContainer();

  const {
    unstake,
  } = StakingOperations.useContainer();

  const [selectedPane, setSelectedPane] = useState<string>('Stake');

  const colorInfoEntry = (title: string, value: string | null) => (
    <div className="pl-3 lg:pl-0">
      <div className='text-xl text-[#6DD3C2]'>
        { value }
      </div>
      <div className='text-[#6DD3C2] text-sm'>
        { title }
      </div>
    </div>
  )

  const greyInfoEntry = (title: string, value: string | null) => (
    <div className="pl-3 lg:pl-0">
      {
        value ? (
          <div className='text-xl text-gray-500 whitespace-nowrap'>
            { value }
          </div>
        ) : (
          <div className="animated-gradient h-[1.5em] w-[4em]"></div>
        )
      }
      <div className='text-gray-500 text-sm whitespace-nowrap'>
        { title }
      </div>
    </div>
  )

  const pendingUnstakesValue = userUnstakingPoolData?.filter(
    (item) => item.availableAt > DateTime.now()
  ).reduce(
    (acc, item) => acc + item.unstakingTokenAmount,
    0n
  );

  const availableToClaim = userUnstakingPoolData?.filter(
    (item) => item.availableAt <= DateTime.now()
  ).reduce(
    (acc, item) => acc + item.unstakingTokenAmount,
    0n
  );

  const doesUserHoldAnyFundsInThisPool = !!(userStakingPoolData?.stakingTokenAmount || pendingUnstakesValue || availableToClaim);

  const humanReadableStakingToken = (value: bigint) => formatUnitsToHumanReadable(value, stakingPoolData.definition.tokenDecimals);

  return (
    <div className="relative">
      <span className='text-5xl'>
        {stakingPoolData.definition.name}
      </span>
      <span className='text-xl text-gray-500 ml-2'>
        {stakingPoolData.definition.tokenSymbol}
      </span>

      <div className="gradient-bg-2 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:-mx-5 lg:px-10 mt-10 py-3">

        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to stake", `${formatUnitsToHumanReadable(zilAvailable || 0n, 18)} ZIL`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Staked", `${humanReadableStakingToken(userStakingPoolData?.stakingTokenAmount || 0n)} ${stakingPoolData.definition.tokenSymbol}`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Unstake requests", pendingUnstakesValue ? `${humanReadableStakingToken(pendingUnstakesValue)} ${stakingPoolData.definition.tokenSymbol}`: "-" ) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to claim", availableToClaim ? `${humanReadableStakingToken(availableToClaim)} ${stakingPoolData.definition.tokenSymbol}` : "-") }

        { greyInfoEntry("Voting power", stakingPoolData.data && formatPercentage(stakingPoolData.data.votingPower)) }
        { greyInfoEntry("Total supply", stakingPoolData.data && `${humanReadableStakingToken(stakingPoolData.data.tvl)} ${stakingPoolData.definition.tokenSymbol}`) }
        { greyInfoEntry("Commission", stakingPoolData.data && formatPercentage(stakingPoolData.data.commission)) }
        { greyInfoEntry("Rate", stakingPoolData.data && `ZIL = ${stakingPoolData.data.zilToTokenRate} ${stakingPoolData.definition.tokenSymbol}`) }
      </div>

      <div className="grid grid-cols-3 lg:-mx-5 my-5">
        {
          ['Stake', 'Unstake', 'Claim'].map((pane) => (
            <div
              key={pane}
              className={`text-2xl text-center py-2 cursor-pointer border-solid border-b-4 ${selectedPane === pane ? "text-white-100 border-gradient-1" : "text-gray-600 border-black"} `}
              onClick={() => setSelectedPane(pane)}
            >
              {pane}
            </div>
          ))
        }
      </div>

      {
        selectedPane === 'Stake' ? (
          <StakingCalculator />
        ) : selectedPane === 'Unstake' ? (
          <UnstakingCalculator />
        ) : (
          <WithdrawZilPanel
            userUnstakingPoolData={userUnstakingPoolData}
            stakingPoolData={stakingPoolData}
          />
        )
      }

    </div>
  )

}

export default StakingPoolDetailsView;