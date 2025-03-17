import { DateTime } from "luxon"
import { formatUnits } from "viem"
import { getChain } from "./chainConfig"

export function formatPercentage(value: number) {
  return `${parseFloat((value * 100).toFixed(2))}%`
}

export function formatAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`
}

export function getHumanFormDuration(availableAt: DateTime) {
  const units = availableAt
    .diff(DateTime.now())
    .shiftTo("days", "hours", "minutes")
    .toHuman({
      unitDisplay: "long",
      listStyle: "narrow",
      maximumFractionDigits: 0,
    })

  const mostSignificantUnit = units
    .split(",")
    .map((units) => units.trim())
    .reduce((acc, unit) => {
      if (acc !== "") {
        return acc
      }

      // check if unit starts with smh different that 0
      // e.g., 0 days 2 hours 5 minutes should return "2 hours"
      if (unit[0] !== "0") {
        return unit
      }

      return acc
    }, "")

  if (mostSignificantUnit === "") {
    return "< 1 minute"
  } else {
    return `~${mostSignificantUnit}`
  }
}

export function convertTokenToZil(
  tokenAmount: bigint,
  zilToTokenRate: number
): bigint {
  const rate = BigInt(Math.round((1 / zilToTokenRate) * 10000000))
  const amount = (tokenAmount * rate) / 10000000n
  return amount
}

export function convertZilValueInToken(
  zilAmount: number,
  zilToTokenRate: number
) {
  return `${(zilAmount * zilToTokenRate).toFixed(2)}`
}

/**
 * returns @param value formatted to a string that is using the most appropriate unit
 * e.g., 1,000,000 ZIL will be formatted as 1M ZIL
 *
 * @note this function is useful for displaying large values
 */
export function formatUnitsToHumanReadable(
  value: bigint,
  decimals: number
): string {
  const raw = parseFloat(formatUnits(value, decimals))

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  })

  return formatter.format(raw)
}

/**
 * returns @param value formatted to a string with a maximum precision of @param maxPrecision
 * trailing zeros are removed
 *
 * @note this function is useful for displaying small values
 */
export function formatUnitsWithMaxPrecision(
  value: bigint,
  decimals: number,
  maxPrecision: number
): string {
  const raw = parseFloat(formatUnits(value, decimals))

  const formatted = raw.toFixed(maxPrecision).replace(/\.?0+$/, "")
  return formatted
}

export function getTxExplorerUrl(txHash: string, chainId: number) {
  return `${getChain(chainId).blockExplorers.default.url}/tx/${txHash}`
}
