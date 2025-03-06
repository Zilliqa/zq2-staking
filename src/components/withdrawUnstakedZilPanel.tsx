import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"

import {
  formatAddress,
  formatUnitsToHumanReadable,
  getHumanFormDuration,
  getTxExplorerUrl,
} from "@/misc/formatting"
import { StakingPool, StakingPoolType } from "@/misc/stakingPoolsConfig"
import {
  UserNonLiquidStakingPoolRewardData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { Button, Tooltip } from "antd"
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
    preparingClaimUnstakeTx,
    claimReward,
    isClaimingRewardInProgress,
    claimRewardCallTxHash,
    preparingClaimRewardTx,
    stakeReward,
    isStakingRewardInProgress,
    stakeRewardCallTxHash,
    preparingStakeRewardTx,
  } = StakingOperations.useContainer()

  const { appConfig } = AppConfigStorage.useContainer()
  const { getMinimalPoolStakingAmount } = StakingPoolsStorage.useContainer()

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
        <div className="text-center gradient-bg-1 py-2 regular-base">
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
            flex flex-col justify-evenly gap-2 4k:gap-3 mb-2.5 lg:mb-4 4k:mb-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl w-full"
        >
          <div className="items-center h4 w-full flex justify-between text-white1">
            {stakingPoolData.data ? (
              <div>
                <div className="body2">
                  <span
                    className={`${
                      stakingPoolData.definition.poolType ===
                      StakingPoolType.LIQUID
                        ? "text-aqua1"
                        : "text-purple5"
                    }`}
                  >
                    Claimable Rewards
                  </span>
                </div>
                <div>
                  {parseFloat(formatUnits(reward.zilRewardAmount, 18)).toFixed(
                    5
                  )}{" "}
                  ZIL
                </div>
              </div>
            ) : (
              <div className="loading-blur"> 00000 zil</div>
            )}
            <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[250px] w-full">
              {getMinimalPoolStakingAmount(reward.address) >
              reward.zilRewardAmount ? (
                <Tooltip
                  placement="top"
                  arrow={true}
                  overlayClassName="custom-tooltip"
                  className="mr-1"
                  title={`Reward is less than the minimal staking amount of ${formatUnitsToHumanReadable(
                    getMinimalPoolStakingAmount(reward.address),
                    18
                  )} ZIL`}
                >
                  <Button
                    className={` 
                      ${
                        isStakingRewardInProgress
                          ? stakingPoolData.definition.poolType ===
                            StakingPoolType.LIQUID
                            ? "liquid-loading"
                            : "non-liquid-loading"
                          : ""
                      }
                      ${stakingPoolData.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey lg:py-5 py-4 mb-2.5`}
                    onClick={() => stakeReward(reward.address)}
                    loading={isStakingRewardInProgress}
                    disabled={true}
                  >
                    Stake Reward
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  className={` 
                    ${
                      isStakingRewardInProgress
                        ? stakingPoolData.definition.poolType ===
                          StakingPoolType.LIQUID
                          ? "liquid-loading"
                          : "non-liquid-loading"
                        : ""
                    }
                    ${stakingPoolData.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey lg:py-5 py-4 mb-2.5`}
                  onClick={() => stakeReward(reward.address)}
                  loading={isStakingRewardInProgress}
                >
                  {preparingStakeRewardTx
                    ? "Confirm in wallet"
                    : isStakingRewardInProgress
                      ? "Processing"
                      : "Stake Reward"}
                </Button>
              )}

              <Button
                className={` 
                  ${
                    isClaimingRewardInProgress
                      ? stakingPoolData.definition.poolType ===
                        StakingPoolType.LIQUID
                        ? "liquid-loading"
                        : "non-liquid-loading"
                      : ""
                  }
                  ${stakingPoolData.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey lg:py-5 py-4`}
                onClick={() => claimReward(reward.address)}
                loading={isClaimingRewardInProgress}
              >
                {preparingClaimRewardTx
                  ? "Confirm in wallet"
                  : isClaimingRewardInProgress
                    ? "Processing"
                    : "Claim Reward"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!!availableUnstake?.length ? (
        availableUnstake.map((item, claimIdx) => (
          <div
            className=" min-h-[100px] lg:min-h-[124px] xl:min-h-[140px] 
            flex flex-col justify-evenly gap-2 4k:gap-3 mb-2.5 lg:mb-4 4k:mb-6 p-3 lg:p-5 xl:p-7 4k:p-10 bg-grey-gradient rounded-xl w-full"
            key={claimIdx}
          >
            <div className="items-center h4 w-full flex justify-between text-white1">
              {stakingPoolData.data ? (
                <div>
                  <div className="body2">
                    <span
                      className={`${
                        stakingPoolData.definition.poolType ===
                        StakingPoolType.LIQUID
                          ? "text-aqua1"
                          : "text-purple5"
                      }`}
                    >
                      Claimable Withdrawals
                    </span>
                  </div>
                  <div>
                    {parseFloat(formatUnits(item.zilAmount, 18)).toFixed(3)} ZIL
                  </div>
                </div>
              ) : (
                <div className="loading-blur">000.000 ZIL</div>
              )}
              <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 max-w-[250px] w-full">
                <Button
                  className={` 
                    ${
                      isClaimingUnstakeInProgress
                        ? stakingPoolData.definition.poolType ===
                          StakingPoolType.LIQUID
                          ? "liquid-loading"
                          : "non-liquid-loading"
                        : ""
                    }
                    ${stakingPoolData.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey lg:py-5 py-4`}
                  onClick={() => claimUnstake(item.address)}
                  loading={isClaimingUnstakeInProgress}
                >
                  {preparingClaimUnstakeTx
                    ? "Confirm in wallet"
                    : isClaimingUnstakeInProgress
                      ? "Processing"
                      : "Claim"}
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : !!pendingUnstake?.length ? (
        <div
          className="flex flex-col min-h-[100px] lg:min-h-[132px] xl:min-h-[148px] justify-evenly  
         mb-2.5 lg:mb-4 4k:mb-6 py-2 lg:py-6 xl:py-8 4k:py-10 
         px-3 lg:px-7.5 xl:px-10 4k:px-14 bg-grey-gradient rounded-xl w-full"
        >
          <div className="body2 text-gray1">Claim your unstaked ZIL in:</div>
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
              <div className="loading-blur">00.000</div>
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
                <div className="loading-blur">00.000 ZIL</div>
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
