import { StakingPoolData, UserStakingPoolData } from "@/contexts/stakingPoolsStorage";
import { formatPercentage } from "@/misc/formatting";
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button } from "antd";

interface StakingPoolDetailsViewProps {
  stakingPoolData: StakingPoolData;
  userStakingPoolData?: UserStakingPoolData;
  selectStakingPoolForStaking: (stakingPoolId: string) => void;
}

const StakingPoolDetailsView: React.FC<StakingPoolDetailsViewProps> = ({
  stakingPoolData,
  userStakingPoolData,
  selectStakingPoolForStaking,
}) => {


  const earnButton = (
    <Button
        type="default"
        size="large"
        className='text-xl md:text-3xl btn-primary-cyan'
        onClick={() => selectStakingPoolForStaking(stakingPoolData.id)}
      >
        EARN {formatPercentage(stakingPoolData.apy)} A YEAR <ArrowRightOutlined className='ml-2' />
      </Button>
  )

  return (
    <div className="relative bg-grey-400 p-8">
      <div className='flex justify-between'>
        <div className='text-3xl'>
          {stakingPoolData.name}
        </div>

        <div className="hidden md:block">
          {earnButton}
        </div>
      </div>

      <div className='text-lg'>
        Info
      </div>

      <div className='text-lg'>
        {stakingPoolData.description}
      </div>

      <div className="block md:hidden">
          {earnButton}
      </div>
    </div>
  )

}

export default StakingPoolDetailsView;