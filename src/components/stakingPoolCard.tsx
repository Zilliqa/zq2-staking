import { formatPercentage, formatUnitsToHumanReadable } from '@/misc/formatting';
import { StakingPool } from '@/misc/stakingPoolsConfig';
import { UserStakingPoolData } from '@/misc/walletsConfig';
import Image from 'next/image';

interface StakingPoolCardProps {
  stakingPoolData: StakingPool;
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
            : 'content-hover p-2.5 lg:p-5'
        } flex justify-between`}
      >
        <Image
          className="mr-4 rounded-10 h-[72px] w-[72px] hidden md:block"
          src={stakingPoolData.definition.iconUrl}
          alt={`${stakingPoolData.definition.name} icon`}
          width={72}
          height={72}
        />
        <div className="grid w-full">
          <div className="flex justify-between items-center lg:mb-2">
            <div className="flex ">
              <h3 className="h4 text-white2">
                {stakingPoolData.definition.name}
              </h3>
              <div className="base2 ml-2.5">
                {stakingPoolData.definition.tokenSymbol}
              </div>
            </div>
            <div className="base2 lg:block hidden">
              {userStakingPoolData &&
              userStakingPoolData.stakingTokenAmount ? (
                <> 
                  {userStakingPoolData &&
                    `${formatUnitsToHumanReadable(
                      userStakingPoolData.stakingTokenAmount,
                      stakingPoolData.definition.tokenDecimals
                    )} ${stakingPoolData.definition.tokenSymbol}`}
                </>
              ) : (
                <span className="text-gray2">-</span>
              )}
            </div>
            <Image
              className=" rounded-10 h[30px] w-[30px] xs:h-[40px] xs:w-[40px] md:hidden block"
              src={stakingPoolData.definition.iconUrl}
              alt={`${stakingPoolData.definition.name} icon`}
              width={40}
              height={40}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex lg:justify-between lg:w-full">
              <div className="flex max-lg:order-2">
                {
                  stakingPoolData.data ? (
                    <div
                      className={`base max-xs:ml-2 xs:max-md:ml-6 ${
                        stakingPoolData.data.votingPower * 100 >= 50
                          ? 'text-red1'
                          : stakingPoolData.data.votingPower * 100 >= 30
                          ? 'text-orange1'
                          : 'text-gray4'
                      }`}
                    >
                      VP {stakingPoolData.data.votingPower * 100}%
                    </div>
                  ) : (
                    <>
                      <span className='base max-xs:ml-2 xs:max-md:ml-6'>VP</span>
                      <span className="w-[3em] ml-1 animated-gradient" />
                    </>
                  )
                }
                <div className="flex base ml-2 xs:ml-6 text-gray4">
                  Commission{' '}
                  {
                    stakingPoolData.data ? (
                      <>
                        {Math.floor(stakingPoolData.data.commission * 100)}%
                      </>
                    ) : (
                      <span className="w-[3em] ml-1 animated-gradient" />
                    )
                  }
                </div>
              </div>
              <div className="flex base text-aqua1 max-md:order-1">
                APR{' '}
                {
                  stakingPoolData.data ? (
                    <>
                      {formatPercentage(stakingPoolData.data.apr)}
                    </>
                  ) : (
                    <span className="w-[3em] ml-1 animated-gradient" />
                  )
                }
              </div>
            </div>
            <div className="base2 block lg:hidden">
            {userStakingPoolData && userStakingPoolData.stakingTokenAmount > 0 ? (
              <>
                {userStakingPoolData &&
                  `${formatUnitsToHumanReadable(
                    userStakingPoolData.stakingTokenAmount,
                    stakingPoolData.definition.tokenDecimals
                  )}`}
              </>
            ) : (
              <span className="text-gray2">- {stakingPoolData.definition.tokenSymbol}</span>
            )}
          </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StakingPoolCard;
