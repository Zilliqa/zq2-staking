import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"

import {
  formatAddress,
  getHumanFormDuration,
  getTxExplorerUrl,
} from "@/misc/formatting"
import { StakingPool } from "@/misc/stakingPoolsConfig"
import { UserUnstakingPoolData } from "@/misc/walletsConfig"
import { Button } from "antd"
import { DateTime } from "luxon"
import Link from "next/link"
import { formatUnits } from "viem"

interface WithdrawZilPanelProps {
  stakingPoolData: StakingPool
  userUnstakingPoolData?: Array<UserUnstakingPoolData>
}

const WithdrawZilPanel: React.FC<WithdrawZilPanelProps> = ({
  userUnstakingPoolData,
  stakingPoolData,
}) => {
  const { claimUnstake, isClaimingUnstakeInProgress, claimUnstakeCallTxHash } =
    StakingOperations.useContainer()

  const { appConfig } = AppConfigStorage.useContainer()

  const pendingUnstake = userUnstakingPoolData
    ?.filter((claim) => claim.availableAt > DateTime.now())
    .toSorted(
      (claimA, claimB) =>
        claimA.availableAt.diff(claimB.availableAt).milliseconds
    )

  const availableUnstake = userUnstakingPoolData
    ?.filter((claim) => claim.availableAt <= DateTime.now())
    .toSorted(
      (claimA, claimB) =>
        claimA.availableAt.diff(claimB.availableAt).milliseconds
    )

  return (
    <div className="overflow-y-scroll max-h-[calc(90vh-50vh)] lg:max-h-[calc(90vh-55vh)] scrollbar-gradient">
      {claimUnstakeCallTxHash !== undefined && (
        <div className="text-center gradient-bg-1 py-2 text-gray-500">
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={getTxExplorerUrl(claimUnstakeCallTxHash, appConfig.chainId)}
            passHref={true}
          >
            Last staking transaction: {formatAddress(claimUnstakeCallTxHash)}
          </Link>
        </div>
      )}

      {!!availableUnstake?.length ? (
        availableUnstake.map((item, claimIdx) => (
          <div
            className=" min-h-[100px] lg:min-h-[124px] xl:min-h-[140px] 
            flex flex-col justify-evenly gap-2 my-2.5 lg:my-4 p-3 lg:p-5 xl:p-7 bg-grey-gradient rounded-xl w-full"
            key={claimIdx}
          >
            <div className="items-center h4 w-full flex justify-between text-white1">
              {stakingPoolData.data ? (
                <div className="flex">
                  <div>
                    {parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL
                  </div>
                  <div className="body1-s lg:ml-2.5  mt-2">avZIL</div>
                </div>
              ) : (
                <div className="w-[4em] h-[1em] animated-gradient" />
              )}
              <div className="">
                <Button
                  className="btn-primary-gradient-aqua"
                  onClick={() => claimUnstake(item.address)}
                  loading={isClaimingUnstakeInProgress}
                >
                  Claim
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : !!pendingUnstake?.length ? (
        <div
          className="flex flex-col min-h-[100px] lg:min-h-[132px] xl:min-h-[148px] justify-evenly  
         my-2.5 lg:my-4 py-2 lg:py-6 xl:py-8  
         px-3 lg:px-7.5 xl:px-10 bg-grey-gradient rounded-xl w-full"
        >
          <div className="body2 text-gray1">Next available reward</div>
          <div className="h4 mt-2 w-full flex justify-between text-white1">
            <div>{getHumanFormDuration(pendingUnstake[0].availableAt)}</div>
            {stakingPoolData.data ? (
              <div>
                {parseFloat(
                  formatUnits(pendingUnstake[0].zilAmount, 18)
                ).toFixed(3)}{" "}
                ZIL
              </div>
            ) : (
              <div className="w-[4em] h-[1em] animated-gradient" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center my-32 body2 text-gray1 ">
          No available Claims
        </div>
      )}

      {!!pendingUnstake?.length && (
        <div className="mt-3 ">
          <div className="info-label mb-3">Pending Requests</div>

          {pendingUnstake?.map((claim, claimIdx) => (
            <div
              className="flex justify-between mb-3 items-center"
              key={claimIdx}
            >
              {stakingPoolData.data ? (
                <div className="flex gap-2.5">
                  <div className="body1 text-white1">
                    {parseFloat(formatUnits(claim.zilAmount, 18)).toFixed(3)}{" "}
                    ZIL
                  </div>
                </div>
              ) : (
                <div className="w-[4em] h-[1em] animated-gradient" />
              )}
              <div className="regular-base text-white1">
                {getHumanFormDuration(claim.availableAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WithdrawZilPanel
