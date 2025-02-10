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
            <h3 className="bold22">{stakingPoolData.definition.name}</h3>
            <Image
              className=" rounded-10 h[30px] w-[30px] xs:h-[40px] xs:w-[40px] md:hidden block"
              src={stakingPoolData.definition.iconUrl}
              alt={`${stakingPoolData.definition.name} icon`}
              width={40}
              height={40}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex lg:justify-between lg:w-full items-center">
              <div className="flex max-lg:order-2 items-center">
                {stakingPoolData.data ? (
                  <div
                    className={`regular12 max-xs:ml-2 xs:max-lg:ml-6 ${
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
                  <>
                    <span className="regular12 max-xs:ml-2 xs:max-lg:ml-6">
                      VP
                    </span>
                    <span className="w-[3em] ml-1 animated-gradient" />
                  </>
                )}
                <div className="flex regular12 ml-2 xs:ml-6">
                  Commission{" "}
                  {stakingPoolData.data ? (
                    <>{Math.floor(stakingPoolData.data.commission * 100)}%</>
                  ) : (
                    <span className="w-[3em] ml-1 animated-gradient" />
                  )}
                </div>

                <div className="flex bold13 max-md:order-1  ml-2 xs:ml-6">
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
              <div className="flex items-center base2">
                <div className=" lg:block hidden ">
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
                    <span className="">-</span>
                  )}
                </div>
                <div>{stakingPoolData.definition.tokenSymbol}</div>
              </div>
            </div>
            <div className="base2 block lg:hidden">
              {userStakingPoolData &&
              userStakingPoolData.stakingTokenAmount > 0 ? (
                <>
                  {userStakingPoolData &&
                    `${formatUnitsToHumanReadable(
                      userStakingPoolData.stakingTokenAmount,
                      stakingPoolData.definition.tokenDecimals
                    )}`}
                </>
              ) : (
                <span className="text-gray1">
                  - {stakingPoolData.definition.tokenSymbol}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakingPoolCard
