import { StakingPoolData, UserStakingPoolData } from "@/contexts/stakingPoolsStorage";
import { formatPercentage } from "@/misc/formatting";
import { RightOutlined } from '@ant-design/icons';

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
    <div className={`bg-[#20202580] bg-opacity-50 p-4 rounded-lg shadow-md ${isStakingPoolSelected && "!bg-yellow-500"}`} onClick={onClick}>
      <div className="flex justify-between">
        <div className="grid w-full">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold">{stakingPoolData.name}</h3>
            <div>{userStakingPoolData && `${userStakingPoolData.stakedZil} stZIL`}</div>
          </div>
          
          <div className="flex justify-between">
            <p className="text-gray-500">TVL: {stakingPoolData.tvl}</p>
            <p className="text-gray-500">APY: {formatPercentage(stakingPoolData.apy)}</p>
          </div>
        </div>

        <div className="w-[2em]">
          <RightOutlined />
        </div>
      </div>

    </div>
  )

}

export default StakingPoolCard;