import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import rewards from "../assets/svgs/rewards.svg"
import requests from "../assets/svgs/requests.svg"

import {
  formatUnitsToHumanReadable,
  getHumanFormDuration,
} from "@/misc/formatting"
import FeedbackIcon from "../assets/svgs/feedback-icon.svg"
import { StakingPool, StakingPoolType } from "@/misc/stakingPoolsConfig"
import {
  UserNonLiquidStakingPoolRewardData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { Button, Tooltip } from "antd"
import Image from "next/image"
import { Dispatch, SetStateAction, useState } from "react"
import FilterBtn from "./filterBtn"
import FastFadeScroll from "./FastFadeScroll"
import { showNewMessage } from "@intercom/messenger-js-sdk"

interface UnstakeCardProps {
  available: boolean
  unstakeInfo: UserUnstakingPoolData
  stakingPool: StakingPool
  selectStakingPoolForView: (stakingPoolId: string | null) => void
  claimUnstake: (delegatorAddress: string) => void
  setViewClaim: Dispatch<SetStateAction<boolean>>
}

const UnstakeCard: React.FC<UnstakeCardProps> = ({
  available,
  unstakeInfo,
  stakingPool,
  selectStakingPoolForView,
  claimUnstake,
  setViewClaim,
}) => {
  const {
    preparingClaimUnstakeTx,
    isClaimingUnstakeInProgress,
    stakingPoolIdForInProgressOperation,
  } = StakingOperations.useContainer()

  const isCurrentWalletOperationAboutThisPool =
    stakingPoolIdForInProgressOperation === stakingPool.definition.id
  const isInProgress =
    isClaimingUnstakeInProgress && isCurrentWalletOperationAboutThisPool

  return (
    <div
      className={` ${stakingPool.definition.poolType != StakingPoolType.LIQUID ? "purple-border-bottom" : "aqua-border-bottom"}  flex gap-2.5 4k:gap-3 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-[20px] items-center cursor-pointer lg:justify-between`}
      onClick={() => {
        selectStakingPoolForView(stakingPool.definition.id)
        setViewClaim(true)
      }}
    >
      <div
        className={
          "flex lg:flex-col  content-center  max-lg:px-3 py-6 4k:py-7 lg:pl-9.5 4k:pl-12 rounded-lg justify-between max-lg:items-center lg:w-2/3 w-full"
        }
      >
        <div className="flex items-center gap-2 4k:gap-2.5">
          <Image
            className="rounded"
            src={stakingPool.definition.iconUrl}
            alt={`${stakingPool.definition.name} icon`}
            width={31}
            height={31}
          />
          <div className="semi24">{stakingPool.definition.name}</div>
          <div className="text-gray4 lg:hidden text-20">|</div>
          {stakingPool.definition.poolType != StakingPoolType.LIQUID && (
            <div className="bg-gray4 text-white3 py-1 4k:py-1.5 px-2 4k:px-2.5 items-center gap-2 4k:gap-2.5 medium12 flex ">
              <Image
                className="rounded"
                src={requests}
                alt="requests"
                width={14}
                height={15}
              />
              Withdrawals
            </div>
          )}
        </div>
        <div className="flex lg:mt-3 items-center">
          <div className="bold33">
            {stakingPool.data ? (
              <>{formatUnitsToHumanReadable(unstakeInfo.zilAmount, 18)} ZIL</>
            ) : (
              <>
                <div className=" loading-blur">00 ZIL </div>
              </>
            )}
          </div>
          {stakingPool.definition.tokenSymbol &&
            unstakeInfo.zilAmount &&
            stakingPool.definition.poolType === StakingPoolType.LIQUID && (
              <div
                className={`${stakingPool.definition.tokenSymbol && unstakeInfo.zilAmount ? "max-lg:ml-2.5" : "ml-0"} medium15  lg:ml-2.5 4k:ml-3 max-lg:order-1`}
              >
                {unstakeInfo.zilAmount}
                {stakingPool.definition.poolType === StakingPoolType.LIQUID &&
                  stakingPool.definition.tokenSymbol}
              </div>
            )}
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex max-lg:justify-center lg:w-1/3 lg:max-w-[250px] w-full pr-3 lg:pb-0 pb-6 lg:pr-9.5 4k:pr-12">
        <div className="max-lg:w-1/2">
          <Button
            className={` 
              ${stakingPool.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey 4k:py-6 lg:py-5 py-4`}
            disabled={!available}
            onClick={(e) => {
              e.stopPropagation()
              claimUnstake(unstakeInfo.address)
              setViewClaim(false)
            }}
            loading={isInProgress && available}
          >
            {available
              ? preparingClaimUnstakeTx && isCurrentWalletOperationAboutThisPool
                ? "Confirm in wallet"
                : isInProgress
                  ? "Processing"
                  : "Claim"
              : getHumanFormDuration(unstakeInfo.availableAt) + " left"}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RewardCardProps {
  stakingPool: StakingPool
  rewardInfo: UserNonLiquidStakingPoolRewardData
  selectStakingPoolForView: (stakingPoolId: string | null) => void
  claimReward: (delegatorAddress: string) => void
  stakeReward: (delegatorAddress: string) => void
  setViewClaim: Dispatch<SetStateAction<boolean>>
}

const RewardCard: React.FC<RewardCardProps> = ({
  rewardInfo,
  stakingPool,
  selectStakingPoolForView,
  claimReward,
  stakeReward,
  setViewClaim,
}) => {
  const {
    isStakingRewardInProgress,
    preparingStakeRewardTx,
    isClaimingRewardInProgress,
    preparingClaimRewardTx,
    stakingPoolIdForInProgressOperation,
  } = StakingOperations.useContainer()

  const isCurrentWalletOperationAboutThisPool =
    stakingPoolIdForInProgressOperation === stakingPool.definition.id

  const isClaimRewardInProgress =
    isClaimingRewardInProgress && isCurrentWalletOperationAboutThisPool
  const isStakeRewardInProgress =
    isStakingRewardInProgress && isCurrentWalletOperationAboutThisPool

  return (
    <div
      className={` ${stakingPool.definition.poolType != StakingPoolType.LIQUID ? "purple-border-bottom" : "aqua-border-bottom"}  flex gap-2.5 4k:gap-4 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-[20px] items-center cursor-pointer lg:justify-between`}
      onClick={() => {
        selectStakingPoolForView(stakingPool.definition.id)
        setViewClaim(true)
      }}
    >
      <div className="flex lg:flex-col  content-center max-lg:px-3 py-6 4k:py-7 lg:pl-9.5 4k:pl-12 rounded-lg justify-between max-lg:items-center lg:w-2/3 w-full">
        <div className="flex items-center gap-2 4k:gap-2.5">
          <Image
            className="rounded"
            src={stakingPool.definition.iconUrl}
            alt={`${stakingPool.definition.name} icon`}
            width={31}
            height={31}
          />
          <div className="semi24">{stakingPool.definition.name}</div>
          <div className="text-gray4 lg:hidden text-20">|</div>
          {stakingPool.definition.poolType != StakingPoolType.LIQUID && (
            <div className="bg-gray4 text-white3 py-1 4k:py-1.5 px-2 4k:px-2.5 items-center gap-2 4k:gap-2.5 medium12 flex ">
              <Image
                className="rounded"
                src={rewards}
                alt="rewards"
                width={14}
                height={15}
              />
              Rewards
            </div>
          )}
        </div>
        <div className="flex lg:mt-3  items-center ">
          <div className="bold33">
            {stakingPool.data ? (
              <>
                {formatUnitsToHumanReadable(rewardInfo.zilRewardAmount, 18)} ZIL
              </>
            ) : (
              <>
                <div className="loading-blur">00 ZIL</div>
              </>
            )}
          </div>
          {rewardInfo.zilRewardAmount &&
            stakingPool.definition.poolType === StakingPoolType.LIQUID && (
              <div
                className={`${rewardInfo.zilRewardAmount && "max-lg:ml-2.5"} medium15  lg:ml-2.5 4k:ml-3 max-lg:order-1`}
              >
                {rewardInfo.zilRewardAmount}
              </div>
            )}
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 w-full lg:max-w-[250px] lg:pb-0 pb-6 lg:pr-9.5 4k:pr-12">
        <div className="max-lg:w-1/2">
          {stakingPool.definition.minimumStake > rewardInfo.zilRewardAmount ? (
            <Tooltip
              placement="top"
              arrow={true}
              overlayClassName="custom-tooltip"
              title={`Reward is less than the minimal staking amount of ${formatUnitsToHumanReadable(
                stakingPool.definition.minimumStake,
                18
              )} ZIL`}
            >
              <Button
                className={`
                ${
                  isStakingRewardInProgress
                    ? stakingPool.definition.poolType === StakingPoolType.LIQUID
                      ? "liquid-loading"
                      : "non-liquid-loading"
                    : ""
                }
                ${stakingPool.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey 4k:py-6 lg:py-5 py-4`}
                onClick={(e) => {
                  e.stopPropagation()
                  stakeReward(rewardInfo.address)
                  setViewClaim(false)
                }}
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
                  isStakeRewardInProgress
                    ? stakingPool.definition.poolType === StakingPoolType.LIQUID
                      ? "liquid-loading"
                      : "non-liquid-loading"
                    : ""
                }
                ${stakingPool.definition.poolType === StakingPoolType.LIQUID ? " liquid-hover" : " non-liquid-hover"} btn-primary-grey 4k:py-6 lg:py-5 py-4`}
              onClick={(e) => {
                e.stopPropagation()
                stakeReward(rewardInfo.address)
                setViewClaim(false)
              }}
              loading={isStakeRewardInProgress}
            >
              {preparingStakeRewardTx
                ? "Confirm in wallet"
                : isStakeRewardInProgress
                  ? "Processing"
                  : "Stake Reward"}
            </Button>
          )}
        </div>
        <div className="max-lg:w-1/2 lg:mt-2.5">
          <Button
            className={`
               ${
                 isClaimRewardInProgress
                   ? stakingPool.definition.poolType === StakingPoolType.LIQUID
                     ? "liquid-loading"
                     : "non-liquid-loading"
                   : ""
               }
               ${stakingPool.definition.poolType === StakingPoolType.LIQUID ? "liquid-hover" : " non-liquid-hover"} 
               btn-primary-grey 4k:py-6 lg:py-5 py-4`}
            onClick={(e) => {
              e.stopPropagation()
              claimReward(rewardInfo.address)
              setViewClaim(false)
            }}
            loading={isClaimRewardInProgress}
          >
            {preparingClaimRewardTx
              ? "Confirm in wallet"
              : isClaimRewardInProgress
                ? "Processing"
                : "Claim Reward"}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface WithdrawZilViewProps {
  setViewClaim: Dispatch<SetStateAction<boolean>>
}

const WithdrawZilView: React.FC<WithdrawZilViewProps> = ({ setViewClaim }) => {
  const {
    availableForUnstaking,
    pendingUnstaking,
    selectStakingPoolForView,
    isUnstakingDataLoading,
    nonLiquidRewards,
  } = StakingPoolsStorage.useContainer()

  const { claimUnstake, claimReward, stakeReward } =
    StakingOperations.useContainer()

  const anyItemsAvailable =
    availableForUnstaking.length > 0 ||
    pendingUnstaking.length > 0 ||
    nonLiquidRewards.length > 0
  const [selectedPoolType, setSelectedPoolType] = useState("ALL")

  const filters = [
    {
      name: "All ",
      type: "ALL",
      activeGradient: "bg-aquaBlue",
    },
    {
      name: "Liquid",
      type: StakingPoolType.LIQUID,
      activeGradient: "bg-aqua6",
    },
    {
      name: "Non-liquid",
      type: StakingPoolType.NORMAL,
      activeGradient: "bg-purple4",
    },
  ]
  const filterByPoolType = (item: any) => {
    if (selectedPoolType === "ALL") {
      return true
    }
    return item.stakingPool.definition.poolType === selectedPoolType
  }

  return (
    <div className="relative flex flex-col gap-2 4k:gap-2.5 h-full max-lg:pb-16">
      <div className=" text-center p-4">
        {anyItemsAvailable ? (
          <>
            <h1 className="bold33 text-white">Your Claims</h1>
            <p className="mt-2 body2-v2 text-white4">
              Here is a list of your current <br /> and upcoming claims.
            </p>
          </>
        ) : (
          <h1 className="bold33 text-white">
            <span className="hidden lg:block lg:mt-20 4k:mt-56">
              Stake ZIL. <br /> Earn Rewards.
              <br /> Secure the Network.
            </span>
            <span className="block lg:hidden">Your Claims</span>
          </h1>
        )}
      </div>
      {anyItemsAvailable && (
        <div className="flex justify-center items-center gap-x-2.5 mt-3 4k:mt-6 mb-2.5 4k:mb-5 max-h-[5vh] mx-3 lg:mx-2 xl:mx-5 4k:mx-6">
          <div className="text-14 text-gray14">Filter by</div>
          {filters.map((filter, index) => (
            <FilterBtn
              key={index}
              variable={filter.name}
              isActive={selectedPoolType === filter.type}
              onClick={() => setSelectedPoolType(filter.type)}
              activeGradient={filter.activeGradient}
            />
          ))}
        </div>
      )}

      {anyItemsAvailable ? (
        <FastFadeScroll
          isPoolLiquid={StakingPoolType.LIQUID}
          className=" flex-1 overflow-y-scroll  pb-6 mb-16 lg:mb-0  4k:mr-14 lg:mr-10"
        >
          <div className="grid grid-cols-1 gap-4 lg:gap-5 4k:gap-6 lg:pb-10 ">
            {availableForUnstaking
              .filter(filterByPoolType)
              .map((unstakeClaim, claimIdx) => (
                <UnstakeCard
                  key={claimIdx}
                  available={true}
                  stakingPool={unstakeClaim.stakingPool}
                  unstakeInfo={unstakeClaim.unstakeInfo}
                  claimUnstake={claimUnstake}
                  selectStakingPoolForView={selectStakingPoolForView}
                  setViewClaim={setViewClaim}
                />
              ))}

            {nonLiquidRewards
              .filter(filterByPoolType)
              .map((reward, rewardIdx) => (
                <RewardCard
                  key={rewardIdx}
                  rewardInfo={reward.rewardInfo}
                  stakingPool={reward.stakingPool}
                  selectStakingPoolForView={selectStakingPoolForView}
                  claimReward={claimReward}
                  stakeReward={stakeReward}
                  setViewClaim={setViewClaim}
                />
              ))}

            {pendingUnstaking
              .filter(filterByPoolType)
              .map((pendingUnstakeClaim, claimIdx) => (
                <UnstakeCard
                  key={claimIdx + 1000}
                  available={false}
                  stakingPool={pendingUnstakeClaim.stakingPool}
                  unstakeInfo={pendingUnstakeClaim.unstakeInfo}
                  claimUnstake={claimUnstake}
                  selectStakingPoolForView={selectStakingPoolForView}
                  setViewClaim={setViewClaim}
                />
              ))}
          </div>
        </FastFadeScroll>
      ) : (
        !isUnstakingDataLoading && (
          <div className="text-center text-white mx-auto">
            <div className="mb-8 body2-v2 text-white4 ">
              Seems like you have nothing to claim yet. <br />
              Start staking and give us your thoughts !
            </div>
            <Button
              type="primary"
              className="btn-primary-teal-lg !w-fit px-11 4k:px-12 group mt-8"
              onClick={() => showNewMessage("")}
            >
              Leave Feedback
            </Button>
          </div>
        )
      )}
    </div>
  )
}

export default WithdrawZilView
