import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import StakingPoolCard from "./stakingPoolCard";

const StakingPoolsList: React.FC = () => {
  const {
    combinedStakingPoolsData,
    selectStakingPoolForView,
    stakingPoolForView,
  } = StakingPoolsStorage.useContainer();

  return (
    <>
      <div className="h3 text-white2 max-lg:w-1/4  mb-4">
        Liquid Validators
      </div>
 
      <div className="grid grid-cols-1 gap-2.5 lg:gap-4">
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
    </>
  )
}

export default StakingPoolsList;