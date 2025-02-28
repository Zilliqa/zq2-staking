import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import StakingPoolCard from "./stakingPoolCard"
import SortBtn from "./sortBtn"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import FastFadeScroll from "@/components/FastFadeScroll"
import { Tooltip } from "antd"

interface StakingPoolsListProps {
  setViewClaim: Dispatch<SetStateAction<boolean>>
  selectedPoolType: StakingPoolType
  setSelectedPoolType: Dispatch<SetStateAction<StakingPoolType>>
}

const StakingPoolsList: React.FC<StakingPoolsListProps> = ({
  setViewClaim,
  selectedPoolType,
  setSelectedPoolType,
}) => {
  const {
    combinedStakingPoolsData,
    selectStakingPoolForView,
    stakingPoolForView,
  } = StakingPoolsStorage.useContainer()

  const [sortCriteria, setSortCriteria] = useState<
    "APR" | "VP" | "Commission" | null
  >(null)
  const [isAscending, setIsAscending] = useState(true)

  // Function to get the value to sort by based on the criteria
  const getSortValue = (data: any, criteria: string | null) => {
    if (!data) return 0

    switch (criteria) {
      case "APR":
        return data.apr || 0
      case "VP":
        return (data.votingPower || 0) * 100
      case "Commission":
        return (data.commission || 0) * 100

      default:
        return 0
    }
  }

  const orderBySortCriteria = (a: any, b: any) => {
    const aValue = getSortValue(a.stakingPool.data, sortCriteria)
    const bValue = getSortValue(b.stakingPool.data, sortCriteria)
    return isAscending ? aValue - bValue : bValue - aValue
  }

  const sortedLiquidStakingPoolsData = useMemo(
    () =>
      combinedStakingPoolsData
        .filter(
          (pool) => pool.stakingPool.definition.poolType === selectedPoolType
        )
        .toSorted(orderBySortCriteria),
    [combinedStakingPoolsData, sortCriteria, isAscending, selectedPoolType]
  )

  const handleSortClick = (criteria: "APR" | "VP" | "Commission") => {
    if (sortCriteria === criteria) {
      setIsAscending(!isAscending)
    } else {
      setSortCriteria(criteria)
      setIsAscending(true)
    }
  }

  const tabs = [
    {
      name: "Liquid",
      type: StakingPoolType.LIQUID,
      tooltip:
        "Liquid Staking grants you Liquid Staking Tokens (LSTs) that represent your staked ZIL. Rewards are automatically reinvested.",
    },
    {
      name: "Non-Liquid ",
      type: StakingPoolType.NORMAL,
      tooltip:
        "Non-Liquid Staking lets you withdraw rewards or reinvest them automatically.",
    },
  ]

  return (
    <>
      <nav
        aria-label="Tabs"
        className="border-b-[0.5px] border-b-gray2 w-full flex "
      >
        {tabs.map((tab, index) => (
          <Tooltip
            placement="top"
            arrow={true}
            overlayClassName="custom-tooltip"
            className=" mr-1"
            title={tab.tooltip}
            key={index}
          >
            <button
              className={`w-1/2 whitespace-nowrap border-b-[0.5px] py-3 4k:py-4
              ${selectedPoolType === tab.type ? `bold33 ${tab.type === StakingPoolType.LIQUID ? "border-aqua1" : "border-purple4"}` : "bold26 text-gray8 border-transparent"}
            `}
              onClick={() => {
                setSelectedPoolType(tab.type)
                selectStakingPoolForView(null)
              }}
            >
              {tab.name}
            </button>
          </Tooltip>
        ))}
      </nav>

      <>
        <div className="flex gap-x-2.5 mt-3 4k:mt-6 mb-2.5 4k:mb-5 max-h-[5vh] mx-3 lg:mx-2 xl:mx-5 4k:mx-6">
          <SortBtn
            liquidType={selectedPoolType === StakingPoolType.LIQUID}
            variable="APR"
            isClicked={isAscending && sortCriteria == "APR"}
            onClick={() => handleSortClick("APR")}
            tooltip="Annual Percentage Rate - Projected yearly rewards as a percentage of staked amount."
          />
          <SortBtn
            liquidType={selectedPoolType === StakingPoolType.LIQUID}
            variable="VP"
            isClicked={isAscending && sortCriteria == "VP"}
            onClick={() => handleSortClick("VP")}
            tooltip="Voting Power - Share of total staked ZIL controlled by the validator."
          />
          <SortBtn
            liquidType={selectedPoolType === StakingPoolType.LIQUID}
            variable="Commission"
            isClicked={isAscending && sortCriteria == "Commission"}
            onClick={() => handleSortClick("Commission")}
            tooltip="Percentage of your staking rewards paid to the validator."
          />
        </div>

        <FastFadeScroll
          isPoolLiquid={stakingPoolForView?.stakingPool.definition.poolType}
          className="flex-1 pb-8 lg:pb-4 mb-16 md:mb-0 overflow-y-scroll"
        >
          <div className="grid grid-cols-1 gap-2.5 lg:gap-4 4k:gap-5">
            {sortedLiquidStakingPoolsData.map(({ stakingPool, userData }) => (
              <StakingPoolCard
                key={stakingPool.definition.id}
                stakingPoolData={stakingPool}
                userStakingPoolData={userData}
                isStakingPoolSelected={
                  stakingPoolForView?.stakingPool.definition.id ===
                  stakingPool.definition.id
                }
                onClick={() => {
                  selectStakingPoolForView(stakingPool.definition.id)
                  setViewClaim(false)
                }}
              />
            ))}
          </div>
        </FastFadeScroll>
      </>
    </>
  )
}

export default StakingPoolsList
