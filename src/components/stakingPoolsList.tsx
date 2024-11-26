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
      <div className="flex items-center mb-3">
        <div className="text-4xl font-bold">
          Liquid Validators
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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