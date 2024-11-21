import { StakingPoolData, UserStakingPoolData } from "@/contexts/stakingPoolsStorage";
import { formatPercentage } from "@/misc/formatting";
import { useState } from "react";
import StakingCalculator from "./stakingCalculator";
import { WalletConnector } from "@/contexts/walletConnector";
import UnstakingCalculator from "./unstakingCalculator";

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPoolData;
  userStakingPoolData?: UserStakingPoolData;
  selectStakingPoolForStaking: (stakingPoolId: string) => void;
}

const StakingPoolDetailsView: React.FC<StakingPoolDetailsViewProps> = ({
  stakingPoolData,
}) => {

  const {
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen
  } = WalletConnector.useContainer();

  const [selectedPane, setSelectedPane] = useState<string>('stake');

  const onUnstake = () => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for unstaking`);
    setIsDummyWalletPopupOpen(true);
  }

  const onStake = (zilToStake: number) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for staking ${zilToStake} ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  return (
    <div className="relative">
      <span className='text-5xl'>
        {stakingPoolData.name}
      </span>
      <span className='text-xl text-gray-500 ml-2'>
        {stakingPoolData.tokenSymbol}
      </span>


      <div className="bg-gray-900 grid grid-cols-2 md:flex gap-4 md:gap-0 md:justify-between mt-10 md:-mx-12 md:px-10 py-3">
        <div>
          <div className='text-xl text-gray-500'>
            {formatPercentage(stakingPoolData.votingPower)}
          </div>
          <div className='text-gray-500 text-sm'>
            Voting power
          </div>
        </div>

        <div>
          <div className='text-xl text-gray-500'>
            {stakingPoolData.tvl}
          </div>
          <div className='text-gray-500 text-sm'>
            Total supply
          </div>
        </div>

        <div>
          <div className='text-xl text-gray-500'>
            {formatPercentage(stakingPoolData.commission)}
          </div>
          <div className='text-gray-500 text-sm'>
            Commision
          </div>
        </div>

        <div>
          <div className='text-xl text-gray-500'>
            1 ZIL = {stakingPoolData.zilToTokenRate} {stakingPoolData.tokenSymbol}
          </div>
          <div className='text-gray-500 text-sm'>
            Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:-mx-12 my-5">
        {
          ['stake', 'unstake'].map((pane) => (
            <div
              key={pane}
              className={`text-2xl text-center py-2 cursor-pointer border-solid border-b-4 ${selectedPane === pane ? "text-white-100 border-indigo-500" : "text-gray-600 border-black"} `}
              onClick={() => setSelectedPane(pane)}
            >
              {pane}
            </div>
          ))
        }
      </div>

      {
        selectedPane === 'stake' ? (
          <StakingCalculator onStakeClick={onStake} />
        ) : (
          <UnstakingCalculator onStakeClick={onUnstake} />
        )
      }

    </div>
  )

}

export default StakingPoolDetailsView;