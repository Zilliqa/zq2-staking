import "@/styles/globals.css";
import 'tailwindcss/tailwind.css';
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import type { AppProps } from "next/app";
import { WalletConnector } from "@/contexts/walletConnector";
import DummyWalletSelector from "@/components/dummyWalletSelector";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletConnector.Provider>
      <StakingPoolsStorage.Provider>
        <Component {...pageProps} />
        <DummyWalletSelector />
      </StakingPoolsStorage.Provider>
    </WalletConnector.Provider>
  );
}
