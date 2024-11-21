export function formatPercentage(value: number) {
  return `${parseFloat((value * 100).toFixed(2))}%`;
}

export function formatAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}