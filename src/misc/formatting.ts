import { DateTime } from "luxon";

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

export function formattedTokenValueInZil(tokenAmount: number, zilToTokenRate: number) {
  return `${(tokenAmount / zilToTokenRate).toFixed(2)}`
}

export function formattedZilValueInToken(zilAmount: number, zilToTokenRate: number) {
  return `${(zilAmount * zilToTokenRate).toFixed(2)}`
}