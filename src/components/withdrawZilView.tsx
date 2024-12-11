import { StakingOperations } from "@/contexts/stakingOperations";
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { convertTokenToZil, formatUnitsToHumanReadable } from "@/misc/formatting";
import { Button } from "antd";
import Image from 'next/image';

const WithdrawZilView: React.FC = () => {
  const {
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer();

  const {
    claim,
  } = StakingOperations.useContainer();

  const unstakingItems = [
    ...availableForUnstaking.map((item) => ({ ...item, available: true })),
    ...pendingUnstaking.map((item) => ({ ...item, available: false }))
  ]

  return (
    <div className="flex flex-col gap-4" >
      <div className=" text-center lg:text-end">
        <h1 className="hero text-white mt-4">
          <span className="hidden lg:block">Staking Portal</span>
          <span className="block lg:hidden">Claims</span>
        </h1>
        <p className="w-2/3 sm:w-1/2 md:w-1/4 lg:w-full max-lg:mx-auto mt-2 lg:mt-5 body2">
          Below are withdrawal claims waiting for you       
        </p>
      </div>

      {
        unstakingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:gap-5 overflow-y-auto max-h-[calc(100vh-38vh)] xs:max-h-[calc(100vh-42vh)] lg:max-h-[calc(100vh-27vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray3 hover:scrollbar-thumb-gray2 lg:pb-10">
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
                     {/*  <div className="text-xl font-bold">
                        {item.unstakeInfo.unstakingTokenAmount} {item.stakingPool.definition.tokenSymbol}
                      </div>
                      */}
                       <div className="h3-s max-lg:order-2">
                         {
                          item.stakingPool.data ? <>
                            {
                              formatUnitsToHumanReadable(
                                convertTokenToZil(item.unstakeInfo.unstakingTokenAmount, item.stakingPool.data!.zilToTokenRate),
                                18
                              )
                            }  ZIL

                          </> :
                          <>
                            <div className="w-[2em] h-[0.75em] animated-gradient" />
                          </>
                        }
                        
                      </div> 
                      <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">{item.unstakeInfo.unstakedZil} {item.stakingPool.definition.tokenSymbol}</div>
                    </div>
                  </div>
                  <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
                  <div className="max-lg:w-1/2">
                    <Button
                      className="btn-primary-gradient-aqua"
                      disabled={!item.available}
                      onClick={() => claim(item.unstakeInfo.unstakingTokenAmount)}
                    >
                      {item.available ? 'Claim' : item.unstakeInfo.availableAt.diffNow("days").days.toFixed(0) + ' days left'}
                    </Button>
                    </div>
                    <div className="max-lg:w-1/2 lg:mt-2.5">
                    <Button
                      className="btn-primary-white2"
                     >
                      View
                    </Button></div>
                  </div>

                </div>
              ))
            }
          </div>
        ) : (
          <div className="text-center">
            WoW such empty
          </div>
        )
      }
    </div>
  )

}

export default WithdrawZilView;