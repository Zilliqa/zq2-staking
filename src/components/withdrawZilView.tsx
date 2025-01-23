import { StakingOperations } from "@/contexts/stakingOperations";
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { convertTokenToZil, formatUnitsToHumanReadable, getHumanFormDuration } from "@/misc/formatting";
import { Button } from "antd";
import Image from 'next/image';

const WithdrawZilView: React.FC = () => {
  const {
    availableForUnstaking,
    pendingUnstaking,
    selectStakingPoolForView,
    isUnstakingDataLoading
  } = StakingPoolsStorage.useContainer();

  const {
    claim,
  } = StakingOperations.useContainer();

  const unstakingItems = [
    ...availableForUnstaking.map((item) => ({ ...item, available: true })),
    ...pendingUnstaking.map((item) => ({ ...item, available: false }))
  ]

  return (
    <div className="relative overflow-y-auto max-h-[calc(90vh-15vh)]   
    scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1
     flex flex-col gap-2" >
      <div className=" text-center lg:text-end max-h-[20vh]">
        <h1 className="hero text-white mt-4">
          <span className="hidden lg:block">Staking Portal</span>
          <span className="block lg:hidden">Claims</span>
        </h1>
        <p className="w-2/3 sm:w-1/2 md:w-1/4 lg:w-full max-lg:mx-auto my-2 lg:my-5 body2">
          Below are withdrawal claims waiting for you       
        </p>
      </div>

      {
        unstakingItems.length > 0 ? (

          <div className="grid grid-cols-1 gap-4 lg:gap-5 overflow-y-auto  max-h-[calc(90vh-30vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 lg:pb-10
          pr-4
          ">
            {
              unstakingItems.map((item, claimIdx) => (
                <div
                  className="flex gap-2.5 lg:w-full max-lg:flex-col"
                  key={claimIdx}
                >
                  <div className="flex lg:flex-col bg-gradientbg content-center px-3 py-4 lg:px-4 rounded-lg justify-between max-lg:items-center lg:w-2/3">
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
                         {
                          item.stakingPool.data ? <>
                            {
                              formatUnitsToHumanReadable(
                                convertTokenToZil(item.unstakeInfo.zilAmount, item.stakingPool.data!.zilToTokenRate),
                                18
                              )
                            }  ZIL

                          </> :
                          <>
                            <div className="w-[2em] h-[0.75em] animated-gradient" />
                          </>
                        }
                        
                      </div> 
                      <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">{item.unstakeInfo.zilAmount} {item.stakingPool.definition.tokenSymbol}</div>
                    </div>
                  </div>
                  <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
                  <div className="max-lg:w-1/2">
                    <Button
                      className="btn-primary-gradient-aqua"
                      disabled={!item.available}
                      onClick={() => claim(item.unstakeInfo.address)}
                    >
                      {item.available ? 'Claim' : getHumanFormDuration(item.unstakeInfo.availableAt) + ' left'}
                    </Button>
                    </div>
                    <div className="max-lg:w-1/2 lg:mt-2.5">
                      <Button
                        className="btn-primary-white1"
                        onClick={() => selectStakingPoolForView(item.stakingPool.definition.id)}
                      >
                        View
                      </Button>
                    </div>
                  </div>

                </div>
              ))
            }
          </div>
        ) : (
          <div className="w-full text-end text-white">
            {
              isUnstakingDataLoading ? (
                <div className="animated-gradient h-[2em] w-full"></div>
              ) : (
                <span>
                  Here is the testing ground for the new Zilliqa portal. 
                  Explore and give us you feedback.
                </span>
              )
            }
          </div>
        )
      }
    </div>
  )

}

export default WithdrawZilView;