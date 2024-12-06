import { createPublicClient, http } from "viem";
import { CHAIN_ZQ2_DOCKERCOMPOSE } from "./chainConfig";

export function getChainId() {
  const envChainId = process.env.NEXT_PUBLIC_ENV_CHAIN_ID;

  if (!envChainId) {
    throw new Error('NEXT_PUBLIC_ENV_CHAIN_ID is not defined');
  }

  const chainIdNumber = parseInt(envChainId);

  if (isNaN(chainIdNumber)) {
    throw new Error('NEXT_PUBLIC_ENV_CHAIN_ID is not a number');
  }

  return chainIdNumber;
}

export const viemClient = createPublicClient({
  chain: CHAIN_ZQ2_DOCKERCOMPOSE,
  transport: http(),
});