import type { NextApiRequest, NextApiResponse } from "next";

export type AppConfig = {
  chainId: number;
  walletConnectPrivateKey: string;
};

function getStringFromEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

function getNumberFromEnv(name: string): number {
  const value = getStringFromEnv(name);
  const number = parseInt(value);

  if (isNaN(number)) {
    throw new Error(`${name} is not a number`);
  }

  return number;
}

const config: AppConfig = {
  chainId: getNumberFromEnv("ZQ2_STAKING_CHAIN_ID"),
  walletConnectPrivateKey: getStringFromEnv("ZQ2_STAKING_WALLET_CONNECT_API_KEY"),

}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppConfig>,
) {
  res.status(200).json(config);
}
