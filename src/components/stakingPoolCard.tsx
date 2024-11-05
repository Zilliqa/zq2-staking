import { StakingPoolData, UserStakingPoolData } from "@/contexts/stakingPoolsStorage";

interface StakingPoolCardProps {
  stakingPoolData: StakingPoolData;
  userStakingPoolData?: UserStakingPoolData;
  isStakingPoolSelected?: boolean;
  onClick: () => void;
}

const StakingPoolCard: React.FC<StakingPoolCardProps> = ({
  stakingPoolData,
  userStakingPoolData,
  isStakingPoolSelected,
  onClick
}) => {

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${isStakingPoolSelected && "bg-yellow-500"}`} onClick={onClick}>
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">{stakingPoolData.name}</h3>
        <div>{userStakingPoolData && `${userStakingPoolData.stakedZil} stZIL`}</div>
      </div>
      
      <div className="flex justify-between">
        <p className="text-gray-500">TVL: {stakingPoolData.tvl}</p>
        <p className="text-gray-500">APY: {(stakingPoolData.apy * 100).toFixed(2)}%</p>
      </div>

    </div>
  )

}

export default StakingPoolCard;