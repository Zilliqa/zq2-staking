import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import { WalletConnector } from "@/contexts/walletConnector";
import { Button } from "antd";

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
              unstakingItems.map((item) => (
                <div className="bg-[#20202580] bg-opacity-50 p-4 rounded-lg flex justify-between">
                  <div>
                    {item.stakingPool.name}
                  </div>
                  <Button
                    className="btn-primary-white"
                    disabled={!item.available}
                    onClick={() => onClaim(item.unstakeInfo.unstakedZil)}
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