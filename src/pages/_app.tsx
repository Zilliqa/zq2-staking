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
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setAppConfig)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        const reader = res.body?.getReader();
        const contentLength = res.headers.get("Content-Length");
  
        if (reader && contentLength) {
          const totalLength = parseInt(contentLength, 10);
          let loaded = 0;
            while (true) {
            const { done, value } = await reader.read();
            if (done) break;
  
            loaded += value?.length || 0;
            const progress = Math.round((loaded / totalLength) * 100);
            setLoadingPercentage(progress);
          }
        }
  
        const data = await res.json();
        setAppConfig(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchConfig();
  }, []);


 if (!appConfig) {
    return( 
    <div className="h-screen bg-black text-white1 ">
      <div className="h-full flex flex-col justify-between">
    <div className="w-full h-10 overflow-hidden">
      <div
        className="h-full bg-colorful-gradient"
        style={{ width: `${loadingPercentage}%` }}
      ></div>
    </div>
    <div className="self-end text-80 lg:text-114 font-int-extrabold mr-7">{loadingPercentage}%</div>
  </div></div>
  ) 
}

  return (
    <AppConfigStorage.Provider initialState={{ appConfig }}>
      <ConfigProvider>
        <WagmiProvider config={getWagmiConfig(appConfig.chainId, appConfig.walletConnectPrivateKey)}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider showRecentTransactions={true}>
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
