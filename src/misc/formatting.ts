import { DateTime } from "luxon";
import { formatUnits } from "viem";
import { getActiveChain } from "./chainConfig";

export function formatPercentage(value: number) {
  return `${parseFloat((value * 100).toFixed(2))}%`;
}

export function formatAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

export function getHumanFormDuration(availableAt: DateTime) {
  const units = availableAt.diff(DateTime.now()).shiftTo('days', 'hours', 'minutes').toHuman({
    unitDisplay: 'long',
    listStyle: 'narrow',
  })

  const mostSignificantUnit = units.split(',').reduce((acc, unit) => {
    if (acc !== '') {
      return acc
    }

    if (unit[0] !== '0') {
      return unit.trim()
    }

    return acc
  }, '')

  return `~${mostSignificantUnit}`
}

export function convertTokenToZil(tokenAmount: bigint, zilToTokenRate: number): bigint {
  const rate = BigInt(Math.round((1 / zilToTokenRate) * 100));
  const amount = (tokenAmount * rate) / 100n;
  return amount;
}

export function convertZilValueInToken(zilAmount: number, zilToTokenRate: number) {
  return `${(zilAmount * zilToTokenRate).toFixed(2)}`
}

export function formatUnitsToHumanReadable(value: bigint, decimals: number): string {
  const raw = parseFloat(formatUnits(value, decimals));

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  });

  return formatter.format(raw);
}

export function getTxExplorerUrl(txHash: string) {
  return `${getActiveChain().blockExplorers.default.url}/tx/${txHash}`;
}