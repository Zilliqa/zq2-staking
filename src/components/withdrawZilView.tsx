import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { WalletConnector } from "@/contexts/walletConnector";
import { formattedTokenValueInZil } from "@/misc/formatting";
import { Button } from "antd";
import Image from 'next/image';

const WithdrawZilView: React.FC = () => {
  const {
    availableForUnstaking,
    pendingUnstaking,
  } = StakingPoolsStorage.useContainer();

  const {
    setDummyWalletPopupContent,
    setIsDummyWalletPopupOpen
  } = WalletConnector.useContainer();

  const unstakingItems = [
    ...availableForUnstaking.map((item) => ({ ...item, available: true })),
    ...pendingUnstaking.map((item) => ({ ...item, available: false }))
  ]

  const onClaim = (zilToUnstake: number) => {
    setDummyWalletPopupContent(`Now User gonna approve the wallet transaction for withdrawing ${zilToUnstake} unstaked ZIL`);
    setIsDummyWalletPopupOpen(true);
  }

  return (
    <div className="relative">
      <div className=" text-center lg:text-end p-4">
        <h1 className="hero text-white">
          <span className="hidden lg:block">Staking Portal</span>
          <span className="block lg:hidden">Claims</span>
        </h1>
        <p className="w-2/3 sm:w-1/2 md:w-1/4 lg:w-full max-lg:mx-auto lg:mt-5 body2">
          Below are withdrawal claims waiting for you       
        </p>
      </div>

      {
        unstakingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:gap-5 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-38vh)] xs:max-h-[calc(100vh-42vh)] lg:max-h-[calc(100vh-27vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray3 hover:scrollbar-thumb-gray2 ">
            {
              unstakingItems.map((claim, claimIdx) => (
                <div
                  className="flex gap-2.5 lg:w-full max-lg:flex-col"
                  key={claimIdx}
                >
                  <div className="flex lg:flex-col bg-gradientbg content-center px-3 py-4 lg:px-4 rounded-lg justify-between max-lg:items-center lg:w-2/3">
                   <div className="flex items-center">
                      <Image
                          className="mr-2 lg:mr-2.5"
                          src={claim.stakingPool.definition.iconUrl}
                          alt={`${claim.stakingPool.definition.name} icon`}
                          width={31}
                          height={31}
                        />
                      <div className="body1">
                        {claim.stakingPool.definition.name}
                      </div>
                    </div>
                   <div className="flex lg:mt-3 items-center">
                       <div className="h3-s max-lg:order-2">
                         {
                          claim.stakingPool.data ? <>
                            {formattedTokenValueInZil(claim.unstakeInfo.unstakedZil, claim.stakingPool.data!.zilToTokenRate)} ZIL
                          </> :
                          <>
                            <div className="w-[2em] h-[0.75em] animated-gradient" />
                          </>
                        }
                        
                      </div> 
                      <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">{claim.unstakeInfo.unstakedZil} {claim.stakingPool.definition.tokenSymbol}</div>
                    </div>
                  </div>
                  <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
                  <div className="max-lg:w-1/2">
                    <Button
                      className="btn-primary-gradient-aqua"
                      disabled={!claim.available}
                      onClick={() => onClaim(claim.unstakeInfo.unstakedZil)}
                    >
                      {claim.available ? 'Claim' : claim.unstakeInfo.availableAt.diffNow("days").days.toFixed(0) + ' days left'}
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