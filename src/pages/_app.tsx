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
import { chainsConfig } from "@/misc/chainConfig";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";



const customTheme: ThemeConfig = {
  token: {

  }
}

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <ConfigProvider theme={customTheme}>
      <WagmiProvider config={chainsConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <WalletConnector.Provider>
              <StakingPoolsStorage.Provider>
                <Component {...pageProps} />
                <DummyWalletSelector />
              </StakingPoolsStorage.Provider>
            </WalletConnector.Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConfigProvider>
  );
}
