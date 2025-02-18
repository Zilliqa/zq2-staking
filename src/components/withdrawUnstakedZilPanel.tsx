import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"

import {
  formatAddress,
  getHumanFormDuration,
  getTxExplorerUrl,
} from "@/misc/formatting"
import { StakingPool } from "@/misc/stakingPoolsConfig"
import {
  UserNonLiquidStakingPoolRewardData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { Button } from "antd"
import { DateTime } from "luxon"
import Link from "next/link"
import { formatUnits } from "viem"

interface WithdrawZilPanelProps {
  stakingPoolData: StakingPool
  userUnstakingPoolData?: Array<UserUnstakingPoolData>
  reward?: UserNonLiquidStakingPoolRewardData
}

const WithdrawZilPanel: React.FC<WithdrawZilPanelProps> = ({
  userUnstakingPoolData,
  stakingPoolData,
  reward,
}) => {
  const {
    claimUnstake,
    isClaimingUnstakeInProgress,
    claimUnstakeCallTxHash,
    claimReward,
    isClaimingRewardInProgress,
    claimRewardCallTxHash,
    stakeReward,
    isStakingRewardInProgress,
    stakeRewardCallTxHash,
  } = StakingOperations.useContainer()

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

  const hashToShow =
    claimRewardCallTxHash || stakeRewardCallTxHash || claimUnstakeCallTxHash

  return (
    <div className="h-full">
      {hashToShow !== undefined && (
        <div className="text-center gradient-bg-1 py-2 text-gray-500">
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={getTxExplorerUrl(hashToShow, appConfig.chainId)}
            passHref={true}
          >
            Last staking transaction: {formatAddress(hashToShow)}
          </Link>
        </div>
      )}

      {reward && (
        <div
          className=" min-h-[100px] lg:min-h-[124px] xl:min-h-[140px] 
            flex flex-col justify-evenly gap-2 4k:gap-3 my-2.5 lg:my-4 4k:my-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl w-full"
        >
          <div className="items-center h4 w-full flex justify-between text-white1">
            {stakingPoolData.data ? (
              <div>
                <div className="body2">
                  <span className="mr-1 text-aqua2">Available</span>
                  <span className="text-aqua1">rewards</span>
                </div>
                <div>
                  {parseFloat(formatUnits(reward.zilRewardAmount, 18)).toFixed(
                    5
                  )}{" "}
                  ZIL
                </div>
              </div>
            ) : (
              <div className="w-[4em] h-[1em] animated-gradient" />
            )}
            <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px] w-full">
              <Button
                className="btn-secondary-grey lg:py-5 py-4 mb-2.5"
                onClick={() => stakeReward(reward.address)}
                loading={isStakingRewardInProgress}
              >
                Stake Reward
              </Button>
              <Button
                className="btn-secondary-grey lg:py-5 py-4"
                onClick={() => claimReward(reward.address)}
                loading={isClaimingRewardInProgress}
              >
                Claim Reward
              </Button>
            </div>
          </div>
        </div>
      )}

      {!!availableUnstake?.length ? (
        availableUnstake.map((item, claimIdx) => (
          <div
            className=" min-h-[100px] lg:min-h-[124px] xl:min-h-[140px] 
            flex flex-col justify-evenly gap-2 4k:gap-3 my-2.5 lg:my-4 4k:my-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl w-full"
            key={claimIdx}
          >
            <div className="items-center h4 w-full flex justify-between text-white1">
              {stakingPoolData.data ? (
                <div>
                  <div className="body2">
                    <span className="mr-1 text-aqua2">Available</span>
                    <span className="text-aqua1">requests</span>
                  </div>
                  <div>
                    {parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL
                  </div>
                </div>
              ) : (
                <div className="w-[4em] h-[1em] animated-gradient" />
              )}
              <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px] w-full">
                <Button
                  className="btn-secondary-grey lg:py-5 py-4"
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
         my-2.5 lg:my-4 4k:my-6 py-2 lg:py-6 xl:py-8 4k:py-10 
         px-3 lg:px-7.5 xl:px-10 4k:px-14 bg-grey-gradient rounded-xl w-full"
        >
          <div className="body2 text-gray1">Next available unstake request</div>
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
      ) : !reward ? (
        <div className="flex justify-center items-center h-full body2 text-gray1 ">
          No available Claims
        </div>
      ) : (
        <></>
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
