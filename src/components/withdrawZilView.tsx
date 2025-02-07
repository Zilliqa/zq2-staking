import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"

import {
  convertTokenToZil,
  formatUnitsToHumanReadable,
  getHumanFormDuration,
} from "@/misc/formatting"
import FeedbackIcon from "../assets/svgs/feedback-icon.svg"
import { Button } from "antd"
import Image from "next/image"

const WithdrawZilView: React.FC = () => {
  const {
    availableForUnstaking,
    pendingUnstaking,
    selectStakingPoolForView,
    isUnstakingDataLoading,
  } = StakingPoolsStorage.useContainer()

  const { claim } = StakingOperations.useContainer()

  const unstakingItems = [
    ...availableForUnstaking.map((item) => ({ ...item, available: true })),
    ...pendingUnstaking.map((item) => ({ ...item, available: false })),
  ]

  return (
    <div
      className="relative overflow-y-auto max-h-[calc(90vh-15vh)]   
    scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1
     flex flex-col gap-2"
    >
      <div className=" text-center max-h-[20vh]">
        <h1 className="hero text-white mt-4">
          <span className="hidden lg:block">Staking Portal</span>
          <span className="block lg:hidden">Claims</span>
        </h1>
      </div>

      {unstakingItems.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-4 lg:gap-5 overflow-y-auto  max-h-[calc(90vh-30vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 lg:pb-10
           pr-2 lg:pr-4
          "
        >
          {unstakingItems.map((item, claimIdx) => (
            <div
              className="flex gap-2.5 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-xl"
              key={claimIdx}
            >
              <div className="flex lg:flex-col content-center px-3 py-4 lg:px-4 rounded-lg justify-between max-lg:items-center lg:w-2/3">
                <div className="flex items-center">
                  <Image
                    className="mr-2 lg:mr-2.5"
                    src={item.stakingPool.definition.iconUrl}
                    alt={`${item.stakingPool.definition.name} icon`}
                    width={31}
                    height={31}
                  />
                  <div className="body1">
                    {item.stakingPool.definition.name}
                  </div>
                </div>
                <div className="flex lg:mt-3 items-center">
                  <div className="h3-s max-lg:order-2">
                    {item.stakingPool.data ? (
                      <>
                        {formatUnitsToHumanReadable(
                          convertTokenToZil(
                            item.unstakeInfo.zilAmount,
                            item.stakingPool.data!.zilToTokenRate
                          ),
                          18
                        )}{" "}
                        ZIL
                      </>
                    ) : (
                      <>
                        <div className="w-[2em] h-[0.75em] animated-gradient" />
                      </>
                    )}
                  </div>
                  <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">
                    {item.unstakeInfo.zilAmount}{" "}
                    {item.stakingPool.definition.tokenSymbol}
                  </div>
                </div>
              </div>
              <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
                <div className="max-lg:w-1/2">
                  <Button
                    className="btn-primary-gradient-grey w-full"
                    disabled={!item.available}
                    onClick={() => claim(item.unstakeInfo.address)}
                  >
                    {item.available
                      ? "Claim"
                      : getHumanFormDuration(item.unstakeInfo.availableAt) +
                        " left"}
                  </Button>
                </div>
                <div className="max-lg:w-1/2 lg:mt-2.5">
                  <Button
                    className="btn-secondary-gradient-grey"
                    onClick={() =>
                      selectStakingPoolForView(item.stakingPool.definition.id)
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-1/2 text-center text-white mx-auto lg:my-10">
          {isUnstakingDataLoading ? (
            <div className="animated-gradient h-[2em] w-full"></div>
          ) : (
            <>
              <div className="flex justify-center mb-9.5">
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
              </div>
              <div className="text-28 mb-15 font-medium">
                No claims? We’d love to hear your feedback !
              </div>
            </>
          )}
          <Button
            type="primary"
            className="btn-primary-gradient-aqua-lg !w-fit px-11 group"
          >
            Leave Feedback
          </Button>
        </div>
      )}
    </div>
  )
}

export default WithdrawZilView
