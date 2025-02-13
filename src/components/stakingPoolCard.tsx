import { formatPercentage, formatUnitsToHumanReadable } from "@/misc/formatting"
import { StakingPool } from "@/misc/stakingPoolsConfig"
import { UserStakingPoolData } from "@/misc/walletsConfig"
import { Tooltip } from "antd"
import Image from "next/image"

interface StakingPoolCardProps {
  stakingPoolData: StakingPool
  userStakingPoolData?: UserStakingPoolData
  isStakingPoolSelected?: boolean
  onClick: () => void
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
          ? "gradient-bottom-border "
          : "border-b-[1.5px] border-black2 rounded-10 gradient-bottom-border-hover "
      } ${isStakingPoolSelected && "bg-black"} hover:cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          isStakingPoolSelected ? "content" : "content-hover p-2.5 lg:p-5"
        } flex justify-between items-center`}
      >
        <Image
          className="mr-5 rounded-[9.5px] h-[61px] w-[61px] hidden md:block"
          src={stakingPoolData.definition.iconUrl}
          alt={`${stakingPoolData.definition.name} icon`}
          width={61}
          height={61}
        />
        <div className="flex flex-col  w-full">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center mb-3">
              <Image
                className=" rounded-10 h[20px] w-[20px] xs:h-[30px] xs:w-[30px] md:hidden block"
                src={stakingPoolData.definition.iconUrl}
                alt={`${stakingPoolData.definition.name} icon`}
                width={40}
                height={40}
              />
              <h3 className="bold22">{stakingPoolData.definition.name}</h3>
              <div className="base-medium text-gray13 mt-1">
                    {stakingPoolData.definition.tokenSymbol}
              </div>
            </div>
            <div>
                    {userStakingPoolData &&
                    userStakingPoolData.stakingTokenAmount && (
                      <span className="regular15 text-aqua1">
                        {userStakingPoolData &&
                          `${formatUnitsToHumanReadable(
                            userStakingPoolData.stakingTokenAmount,
                            stakingPoolData.definition.tokenDecimals
                          )} ${stakingPoolData.definition.tokenSymbol}`}
                      </span>
                    )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex lg:justify-between lg:w-full items-center">
              <div className="flex max-lg:order-2 items-center">
                {stakingPoolData.data ? (
                  <div
                    className={`lg:medium12 regular12 pr-1 xs:pr-3 ${
                      stakingPoolData.data.votingPower * 100 >= 50
                        ? "text-red2"
                        : stakingPoolData.data.votingPower * 100 >= 30
                          ? "text-orange1"
                          : ""
                    }`}
                  >
                    VP {(stakingPoolData.data.votingPower * 100).toPrecision(3)}
                    %
                  </div>
                ) : (
                  <div className=" pr-1 xs:pr-3">
                    <span className="lg:medium12 regular12">
                      VP
                    </span>
                    <span className="w-[3em] ml-1 animated-gradient" />
                  </div>
                )}
                <div className="flex medium12 text-gray13 pl-1 xs:pl-3 border-l-[1px] border-gray4">
                  Commission{" "}
                  {stakingPoolData.data ? (
                    <>{Math.floor(stakingPoolData.data.commission * 100)}%</>
                  ) : (
                    <span className="w-[3em] ml-1 animated-gradient" />
                  )}
                </div>
                  </div>
                  </div>
                <div className="flex bold15 max-md:order-1  ml-2 xs:ml-6">
                  <Tooltip
                    placement="top"
                    arrow={true}
                    color="#555555"
                    className=" mr-1"
                    title="Annual Percentage Rate"
                  >
                    <span>APR </span>
                  </Tooltip>

                  {stakingPoolData.data ? (
                    <>{formatPercentage(stakingPoolData.data.apr)}</>
                  ) : (
                    <span className="w-[3em] ml-1 animated-gradient" />
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default StakingPoolCard
