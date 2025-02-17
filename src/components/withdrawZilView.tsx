import { StakingOperations } from "@/contexts/stakingOperations"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import rewards from "../assets/svgs/rewards.svg"
import requests from "../assets/svgs/requests.svg"

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
    <div
      className="flex gap-2.5 4k:gap-3 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-[20px] items-center cursor-pointer justify-between"
      onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
    >
      <div className="flex lg:flex-col  content-center pl-3 py-6 4k:py-7 lg:pl-9.5 4k:pl-12 rounded-lg justify-between max-lg:items-center lg:w-2/3 w-full">
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
          <div className="bg-gray4 text-white3 py-1 4k:py-1.5 px-2 4k:px-2.5 items-center gap-2 4k:gap-2.5 medium12 lg:flex hidden">
            <Image
              className="rounded"
              src={requests}
              alt="requests"
              width={14}
              height={15}
            />
            Requests
          </div>
        </div>
        <div className="flex lg:mt-3 items-center">
          <div className="bold33">
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
          <div className="medium15 max-lg:mr-2.5 ml-2.5 4k:ml-3 max-lg:order-1">
            {unstakeInfo.zilAmount} {stakingPool.definition.tokenSymbol}
          </div>
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 lg:max-w-[218px] w-full px-3 lg:pb-0 pb-4 lg:px-4 4k:px-5">
        <div className="max-lg:w-1/2">
          <Button
            className="btn-primary-grey 4k:py-6 lg:py-5 py-4"
            disabled={!available}
            onClick={() => claim(unstakeInfo.address)}
          >
            {available
              ? "Claim"
              : getHumanFormDuration(unstakeInfo.availableAt) + " left"}
          </Button>
        </div>
        {/* <div className="max-lg:w-1/2 lg:mt-2.5">
            <Button
              className="btn-secondary-grey lg:py-5 py-4"
              onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
            >
              View
            </Button>
          </div> */}
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
}

const RewardCard: React.FC<RewardCardProps> = ({
  rewardInfo,
  stakingPool,
  selectStakingPoolForView,
  claimReward,
  stakeReward,
}) => {
  return (
    <div
      className="flex gap-2.5 4k:gap-4 lg:w-full max-lg:flex-col bg-aqua-gradient rounded-[20px] items-center cursor-pointer justify-between"
      onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
    >
      <div className="flex lg:flex-col  content-center pl-3 py-6 4k:py-7 lg:pl-9.5 4k:pl-12 rounded-lg justify-between max-lg:items-center lg:w-2/3 w-full">
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
          <div className="bg-gray4 text-white3 py-1 4k:py-1.5 px-2 4k:px-2.5 items-center gap-2 4k:gap-2.5 medium12 lg:flex hidden">
            <Image
              className="rounded"
              src={rewards}
              alt="rewards"
              width={14}
              height={15}
            />
            Rewards
          </div>
        </div>
        <div className="flex lg:mt-3 items-center">
          <div className="bold33">
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
          <div className="medium15 max-lg:mr-2.5 lg:ml-2.5 4k:ml-3 max-lg:order-1">
            {rewardInfo.zilRewardAmount}
          </div>
          <div className="bg-gray4 text-white3 py-1 4k:py-1.5 px-2 4k:px-2.5 flex items-center gap-2 4k:gap-2.5 medium12 lg:hidden ml-2.5 4k:ml-3">
            <Image
              className="rounded"
              src={rewards}
              alt="rewards"
              width={14}
              height={15}
            />
            Rewards
          </div>
        </div>
      </div>
      <div className="max-lg:gap-2.5 max-lg:flex lg:w-1/3 w-full lg:max-w-[218px] px-3 lg:pb-0 pb-4 lg:px-4 4k:px-5">
        <div className="max-lg:w-1/2">
          <Button
            className="btn-primary-grey 4k:py-6 lg:py-5 py-4"
            onClick={() => stakeReward(stakingPool.definition.address)}
          >
            Stake Reward
          </Button>
        </div>
        <div className="max-lg:w-1/2 lg:mt-2.5">
          {/* <Button
            className="btn-secondary-grey lg:py-5 py-4"
            onClick={() => selectStakingPoolForView(stakingPool.definition.id)}
          >
            View
          </Button> */}
          <Button
            className="btn-secondary-grey 4k:py-6 lg:py-5 py-4"
            onClick={() => claimReward(stakingPool.definition.address)}
          >
            Claim Reward
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

  const { claimUnstake, claimReward, stakeReward } =
    StakingOperations.useContainer()

  const anyItemsAvailable =
    availableForUnstaking.length > 0 ||
    pendingUnstaking.length > 0 ||
    nonLiquidRewards.length > 0

  return (
    <div
      className="relative overflow-y-auto max-h-[calc(90vh-15vh)]   
    scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1
     flex flex-col gap-2 4k:gap-2.5 4k:mt-52"
    >
      <div className=" text-center p-4">
        {anyItemsAvailable ? (
          <>
            <h1 className="bold52 text-white">My Claims</h1>
            <p className="mt-2 body2-v2 text-white4">
              Help us Empower and secure <br /> the Zilliqa Chain{" "}
            </p>
          </>
        ) : (
          <h1 className="bold52 text-white">
            <span className="hidden lg:block">Staking Portal</span>
            <span className="block lg:hidden">Claims</span>
          </h1>
        )}
      </div>

      {anyItemsAvailable ? (
        <div
          className="grid grid-cols-1 gap-4 lg:gap-5 4k:gap-6 overflow-y-auto max-h-[calc(90vh-30vh)]
          scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 lg:pb-10
           pr-2 lg:pr-4 4k:pl-5
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
              stakeReward={stakeReward}
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
        !isUnstakingDataLoading && (
          <div className="text-center text-white mx-auto lg:my-10">
            <div className="flex justify-center mb-9.5">
              <Image
                className="ml-3 4k:ml-4 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={FeedbackIcon}
                alt="arrow icon"
                width={56}
                height={56}
              />
              <Image
                className="ml-3 4k:ml-4 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={FeedbackIcon}
                alt="arrow icon"
                width={56}
                height={56}
              />
              <Image
                className="ml-3 4k:ml-4 h-[56px] w-[56px] transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={FeedbackIcon}
                alt="arrow icon"
                width={56}
                height={56}
              />
            </div>
            <div className="mb-15 body2-v2 text-white4">
              No claims? We’d love to hear
              <br /> your feedback !
            </div>
            <Button
              type="primary"
              className="btn-primary-gradient-aqua-lg !w-fit px-11 4k:px-12 group"
            >
              Leave Feedback
            </Button>
          </div>
        )
      )}
      {isUnstakingDataLoading && (
        <div className="animated-gradient h-[2em] mx-auto w-1/4"></div>
      )}
    </div>
  )
}

export default WithdrawZilView
