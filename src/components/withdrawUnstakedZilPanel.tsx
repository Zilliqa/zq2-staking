import { StakingPoolData, UserUnstakingPoolData } from "@/contexts/stakingPoolsStorage";
import { formattedTokenValueInZil, getHumanFormDuration } from "@/misc/formatting";
import { Button } from "antd";
import { DateTime } from "luxon";

interface WithdrawZilPanelProps {
  onClaimClick: () => void;
  stakingPoolData: StakingPoolData;
  userUnstakingPoolData?: Array<UserUnstakingPoolData>;
}

const WithdrawZilPanel: React.FC<WithdrawZilPanelProps> = ({
  onClaimClick,
  userUnstakingPoolData,
  stakingPoolData,
}) => {
  const pendingUnstake = userUnstakingPoolData?.filter(
    (claim) => claim.availableAt > DateTime.now()
  ).toSorted((claimA, claimB) => claimA.availableAt.diff(claimB.availableAt).milliseconds)

  const availableUnstake = userUnstakingPoolData?.filter(
    (claim) => claim.availableAt <= DateTime.now()
  ).toSorted((claimA, claimB) => claimA.availableAt.diff(claimB.availableAt).milliseconds)

  return (
    <div>
      {
        !!availableUnstake?.length ? (
          availableUnstake.map(
            (claim, claimIdx) => (
              <div className="rounded-lg gradient-bg-1 p-4" key={claimIdx}>
                <div className="flex justify-between items-center">
                  <div>
                    ~{formattedTokenValueInZil(claim.unstakedZil, stakingPoolData.zilToTokenRate)} ZIL
                  </div>
                  <Button
                    className='btn-primary-cyan text-2xl'
                    onClick={onClaimClick}
                  >
                    Claim
                  </Button>
                </div>
              </div>
            )
          )
        ) : !!pendingUnstake?.length ? (
          <div className="rounded-lg gradient-bg-1 p-4">
            <div className="text-2xl text-gray-500">
              Next available Claim
            </div>
            <div className="mt-2 flex justify-between">
              <div>
                {getHumanFormDuration(pendingUnstake[0].availableAt)}
              </div>
              <div>
                ~{formattedTokenValueInZil(pendingUnstake[0].unstakedZil, stakingPoolData.zilToTokenRate)} ZIL
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center my-32">
            No available Claims
          </div>
        )
      }

      {
        !!pendingUnstake?.length && (
          <div className="mt-4">
            <div className="font-bold text-gray-500">
              Pending requests
            </div>

            {
              pendingUnstake?.map((claim) => (
                <div className="flex justify-between my-2">
                  <div>
                    {claim.unstakedZil} {stakingPoolData.tokenSymbol} ~= {formattedTokenValueInZil(claim.unstakedZil, stakingPoolData.zilToTokenRate)} ZILs
                  </div>
                  <div>
                    {getHumanFormDuration(claim.availableAt)}
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}

export default WithdrawZilPanel;

