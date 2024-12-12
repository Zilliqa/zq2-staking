import { AppConfigStorage } from "@/contexts/appConfigStorage";
import { StakingOperations } from "@/contexts/stakingOperations";
import { formatAddress, getHumanFormDuration, getTxExplorerUrl } from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import { UserUnstakingPoolData } from "@/misc/walletsConfig";
import { Button } from "antd";
import { DateTime } from "luxon";
import Link from "next/link";
import { formatUnits } from "viem";

interface WithdrawZilPanelProps {
  stakingPoolData: StakingPool;
  userUnstakingPoolData?: Array<UserUnstakingPoolData>;
}

const WithdrawZilPanel: React.FC<WithdrawZilPanelProps> = ({
  userUnstakingPoolData,
  stakingPoolData,
}) => {
  const {
    claim,
    isClaimingInProgress,
    claimCallTxHash,
  } = StakingOperations.useContainer();

  const {
    appConfig
  } = AppConfigStorage.useContainer();

  const pendingUnstake = userUnstakingPoolData?.filter(
    (claim) => claim.availableAt > DateTime.now()
  ).toSorted((claimA, claimB) => claimA.availableAt.diff(claimB.availableAt).milliseconds)

  const availableUnstake = userUnstakingPoolData?.filter(
    (claim) => claim.availableAt <= DateTime.now()
  ).toSorted((claimA, claimB) => claimA.availableAt.diff(claimB.availableAt).milliseconds)

  return (
    <div>

      {
        claimCallTxHash !== undefined && (
          <div className="text-center gradient-bg-1 py-2">
            <Link rel="noopener noreferrer" target="_blank" href={getTxExplorerUrl(claimCallTxHash, appConfig.chainId)} passHref={true}>
              Last staking transaction: {formatAddress(claimCallTxHash)}
            </Link>
          </div>
        )
      }

      {
        !!availableUnstake?.length ? (
          availableUnstake.map(
            (item, claimIdx) => (
              <div className="rounded-lg gradient-bg-1 p-4" key={claimIdx}>
                <div className="flex justify-between items-center">
                  {
                    stakingPoolData.data ? <div>
                      {parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL
                    </div> : <div className="w-[4em] h-[1em] animated-gradient" />
                  }
                  <Button
                    className='btn-primary-cyan text-2xl'
                    onClick={() => claim(item.address)}
                    loading={isClaimingInProgress}
                  >
                    Claim
                  </Button>
                </div>
              </div>
            )
          )
        ) : !!pendingUnstake?.length ? (
          <div className="rounded-lg bg-gradientbg-1 p-4">
            <div className="text-2xl text-gray-500">
              Next available Claim
            </div>
            <div className="mt-2 flex justify-between">
              <div>
                {getHumanFormDuration(pendingUnstake[0].availableAt)}
              </div>
              {
                stakingPoolData.data ? <div>
                  {parseFloat(formatUnits(pendingUnstake[0].zilAmount, 18)).toFixed(3)} ZIL
                </div> : <div className="w-[4em] h-[1em] animated-gradient" />
              }
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center my-32">
            No available Claims
          </div>
        )
      }

      {
        !!pendingUnstake?.length && (
          <div className="mt-4">
            <div className="font-bold text-gray-500">
              All pending requests
            </div>

            {
              pendingUnstake?.map((claim, claimIdx) => (
                <div className="flex justify-between my-2" key={claimIdx}>

                  {
                    stakingPoolData.data ? <div>
                      {parseFloat(formatUnits(claim.zilAmount, 18)).toFixed(3)} ZIL
                    </div> : <div className="w-[4em] h-[1em] animated-gradient" />
                  }
                  <div>
                    {getHumanFormDuration(claim.availableAt)}
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}

export default WithdrawZilPanel;

