import { StakingPoolData, UserStakingPoolData } from "@/contexts/stakingPoolsStorage";
import { formatPercentage } from "@/misc/formatting";
import Image from 'next/image';

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
    <div className={`bg-[#20202580] bg-opacity-50 p-4 rounded-lg shadow-md border-b-2 border-transparent ${isStakingPoolSelected && "gradient-bg-1 border-gradient-2"} hover:cursor-pointer`} onClick={onClick}>
      <div className="flex justify-between">
        <Image
          className="mr-4 rounded-lg"
          src={stakingPoolData.iconUrl}
          alt={`${stakingPoolData.name} icon`}
          width={48}
          height={48}
        />
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
      </div>

    </div>
  )

}

export default StakingPoolCard;