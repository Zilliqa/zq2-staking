import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { Input, Button, Card, Spin, Alert } from "antd"
import { EyeOutlined, SearchOutlined } from "@ant-design/icons"
import ArrowBackAqua from "../assets/svgs/arrow-back-aqua.svg"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import {
  getWalletStakingData,
  getWalletUnstakingData,
  getWalletNonLiquidStakingPoolRewardData,
  UserStakingPoolData,
  UserUnstakingPoolData,
  UserNonLiquidStakingPoolRewardData,
} from "@/misc/walletsConfig"
import { stakingPoolsConfigForChainId } from "@/misc/stakingPoolsConfig"
import { formatZil } from "@/misc/formatting"
import { DateTime } from "luxon"

interface WatchData {
  address: string
  stakingData: UserStakingPoolData[]
  unstakingData: UserUnstakingPoolData[]
  rewardsData: UserNonLiquidStakingPoolRewardData[]
}

const WatchPage = () => {
  const router = useRouter()
  const { appConfig } = AppConfigStorage.useContainer()
  const [inputAddress, setInputAddress] = useState("")
  const [watchData, setWatchData] = useState<WatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if address is provided in URL
  useEffect(() => {
    const addressFromQuery = router.query.address as string
    if (addressFromQuery) {
      setInputAddress(addressFromQuery)
      handleAddressSearch(addressFromQuery)
    }
  }, [router.query.address])

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleAddressSearch = async (address?: string) => {
    const searchAddress = address || inputAddress

    if (!searchAddress) {
      setError("Please enter a ZIL address")
      return
    }

    if (!isValidAddress(searchAddress)) {
      setError("Please enter a valid ZIL address (0x...)")
      return
    }

    setLoading(true)
    setError("")

    try {
      const [stakingData, unstakingData, rewardsData] = await Promise.all([
        getWalletStakingData(searchAddress, appConfig.chainId),
        getWalletUnstakingData(searchAddress, appConfig.chainId),
        getWalletNonLiquidStakingPoolRewardData(
          searchAddress,
          appConfig.chainId
        ),
      ])

      setWatchData({
        address: searchAddress,
        stakingData,
        unstakingData,
        rewardsData,
      })

      // Update URL with address
      if (!router.query.address) {
        router.push(
          { pathname: "/watch", query: { address: searchAddress } },
          undefined,
          { shallow: true }
        )
      }
    } catch (err) {
      console.error("Error fetching address data:", err)
      setError("Failed to fetch address data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPoolName = (address: string) => {
    const pool = stakingPoolsConfigForChainId[appConfig.chainId]?.find(
      (pool) => pool.definition.address === address
    )
    return pool?.definition.name || "Unknown Pool"
  }

  const getTotalDeposits = () => {
    if (!watchData) return 0n
    return watchData.stakingData.reduce(
      (total, stake) => total + stake.stakingTokenAmount,
      0n
    )
  }

  const getTotalUnclaimedRewards = () => {
    if (!watchData) return 0n
    return watchData.rewardsData.reduce(
      (total, reward) => total + reward.zilRewardAmount,
      0n
    )
  }

  const getPendingWithdrawals = () => {
    if (!watchData) return { available: 0n, pending: 0n }
    const now = DateTime.now()
    let available = 0n
    let pending = 0n

    watchData.unstakingData.forEach((unstake) => {
      if (unstake.availableAt <= now) {
        available += unstake.zilAmount
      } else {
        pending += unstake.zilAmount
      }
    })

    return { available, pending }
  }

  const renderStakingDetails = () => {
    if (!watchData) return null

    const totalDeposits = getTotalDeposits()
    const totalRewards = getTotalUnclaimedRewards()
    const { available: availableWithdrawals, pending: pendingWithdrawals } =
      getPendingWithdrawals()

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-grad border-gray3">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-tealPrimary">
                {formatZil(totalDeposits)}
              </div>
              <div className="text-gray1 text-sm">Total Deposits</div>
            </div>
          </Card>

          <Card className="bg-gray-grad border-gray3">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-green-400">
                {formatZil(totalRewards)}
              </div>
              <div className="text-gray1 text-sm">Unclaimed Rewards</div>
            </div>
          </Card>

          <Card className="bg-gray-grad border-gray3">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">
                {formatZil(availableWithdrawals)}
              </div>
              <div className="text-gray1 text-sm">Available Withdrawals</div>
            </div>
          </Card>

          <Card className="bg-gray-grad border-gray3">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-orange-400">
                {formatZil(pendingWithdrawals)}
              </div>
              <div className="text-gray1 text-sm">Pending Withdrawals</div>
            </div>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active Stakes */}
          <Card className="bg-gray-grad border-gray3">
            <div className="text-lg font-semibold mb-4 text-white">
              Active Stakes
            </div>
            {watchData.stakingData.length > 0 ? (
              <div className="space-y-3">
                {watchData.stakingData
                  .filter((stake) => stake.stakingTokenAmount > 0n)
                  .map((stake, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-800 rounded gap-2 sm:gap-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {getPoolName(stake.address)}
                        </div>
                        <div className="text-xs text-gray1 break-all">
                          {stake.address}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-bold text-tealPrimary">
                          {formatZil(stake.stakingTokenAmount)} ZIL
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray1 py-8">
                No active stakes found
              </div>
            )}
          </Card>

          {/* Rewards */}
          <Card className="bg-gray-grad border-gray3">
            <div className="text-lg font-semibold mb-4 text-white">
              Unclaimed Rewards
            </div>
            {watchData.rewardsData.length > 0 ? (
              <div className="space-y-3">
                {watchData.rewardsData.map((reward, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-800 rounded gap-2 sm:gap-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {getPoolName(reward.address)}
                      </div>
                      <div className="text-xs text-gray1 break-all">
                        {reward.address}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-green-400">
                        {formatZil(reward.zilRewardAmount)} ZIL
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray1 py-8">
                No unclaimed rewards
              </div>
            )}
          </Card>
        </div>

        {/* Withdrawals */}
        {watchData.unstakingData.length > 0 && (
          <Card className="bg-gray-grad border-gray3">
            <div className="text-lg font-semibold mb-4 text-white">
              Withdrawal Status
            </div>
            <div className="space-y-3">
              {watchData.unstakingData.map((unstake, index) => {
                const isAvailable = unstake.availableAt <= DateTime.now()
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-800 rounded gap-2 sm:gap-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {getPoolName(unstake.address)}
                      </div>
                      <div className="text-xs text-gray1 break-all">
                        {unstake.address}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div
                        className={`font-bold ${isAvailable ? "text-green-400" : "text-orange-400"}`}
                      >
                        {formatZil(unstake.zilAmount)} ZIL
                      </div>
                      <div className="text-xs text-gray1">
                        {isAvailable
                          ? "Available now"
                          : `Available ${unstake.availableAt.toRelative()}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center text-white border-b-[0.5px] border-gray3 sticky top-0 z-10">
        <div className="flex max-w-screen-2xl w-full justify-between px-4 lg:px-8 xl:px-12 4k:px-16 4k:max-w-screen-4k items-center py-4 lg:py-5">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              onClick={() => router.push("/")}
              className="text-white hover:text-tealPrimary flex items-center gap-2"
            >
              <Image src={ArrowBackAqua} alt="back" width={8} height={4.5} />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <EyeOutlined className="text-tealPrimary text-xl" />
              <h1 className="text-xl font-bold">Watch Address</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl max-h-screen mx-auto px-4 lg:px-8 xl:px-12 4k:px-16 py-8 pb-[8em] md:pb-[1em] overflow-y-scroll">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-grad p-4 md:p-6 rounded-2xl border border-gray3">
            <h2 className="text-base md:text-lg font-semibold mb-4 text-center">
              Monitor Staking Activity for Any ZIL Address
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter ZIL address (0x...)"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                onPressEnter={() => handleAddressSearch()}
                className="flex-1"
                size="large"
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={() => handleAddressSearch()}
                loading={loading}
                className="btn-primary-teal w-full sm:w-auto"
              >
                Search
              </Button>
            </div>
            {error && (
              <Alert message={error} type="error" className="mt-3" showIcon />
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-4 text-gray1">Loading staking data...</div>
          </div>
        )}

        {/* Results */}
        {watchData && !loading && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray1">
                Staking Overview for
              </h3>
              <div className="text-xs md:text-sm font-mono bg-gray-grad px-3 py-1 rounded inline-block mt-1 break-all max-w-full">
                {watchData.address}
              </div>
            </div>
            {renderStakingDetails()}
          </div>
        )}

        {/* Empty State */}
        {!watchData && !loading && (
          <div className="text-center py-12">
            <EyeOutlined className="text-6xl text-gray3 mb-4" />
            <h3 className="text-xl font-semibold text-gray1 mb-2">
              Track Any ZIL Address
            </h3>
            <p className="text-gray1 max-w-md mx-auto">
              Enter any Zilliqa address above to view their staking details,
              including deposits, rewards, and withdrawal status.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchPage
