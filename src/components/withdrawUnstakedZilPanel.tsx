import { StakingOperations } from "@/contexts/stakingOperations";
import { convertTokenToZil, getHumanFormDuration } from "@/misc/formatting";
import { StakingPool } from "@/misc/stakingPoolsConfig";
import { UserUnstakingPoolData } from "@/misc/walletsConfig";
import { Button } from "antd";
import { DateTime } from "luxon";

interface WithdrawZilPanelProps {
  stakingPoolData: StakingPool;
  userUnstakingPoolData?: Array<UserUnstakingPoolData>;
}

const WithdrawZilPanel: React.FC<WithdrawZilPanelProps> = ({
  userUnstakingPoolData,
  stakingPoolData,
}) => {
  const {
    claim
  } = StakingOperations.useContainer();

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
            (item, claimIdx) => (
              <div className="rounded-lg gradient-bg-1 p-4" key={claimIdx}>
                <div className="flex justify-between items-center">
                  {
                    stakingPoolData.data ? <div>
                      ~{convertTokenToZil(item.unstakingTokenAmount, stakingPoolData.data.zilToTokenRate)} ZIL
                    </div> : <div className="w-[4em] h-[1em] animated-gradient" />
                  }
                  <Button
                    className='btn-primary-cyan text-2xl'
                    onClick={() => claim(item.unstakingTokenAmount)}
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
                  ~{convertTokenToZil(pendingUnstake[0].unstakingTokenAmount, stakingPoolData.data.zilToTokenRate)} ZIL
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
                      {claim.unstakingTokenAmount} {stakingPoolData.definition.tokenSymbol} ~= {convertTokenToZil(claim.unstakingTokenAmount, stakingPoolData.data.zilToTokenRate)} ZILs
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

