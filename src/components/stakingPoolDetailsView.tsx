import StakingCalculator from "@/components/stakingCalculator";
import UnstakingCalculator from "@/components/unstakingCalculator";
import WithdrawZilPanel from "@/components/withdrawUnstakedZilPanel";
import { WalletConnector } from "@/contexts/walletConnector";
import { formatPercentage } from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import { UserStakingPoolData, UserUnstakingPoolData } from "@/misc/walletsConfig";
import { DateTime } from "luxon";
import { useState } from "react";
import { Button } from "antd";

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
    <div>
      <div className='body2-bold text-aqua2'>
        { value }
      </div>
      <div className='text-aqua3 info-label'>
        { title }
      </div>
    </div>
  )

  const greyInfoEntry = (title: string, value: string | JSX.Element  | null) => (
    <div>
      {
        value ? (
          <div className='body2-bold text-gray1 xl:whitespace-nowrap'>
            { value }
          </div>
        ) : (
          <div className="animated-gradient h-[1.5em] w-[4em]"></div>
        )
      }
      <div className='text-gray2 info-label xl:whitespace-nowrap'>
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
    <div className="relative overflow-y-auto max-h-[calc(100vh-38vh)] xs:max-h-[calc(100vh-30vh)] lg:max-h-[calc(100vh-20vh)]
       scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray3 hover:scrollbar-thumb-gray2">
      <div className="items-center flex justify-between py-1 lg:py-7.5">
        <div className="max-lg:ms-1 items-center flex">
          <span className='hero lg:h2 text-white2'>
            {stakingPoolData.definition.name}
          </span>
          <span className='body1 lg:h4 text-black2 ml-2.5'>
            {stakingPoolData.definition.tokenSymbol}
          </span>
        </div>
        <div className="max-w-[210px] hidden sm:block">
          <Button className="btn-primary-gradient-aqua">
              Custom CTA 
          </Button>
        </div>
      </div>

      <div className="bg-darkbg py-7.5 lg:py-5 flex flex-col gap-4">
        {doesUserHoldAnyFundsInThisPool && 
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-black2/50">
          { colorInfoEntry("Available to stake", `${zilAvailable} ZIL`) }
          { colorInfoEntry("Staked", `${userStakingPoolData?.stakedZil || 0} ${stakingPoolData.definition.tokenSymbol}`) }
          { colorInfoEntry("Unstake requests", pendingUnstakesValue ? `${pendingUnstakesValue} ${stakingPoolData.definition.tokenSymbol}`: "-" ) }
          { colorInfoEntry("Available to claim", availableToClaim ? `${availableToClaim} ${stakingPoolData.definition.tokenSymbol}` : "-") }
        </div>
        }
        <div className="grid grid-cols-4 gap-4">
          { greyInfoEntry("Voting power", stakingPoolData.data && formatPercentage(stakingPoolData.data.votingPower)) }
          { greyInfoEntry("Total supply", stakingPoolData.data && `${stakingPoolData.data.tvl}`) }
          { greyInfoEntry("Commission", stakingPoolData.data && formatPercentage(stakingPoolData.data.commission)) }
          { greyInfoEntry("", stakingPoolData.data &&
             (
              <>
                1 ZIL = <br />
                {stakingPoolData.data.zilToTokenRate} {stakingPoolData.definition.tokenSymbol}
              </>
            )) }
        </div>
      </div>
      <div className="grid grid-cols-3">
        {
          ['Stake', 'Unstake', 'Claim'].map((pane) => (
            <div
              key={pane}
              className={`body1 lg:base text-center py-7 cursor-pointer border-solid border-b ${selectedPane === pane ? "text-white2 border-gradient-1" : "text-gray2 border-black2"} `}
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