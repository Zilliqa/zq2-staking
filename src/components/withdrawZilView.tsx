import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"

import {
  convertTokenToZil,
  formatUnitsToHumanReadable,
  getHumanFormDuration,
} from "@/misc/formatting"
import FeedbackIcon from "../assets/svgs/feedback-icon.svg"
import { StakingPool } from "@/misc/stakingPoolsConfig"
import {
  UserNonLiquidStakingPoolRewardData,
  UserUnstakingPoolData,
} from "@/misc/walletsConfig"
import { Button } from "antd"
import Image from "next/image"

interface UnstakeCardProps {
  available: boolean
  unstakeInfo: UserUnstakingPoolData
  stakingPool: StakingPool
  selectStakingPoolForView: (stakingPoolId: string | null) => void
  claimUnstake: (delegatorAddress: string) => void
}

const UnstakeCard: React.FC<UnstakeCardProps> = ({
  available,
  unstakeInfo,
  stakingPool,
  selectStakingPoolForView,
  claimUnstake: claim,
}) => {
  return (
    <div className="flex gap-2.5 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-xl items-center">
      <div className="flex lg:flex-col  content-center px-3 py-4 lg:px-4 rounded-lg justify-between max-lg:items-center lg:w-2/3">
        <div className="flex items-center">
          <Image
            className="mr-2 lg:mr-2.5"
            src={stakingPool.definition.iconUrl}
            alt={`${stakingPool.definition.name} icon`}
            width={31}
            height={31}
          />
          <div className="body1">{stakingPool.definition.name}</div>
        </div>
        <div className="flex lg:mt-3 items-center">
          <div className="h3-s max-lg:order-2">
            {stakingPool.data ? (
              <>
                {formatUnitsToHumanReadable(
                  convertTokenToZil(
                    unstakeInfo.zilAmount,
                    stakingPool.data!.zilToTokenRate
                  ),
                  18
                )}{" "}
                ZIL
              </>
            ) : (
              <>
                <div className="w-[2em] h-[0.75em] animated-gradient" />
              </>
            )}
          </div>
          <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">
            {unstakeInfo.zilAmount} {stakingPool.definition.tokenSymbol}
          </div>
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
        <div className="max-lg:w-1/2">
          <Button
            className="btn-secondary-gray2"
            disabled={!available}
            onClick={() => claim(unstakeInfo.address)}
          >
            {available
              ? "Claim"
              : getHumanFormDuration(unstakeInfo.availableAt) + " left"}
          </Button>
        </div>
        <div className="max-lg:w-1/2 lg:mt-2.5">
          <Button
            className="btn-secondary-gray3"
            onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
          >
            View
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
}

const RewardCard: React.FC<RewardCardProps> = ({
  rewardInfo,
  stakingPool,
  selectStakingPoolForView,
  claimReward,
}) => {
  return (
    <div className="flex gap-2.5 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-xl items-center">
      <div className="flex lg:flex-col  content-center px-3 py-4 lg:px-4 rounded-lg justify-between max-lg:items-center lg:w-2/3">
        <div className="flex items-center">
          <Image
            className="mr-2 lg:mr-2.5"
            src={stakingPool.definition.iconUrl}
            alt={`${stakingPool.definition.name} icon`}
            width={31}
            height={31}
          />
          <div className="body1">{stakingPool.definition.name}</div>
          <div>Reward</div>
        </div>
        <div className="flex lg:mt-3 items-center">
          <div className="h3-s max-lg:order-2">
            {stakingPool.data ? (
              <>
                {formatUnitsToHumanReadable(rewardInfo.zilRewardAmount, 18)} ZIL
              </>
            ) : (
              <>
                <div className="w-[2em] h-[0.75em] animated-gradient" />
              </>
            )}
          </div>
          <div className="body1-s max-lg:mr-2.5 lg:ml-2.5 max-lg:order-1">
            {rewardInfo.zilRewardAmount}
          </div>
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px]">
        <div className="max-lg:w-1/2">
          <Button
            className="btn-secondary-gray2"
            onClick={() => claimReward(stakingPool.definition.address)}
          >
            Claim Reward
          </Button>
        </div>
        <div className="max-lg:w-1/2 lg:mt-2.5">
          <Button
            className="btn-secondary-gray3"
            onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  )
}

const WithdrawZilView: React.FC = () => {
  const {
    availableForUnstaking,
    pendingUnstaking,
    selectStakingPoolForView,
    isUnstakingDataLoading,
    nonLiquidRewards,
  } = StakingPoolsStorage.useContainer()

  const { claimUnstake, claimReward } = StakingOperations.useContainer()

  const anyItemsAvailable =
    availableForUnstaking.length > 0 ||
    pendingUnstaking.length > 0 ||
    nonLiquidRewards.length > 0

  return (
    <div
      className="relative overflow-y-auto max-h-[calc(90vh-15vh)]   
    scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1
     flex flex-col gap-2"
    >
      <div className=" text-center max-h-[20vh]">
        <h1 className="h1 text-white mt-4">
          <span className="hidden lg:block">Staking Portal</span>
          <span className="block lg:hidden">Claims</span>
        </h1>
      </div>

      {anyItemsAvailable ? (
        <div
          className="grid grid-cols-1 gap-4 lg:gap-5 overflow-y-auto  max-h-[calc(90vh-30vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 lg:pb-10
           pr-2 lg:pr-4
          "
        >
          {availableForUnstaking.map((unstakeClaim, claimIdx) => (
            <UnstakeCard
              key={claimIdx}
              available={true}
              stakingPool={unstakeClaim.stakingPool}
              unstakeInfo={unstakeClaim.unstakeInfo}
              claimUnstake={claimUnstake}
              selectStakingPoolForView={selectStakingPoolForView}
            />
          ))}

          {nonLiquidRewards.map((reward, rewardIdx) => (
            <RewardCard
              key={rewardIdx}
              rewardInfo={reward.rewardInfo}
              stakingPool={reward.stakingPool}
              selectStakingPoolForView={selectStakingPoolForView}
              claimReward={claimReward}
            />
          ))}

          {pendingUnstaking.map((pendingUnstakeClaim, claimIdx) => (
            <UnstakeCard
              key={claimIdx + 1000}
              available={false}
              stakingPool={pendingUnstakeClaim.stakingPool}
              unstakeInfo={pendingUnstakeClaim.unstakeInfo}
              claimUnstake={claimUnstake}
              selectStakingPoolForView={selectStakingPoolForView}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-white mx-auto lg:my-10">
          {isUnstakingDataLoading ? (
            <div className="animated-gradient h-[2em] w-full"></div>
          ) : (
            <>
              <div className="flex justify-center mb-9.5">
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
                <Image
                  className="ml-3 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                  src={FeedbackIcon}
                  alt="arrow icon"
                  width={56}
                  height={56}
                />
              </div>
              <div className="bold26 mb-15 font-medium">
                No claims? We’d love to hear
                <br /> your feedback !
              </div>
            </>
          )}
          <Button
            type="primary"
            className="btn-primary-gradient-aqua-lg !w-fit px-11 group"
          >
            Leave Feedback
          </Button>
        </div>
      )}
    </div>
  )
}

export default WithdrawZilView
