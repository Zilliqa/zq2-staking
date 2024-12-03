import { formattedTokenValueInZil, getHumanFormDuration } from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import { UserUnstakingPoolData } from "@/misc/walletsConfig";
import { Button } from "antd";
import { DateTime } from "luxon";

interface WithdrawZilPanelProps {
  onClaimClick: () => void;
  stakingPoolData: StakingPool;
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
                  {
                    stakingPoolData.data ? <div>
                      ~{formattedTokenValueInZil(claim.unstakedZil, stakingPoolData.data.zilToTokenRate)} ZIL
                    </div> : <div className="w-[4em] h-[1em] animated-gradient" />
                  }
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
              {
                stakingPoolData.data ? <div>
                  ~{formattedTokenValueInZil(pendingUnstake[0].unstakedZil, stakingPoolData.data.zilToTokenRate)} ZIL
                </div> : <div className="w-[4em] h-[1em] animated-gradient" />
              }
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
              pendingUnstake?.map((claim, claimIdx) => (
                <div className="flex justify-between my-2" key={claimIdx}>

                  {
                    stakingPoolData.data ? <div>
                      {claim.unstakedZil} {stakingPoolData.definition.tokenSymbol} ~= {formattedTokenValueInZil(claim.unstakedZil, stakingPoolData.data.zilToTokenRate)} ZILs
                    </div> : <div className="w-[4em] h-[1em] animated-gradient" />
                  }
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

