import {
  convertTokenToZil,
  formatPercentage,
  formatUnitsToHumanReadable,
} from "@/misc/formatting"
import { StakingPool, StakingPoolType } from "@/misc/stakingPoolsConfig"
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
      className={`
        ${
          isStakingPoolSelected
            ? "gradient-bottom-border "
            : "border-b-[1.5px] border-black2 rounded-10 hover:bg-gray-grad hover:border-black3 transition-all duration-300"
        } ${isStakingPoolSelected && "bg-black"} hover:cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${
          isStakingPoolSelected ? "content" : "content-hover p-2.5 lg:p-5"
        } flex justify-between items-center`}
      >
        <Image
          className="mr-5 4k:mr-6 rounded-[9.5px] h-[61px] w-[61px] hidden md:block"
          src={stakingPoolData.definition.iconUrl}
          alt={`${stakingPoolData.definition.name} icon`}
          width={61}
          height={61}
        />
        <div className="flex flex-col  w-full">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 4k:gap-3 items-center mb-3">
              <Image
                className=" rounded-10 h5 w-5 xs:h-[30px] xs:w-[30px] md:hidden block"
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
                  <Tooltip
                    placement="top"
                    arrow={true}
                    overlayClassName="custom-tooltip"
                    className="mr-1 4k:mr-1.5"
                    title={
                      stakingPoolData.data ? (
                        stakingPoolData.definition.poolType ===
                        StakingPoolType.LIQUID ? (
                          <>
                            <div>Your staked value</div>
                            <div className="mt-1">
                              ( ~
                              {formatUnitsToHumanReadable(
                                convertTokenToZil(
                                  userStakingPoolData.stakingTokenAmount,
                                  stakingPoolData.data.zilToTokenRate
                                ),
                                18
                              )}{" "}
                              ZIL )
                            </div>
                          </>
                        ) : (
                          <>
                            <div>Your staked value</div>
                          </>
                        )
                      ) : (
                        "Loading value..."
                      )
                    }
                  >
                    <span
                      className={`${stakingPoolData.definition.poolType === StakingPoolType.LIQUID ? "text-aqua1" : "text-purple3"} regular15 `}
                    >
                      {userStakingPoolData &&
                        `${formatUnitsToHumanReadable(
                          userStakingPoolData.stakingTokenAmount,
                          stakingPoolData.definition.tokenDecimals
                        )} ${stakingPoolData.definition.tokenSymbol}`}
                    </span>
                  </Tooltip>
                )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex lg:justify-between lg:w-full items-center">
              <div className="flex max-lg:order-2 items-center">
                {stakingPoolData.data ? (
                  <div
                    className={`lg:medium12 regular12 4k:pr-1.5 pr-1 xs:pr-3 ${
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
                  <div className="4k:pr-1.5 pr-1 xs:pr-3 loading-blur">
                    <span className="lg:medium12 regular12">VP</span>
                    <span className="mr-1 4k:mr-1.5 ">0%</span>
                  </div>
                )}
                <div className="flex medium12 text-gray13 4k:pl-1.5 pl-1 xs:pl-3 border-l-[1px] border-gray4">
                  {stakingPoolData.data ? (
                    <>
                      {" "}
                      Commission{" "}
                      {Math.floor(stakingPoolData.data.commission * 100)}%
                    </>
                  ) : (
                    <span className=" whitespace-nowrap mr-1 4k:mr-1.5 loading-blur">
                      Commission 0%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex bold15 max-md:order-1 4k:ml-2.5 ml-2 xs:ml-6">
              {stakingPoolData.data ? (
                <>
                  <Tooltip
                    placement="top"
                    arrow={true}
                    overlayClassName="custom-tooltip"
                    className="mr-1 4k:mr-1.5"
                    title="Annual Percentage Rate"
                  >
                    <span>APR </span>
                  </Tooltip>

                  {formatPercentage(stakingPoolData.data.apr)}
                </>
              ) : (
                <div className=" whitespace-nowrap mr-1 4k:mr-1.5 loading-blur">
                  APR 000%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakingPoolCard
