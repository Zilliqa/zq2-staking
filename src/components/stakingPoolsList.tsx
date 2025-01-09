import { StakingPoolsStorage } from '@/contexts/stakingPoolsStorage';
import StakingPoolCard from './stakingPoolCard';
import SortBtn from './sortBtn';
import { useState } from 'react';

const StakingPoolsList: React.FC = () => {
  const {
    combinedStakingPoolsData,
    selectStakingPoolForView,
    stakingPoolForView,
  } = StakingPoolsStorage.useContainer();

  const [sortCriteria, setSortCriteria] = useState< 'APR' | 'VP' | 'Commission' | null >(null);

  const [isAscending, setIsAscending] = useState(true);

  // Function to get the value to sort by based on the criteria
  const getSortValue = (data: any, criteria: string | null) => {
    if (!data) return 0;  

    switch (criteria) {
      case 'APR':
        return data.apr || 0;
      case 'VP':
        return (data.votingPower || 0) * 100; 
      case 'Commission':
        return (data.commission || 0) * 100; 
      default:
        return 0;
    }
  };

  // Sort the staking pools based on the selected criteria
  const sortedStakingPoolsData = [...combinedStakingPoolsData].sort(
    (a, b) => {
      const aValue = getSortValue(a.stakingPool.data, sortCriteria);
      const bValue = getSortValue(b.stakingPool.data, sortCriteria);
       return isAscending ? aValue - bValue : bValue - aValue;
    }
  );
 
  const handleSortClick = (criteria: 'APR' | 'VP' | 'Commission') => {
    if (sortCriteria === criteria) {
      setIsAscending(!isAscending);  
    } else {
      setSortCriteria(criteria);  
      setIsAscending(true);  
    }
  };

  return (
    <>
      <div className="h3 text-white2 sm:max-lg:w-1/4 mb-4 max-h-[10vh]">
        Liquid Validators
      </div>

      <div className="flex gap-x-2.5 mt-6 mb-5 max-h-[5vh]">
        <SortBtn
          variable="APR"
          isClicked={isAscending && sortCriteria == 'APR'}
          onClick={() => handleSortClick('APR')}
        />
        <SortBtn
          variable="VP"
          isClicked={isAscending && sortCriteria == 'VP'}
          onClick={() => handleSortClick('VP')}
        />
        <SortBtn
          variable="Commission"
          isClicked={isAscending && sortCriteria == 'Commission'}
          onClick={() => handleSortClick('Commission')}
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:gap-4 overflow-y-auto max-h-[calc(90vh-25vh)]
       scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray3 hover:scrollbar-thumb-gray2 pb-20 md:px-7 lg:px-2 xl:pl-5 xl:pr-10">
        {sortedStakingPoolsData.map(({ stakingPool, userData }) => (
          <StakingPoolCard
            key={stakingPool.definition.id}
            stakingPoolData={stakingPool}
            userStakingPoolData={userData}
            isStakingPoolSelected={
              stakingPoolForView?.stakingPool.definition.id ===
              stakingPool.definition.id
            }
            onClick={() =>
              selectStakingPoolForView(stakingPool.definition.id)
            }
          />
        ))}
      </div>
    </>
  );
};

export default StakingPoolsList;
