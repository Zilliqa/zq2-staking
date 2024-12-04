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
              unstakingItems.map((claim, claimIdx) => (
                <div
                  className="bg-[#20202580] bg-opacity-50 p-4 rounded-lg flex justify-between items-center"
                  key={claimIdx}
                >
                  <div>
                    <div className="flex items-center">
                      <Image
                          className="mr-4 rounded-lg"
                          src={claim.stakingPool.definition.iconUrl}
                          alt={`${claim.stakingPool.definition.name} icon`}
                          width={32}
                          height={32}
                        />
                      <div>
                        {claim.stakingPool.definition.name}
                      </div>
                    </div>
                    <div className="flex mt-2 ml-1 items-end">
                      <div className="text-xl font-bold">
                        {claim.unstakeInfo.unstakedZil} {claim.stakingPool.definition.tokenSymbol}
                      </div>
                      <div className="text-sm text-gray-400 ml-3">
                        {
                          claim.stakingPool.data ? <>
                            {formattedTokenValueInZil(claim.unstakeInfo.unstakedZil, claim.stakingPool.data!.zilToTokenRate)} ZIL
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
                    disabled={!claim.available}
                    onClick={() => onClaim(claim.unstakeInfo.unstakedZil)}
                  >
                    {claim.available ? 'Claim' : claim.unstakeInfo.availableAt.diffNow("days").days.toFixed(0) + ' days left'}
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