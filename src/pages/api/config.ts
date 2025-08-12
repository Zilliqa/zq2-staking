import { getViemClient } from "@/misc/chainConfig"
import type { NextApiRequest, NextApiResponse } from "next"

export type AppConfig = {
  chainId: number
  walletConnectPrivateKey: string
  appUrl: string
  gtmId: string
  averageBlockTime: number
}

function getStringFromEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not defined`)
  }

  return value
}

function getNumberFromEnv(name: string): number {
  const value = getStringFromEnv(name)
  const number = parseInt(value)

  if (isNaN(number)) {
    throw new Error(`${name} is not a number`)
  }

  return number
}

const config: AppConfig = {
  chainId: getNumberFromEnv("ZQ2_STAKING_CHAIN_ID"),
  walletConnectPrivateKey: getStringFromEnv(
    "ZQ2_STAKING_WALLET_CONNECT_API_KEY"
  ),
  appUrl: getStringFromEnv("ZQ2_STAKING_APP_URL"),
  gtmId: getStringFromEnv("ZQ2_STAKING_GTM_ID"),
  averageBlockTime: 1,
}

let cachedAverageBlockTime: number | null = null
let lastCacheTime: number | null = null
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppConfig>
) {
  const now = Date.now()
  if (
    lastCacheTime &&
    cachedAverageBlockTime &&
    now - lastCacheTime < CACHE_DURATION_MS
  ) {
    return res.status(200).json({
      ...config,
      averageBlockTime: cachedAverageBlockTime,
    })
  }

  const { getBlock } = getViemClient(config.chainId)
  const blocksSpanToAverage = 465230n // 1 week of blocks at ~1.3s per block

  try {
    const latestBlock = await getBlock()
    const { timestamp: latestBlockTimestamp, number: latestBlockNumber } =
      latestBlock

    const oldBlock = await getBlock({
      blockNumber: latestBlockNumber - blocksSpanToAverage,
    })
    const { timestamp: oldBlockTimestamp } = oldBlock

    const averageBlockTime =
      (Number(latestBlockTimestamp) - Number(oldBlockTimestamp)) /
      Number(blocksSpanToAverage)

    cachedAverageBlockTime = averageBlockTime
    lastCacheTime = now

    res.status(200).json({
      ...config,
      averageBlockTime,
    })
  } catch (error) {
    console.error("Failed to calculate average block time:", error)
    // Fallback to the default or last known value if an error occurs
    res.status(200).json({
      ...config,
      averageBlockTime: cachedAverageBlockTime ?? config.averageBlockTime,
    })
  }
}
