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
    <div className={`${isStakingPoolSelected ? "  gradient-bottom-border" : 'border-b border-black2 rounded-10 '} ${isStakingPoolSelected && 'bg-black'} hover:cursor-pointer`} onClick={onClick}>
      <div className={`${isStakingPoolSelected ? 'content': 'py-[19.5px] pl-5 pr-7.5'} flex justify-between`}>
        <Image
          className="mr-2.5 rounded-10 h-[72px] w-[72px]"
          src={stakingPoolData.iconUrl}
          alt={`${stakingPoolData.name} icon`}
          width={48}
          height={48}
        />
        <div className="grid w-full">
          <div className="flex justify-between">
            <div className="flex">
            <h3 className="h4 text-white2">{stakingPoolData.name}</h3>
            <div className="base2 ml-2.5">{stakingPoolData.tokenSymbol}</div>
            </div>
            <div className="base2"> <span className="text-gray2">- </span>{userStakingPoolData && `${userStakingPoolData.stakedZil} stZIL`}</div>
          </div>
          
          <div className="flex justify-between">
            <div className="flex">
            <div className={`base ${
                stakingPoolData.votingPower * 100 >= 70
                  ? "text-gray4"
                  : stakingPoolData.votingPower * 100 >= 40
                  ? "text-orange1"
                  : "text-red1"
              }`}>VP {stakingPoolData.votingPower * 100}%</div>
            <div className="base ml-6 text-gray4">Commission: {Math.floor(stakingPoolData.commission * 100)}%</div>
            </div>
            <div className="base text-aqua1">APR: {formatPercentage(stakingPoolData.apr)}</div>
          </div>
        </div>
      </div>

    </div>
  )

}

export default StakingPoolCard;