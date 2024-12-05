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
    <div className="relative">
      <div className="text-end text-white mb-10">
        <h1 className="text-5xl font-bold">Liquid Staking <br/>with Zilliqa</h1>
        <p className="mt-1 text-sm">
          Below are withdrawal claims waiting for you
        </p>
      </div>

      {
        unstakingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {
              unstakingItems.map((item, claimIdx) => (
                <div
                  className="bg-[#20202580] bg-opacity-50 p-4 rounded-lg flex justify-between items-center"
                  key={claimIdx}
                >
                  <div>
                    <div className="flex items-center">
                      <Image
                          className="mr-4 rounded-lg"
                          src={item.stakingPool.definition.iconUrl}
                          alt={`${item.stakingPool.definition.name} icon`}
                          width={32}
                          height={32}
                        />
                      <div>
                        {item.stakingPool.definition.name}
                      </div>
                    </div>
                    <div className="flex mt-2 ml-1 items-end">
                      <div className="text-xl font-bold">
                        {item.unstakeInfo.unstakingTokenAmount} {item.stakingPool.definition.tokenSymbol}
                      </div>
                      <div className="text-sm text-gray-400 ml-3">
                        {
                          item.stakingPool.data ? <>
                            {
                              formatUnitsToHumanReadable(
                                convertTokenToZil(item.unstakeInfo.unstakingTokenAmount, item.stakingPool.data!.zilToTokenRate),
                                18
                              )
                            } ZIL
                          </> :
                          <>
                            <div className="w-[2em] h-[0.75em] animated-gradient" />
                          </>
                        }
                        
                      </div>
                    </div>
                  </div>

                  <Button
                    className="btn-primary-white"
                    disabled={!item.available}
                    onClick={() => claim(item.unstakeInfo.unstakingTokenAmount)}
                  >
                    {item.available ? 'Claim' : item.unstakeInfo.availableAt.diffNow("days").days.toFixed(0) + ' days left'}
                  </Button>
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