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

  const tabs = [
    {
      name: 'Liquid staking',
    },
    {
      name: 'Normal Staking ',
    }, 
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {/* <div className="h3 text-white1 sm:max-lg:w-1/4 mb-4 max-h-[10vh]">
        Liquid Validators
      </div> */}
<nav 
            aria-label="Tabs"
            className="border-b-[0.5px] border-b-gray2 w-full flex ">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`w-1/2 whitespace-nowrap border-b-[0.5px] py-3 
                    h3${
                    activeTab === index
                      ? '' :'-inactive' }  
                     ${
                    activeTab === index
                      ? 'border-aqua1'
                      : 'border-transparent'
                  }`}
                  onClick={() => {
                    setActiveTab(index) ;
                  }}
                >
                  {tab.name}
                </button>
              ))} 
          </nav>
          {activeTab === 0 && (
<>
      <div className="flex gap-x-2.5 mt-6 mb-5 max-h-[5vh] mx-3 lg:mx-2 xl:mx-5">
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
       scrollbar-thin scrollbar-thumb-gray1 scrollbar-track-gray1 hover:scrollbar-thumb-gray1 pb-20 pr-4">
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
      </div></>)}
    </>
  );
};

export default StakingPoolsList;
