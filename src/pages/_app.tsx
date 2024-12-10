import "@/styles/globals.css";
import 'tailwindcss/tailwind.css';
import '@rainbow-me/rainbowkit/styles.css';
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage";
import type { AppProps } from "next/app";
import { WalletConnector } from "@/contexts/walletConnector";
import DummyWalletSelector from "@/components/dummyWalletSelector";
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { StakingOperations } from "@/contexts/stakingOperations";
import { getWagmiConfig } from "@/misc/chainConfig";
import { useEffect, useState } from "react";
import { AppConfig } from "./api/config";
import { AppConfigStorage } from "@/contexts/appConfigStorage";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setAppConfig)
      .catch(console.error);
  }, []);

  
  if (!appConfig) {
    return <div>Loading...</div> // APT-1605
  }

  return (
    <AppConfigStorage.Provider initialState={{ appConfig }}>
      <ConfigProvider>
        <WagmiProvider config={getWagmiConfig(appConfig.chainId, appConfig.walletConnectPrivateKey)}>
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
    </AppConfigStorage.Provider>
  );
}
