import "@/styles/globals.css";
import 'tailwindcss/tailwind.css';
import '@rainbow-me/rainbowkit/styles.css';
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import type { AppProps } from "next/app";
import { WalletConnector } from "@/contexts/walletConnector";
import DummyWalletSelector from "@/components/dummyWalletSelector";
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { StakingOperations } from "@/contexts/stakingOperations";
import { getChainsConfig } from "@/misc/chainConfig";


const customTheme: ThemeConfig = {
  token: {

  }
}

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <ConfigProvider theme={customTheme}>
      <WagmiProvider config={getChainsConfig()}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <WalletConnector.Provider>
              <StakingPoolsStorage.Provider>
                <StakingOperations.Provider>
                  <Component {...pageProps} />
                  <DummyWalletSelector />
                </StakingOperations.Provider>
              </StakingPoolsStorage.Provider>
            </WalletConnector.Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConfigProvider>
  );
}
