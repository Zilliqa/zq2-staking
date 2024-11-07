import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import StakingPoolCard from "./stakingPoolCard";
import { formatPercentage } from "@/misc/formatting";
import { MoneyCollectFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';

interface StakingPoolsListProps {

}

const StakingPoolsList: React.FC<StakingPoolsListProps> = ({

}) => {

  const {
    combinedStakingPoolsData,
    selectStakingPoolForView,
    selectStakingPoolForStaking,
    stakingPoolForView,
    stakingPoolForStaking
  } = StakingPoolsStorage.useContainer();


  if (stakingPoolForStaking) {
    return (
      <div className="bg-black p-10 flex justify-between" onClick={() => selectStakingPoolForStaking(null)}>
        <div className="flex items-center text-4xl">
          <LeftOutlined className="text-2xl mr-2" />
          <div>
            Validators
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="grid">
            {/* align text to end */}
            <div className="text-xs text-right">
              {stakingPoolForStaking.stakingPool.name}
            </div>
            <div className="text-xs text-right">
              {formatPercentage(stakingPoolForStaking.stakingPool.apy)}
            </div>
          </div>
          <div className="flex items-center ml-2">
            <MoneyCollectFilled  className="text-4xl"/>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="bg-black p-10">
        <div className="flex items-center text-4xl">
          <RightOutlined className="text-2xl mr-2" />
          <div>
            Validators
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {combinedStakingPoolsData.map(({ stakingPool, userData }) => (
            <StakingPoolCard
              key={stakingPool.name}
              stakingPoolData={stakingPool}
              userStakingPoolData={userData}
              isStakingPoolSelected={stakingPoolForView?.stakingPool.id === stakingPool.id}
              onClick={() => selectStakingPoolForView(stakingPool.id)}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default StakingPoolsList;