import StakingCalculator from "@/components/stakingCalculator";
import UnstakingCalculator from "@/components/unstakingCalculator";
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel";
import { StakingPoolData, UserStakingPoolData, UserUnstakingPoolData } from "@/contexts/stakingPoolsStorage";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage } from "@/misc/formatting";
import { DateTime } from "luxon";
import { useState } from "react";

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPoolData;
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
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen,
    zilAvailable,
  } = WalletConnector.useContainer();

  const [selectedPane, setSelectedPane] = useState<string>('Stake');

  const onUnstake = () => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for unstaking`);
    setIsDummyWalletPopupOpen(true);
  }

  const onStake = (zilToStake: number) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ${zilToStake} ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  const onClaim = () => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing/claiming the unstaked ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  const colorInfoEntry = (title: string, value: string) => (
    <div className="pl-3 md:pl-0">
      <div className='text-xl text-[#6DD3C2]'>
        { value }
      </div>
      <div className='text-[#6DD3C2] text-sm'>
        { title }
      </div>
    </div>
  )

  const greyInfoEntry = (title: string, value: string) => (
    <div className="pl-3 md:pl-0">
      <div className='text-xl text-gray-500 whitespace-nowrap'>
        { value }
      </div>
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
        {stakingPoolData.name}
      </span>
      <span className='text-xl text-gray-500 ml-2'>
        {stakingPoolData.tokenSymbol}
      </span>

      <div className="gradient-bg-2 grid grid-cols-2 md:grid-cols-4 gap-4 md:-mx-5 md:px-10 mt-10 py-3">

        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to stake", `${zilAvailable} ZIL`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Staked", `${userStakingPoolData?.stakedZil || 0} ${stakingPoolData.tokenSymbol}`) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Unstake requests", pendingUnstakesValue ? `${pendingUnstakesValue} ${stakingPoolData.tokenSymbol}`: "-" ) }
        { doesUserHoldAnyFundsInThisPool && colorInfoEntry("Available to claim", availableToClaim ? `${availableToClaim} ${stakingPoolData.tokenSymbol}` : "-") }

        { greyInfoEntry("Voting power", formatPercentage(stakingPoolData.votingPower)) }
        { greyInfoEntry("Total supply", `${stakingPoolData.tvl}`) }
        { greyInfoEntry("Commission", formatPercentage(stakingPoolData.commission)) }
        { greyInfoEntry("Rate", `ZIL = ${stakingPoolData.zilToTokenRate} ${stakingPoolData.tokenSymbol}`) }
      </div>

      <div className="grid grid-cols-3 md:-mx-5 my-5">
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
          <StakingCalculator onStakeClick={onStake} />
        ) : selectedPane === 'Unstake' ? (
          <UnstakingCalculator onStakeClick={onUnstake} />
        ) : (
          <WithdrawZilPanel
            onClaimClick={onClaim}
            userUnstakingPoolData={userUnstakingPoolData}
            stakingPoolData={stakingPoolData}
          />
        )
      }

    </div>
  )

}

export default StakingPoolDetailsView;