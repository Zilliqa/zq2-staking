import StakingCalculator from "@/components/stakingCalculator";
import UnstakingCalculator from "@/components/unstakingCalculator";
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage } from "@/misc/formatting";
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
    stake,
    unstake,
    claim,
    zilAvailable,
  } = WalletConnector.useContainer();

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
    (acc, item) => acc + item.unstakedZil,
    0
  );

  const availableToClaim = userUnstakingPoolData?.filter(
    (item) => item.availableAt <= DateTime.now()
  ).reduce(
    (acc, item) => acc + item.unstakedZil,
    0
  );

  const doesUserHoldAnyFundsInThisPool = !!(userStakingPoolData?.stakedZil || pendingUnstakesValue || availableToClaim);

  return (
    <div className="relative">
      <span className='text-5xl'>
        {stakingPoolData.definition.name}
      </span>
      <span className='text-xl text-gray-500 ml-2'>
        {stakingPoolData.definition.tokenSymbol}
      </span>

      <div className="gradient-bg-2 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:-mx-5 lg:px-10 mt-10 py-3">

        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to stake", `${zilAvailable} ZIL`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Staked", `${userStakingPoolData?.stakedZil || 0} ${stakingPoolData.definition.tokenSymbol}`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Unstake requests", pendingUnstakesValue ? `${pendingUnstakesValue} ${stakingPoolData.definition.tokenSymbol}`: "-" ) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to claim", availableToClaim ? `${availableToClaim} ${stakingPoolData.definition.tokenSymbol}` : "-") }

        { greyInfoEntry("Voting power", stakingPoolData.data && formatPercentage(stakingPoolData.data.votingPower)) }
        { greyInfoEntry("Total supply", stakingPoolData.data && `${stakingPoolData.data.tvl}`) }
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
          <StakingCalculator onStakeClick={stake} />
        ) : selectedPane === 'Unstake' ? (
          <UnstakingCalculator onUnstakeClick={unstake} />
        ) : (
          <WithdrawZilPanel
            onClaimClick={claim}
            userUnstakingPoolData={userUnstakingPoolData}
            stakingPoolData={stakingPoolData}
          />
        )
      }

    </div>
  )

}

export default StakingPoolDetailsView;