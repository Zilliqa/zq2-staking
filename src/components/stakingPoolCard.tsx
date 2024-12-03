import {
  StakingPoolData,
  UserStakingPoolData,
} from '@/contexts/stakingPoolsStorage';
import { formatPercentage } from '@/misc/formatting';
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
  onClick,
}) => {
  return (
    <div
      className={`${
        isStakingPoolSelected
          ? 'gradient-bottom-border '
          : 'border-b-[1.5px] border-black2 rounded-10 gradient-bottom-border-hover'
      } ${isStakingPoolSelected && 'bg-black'} hover:cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          isStakingPoolSelected
            ? 'content'
            : 'content-hover px-2.5 pt-2.5 pb-5 md:py-[20px] md:pl-5 md:pr-7.5'
        } flex justify-between`}
      >
        <Image
          className="mr-4 rounded-10 h-[72px] w-[72px] hidden md:block"
          src={stakingPoolData.iconUrl}
          alt={`${stakingPoolData.name} icon`}
          width={72}
          height={72}
        />
        <div className="grid w-full">
          <div className="flex justify-between">
            <div className="flex">
              <h3 className="h4 text-white2">
                {stakingPoolData.name}
              </h3>
              <div className="base2 ml-2.5">
                {stakingPoolData.tokenSymbol}
              </div>
            </div>
            <div className="base2 md:block hidden">
              {userStakingPoolData &&
              userStakingPoolData.stakedZil ? (
                <> 
                  {userStakingPoolData &&
                    `${userStakingPoolData.stakedZil} stZIL`}
                </>
              ) : (
                <span className="text-gray2">-</span>
              )}
            </div>
            <Image
              className=" rounded-10 h-[40px] w-[40px] md:hidden block"
              src={stakingPoolData.iconUrl}
              alt={`${stakingPoolData.name} icon`}
              width={40}
              height={40}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex md:justify-between md:w-full">
              <div className="flex max-md:order-2">
                <div
                  className={`base max-md:ml-6 ${
                    stakingPoolData.votingPower * 100 >= 70
                      ? 'text-gray4'
                      : stakingPoolData.votingPower * 100 >= 40
                      ? 'text-orange1'
                      : 'text-red1'
                  }`}
                >
                  VP {stakingPoolData.votingPower * 100}%
                </div>
                <div className="base ml-6 text-gray4">
                  Commission:{' '}
                  {Math.floor(stakingPoolData.commission * 100)}%
                </div>
              </div>
              <div className="base text-aqua1 max-md:order-1">
                APR: {formatPercentage(stakingPoolData.apr)}
              </div>
            </div>
            <div className="base2 block md:hidden">
            {userStakingPoolData && userStakingPoolData.stakedZil ? (
              <>
                {userStakingPoolData &&
                  `${userStakingPoolData.stakedZil} stZIL`}
              </>
            ) : (
              <span className="text-gray2">- stZIL</span>
            )}
          </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StakingPoolCard;
