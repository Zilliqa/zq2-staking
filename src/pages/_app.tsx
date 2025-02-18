import "@/styles/globals.css"
import "tailwindcss/tailwind.css"
import "@rainbow-me/rainbowkit/styles.css"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import type { AppProps } from "next/app"
import { WalletConnector } from "@/contexts/walletConnector"
import DummyWalletSelector from "@/components/dummyWalletSelector"
import { ConfigProvider } from "antd"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { StakingOperations } from "@/contexts/stakingOperations"
import { getWagmiConfig } from "@/misc/chainConfig"
import { useEffect, useMemo, useState } from "react"
import { AppConfig } from "./api/config"
import { AppConfigStorage } from "@/contexts/appConfigStorage"
import Head from "next/head"

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [loadingPercentage, setLoadingPercentage] = useState(0)
  const [displayedPercentage, setDisplayedPercentage] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      const startTime = Date.now()
      let progress = 0

      const interval = setInterval(() => {
        progress += 10
        setLoadingPercentage(progress)
        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 50)

      try {
        const res = await fetch("/api/config")
        const data = await res.json()
        const elapsedTime = Date.now() - startTime

        const remainingTime = Math.max(1000 - elapsedTime, 0)
        setTimeout(() => {
          clearInterval(interval)
          setLoadingPercentage(100)
          setTimeout(() => {
            setAppConfig(data)
          }, 500)
          setFadeOut(true)
        }, remainingTime)
      } catch (error) {
        console.error("Error loading config:", error)
      }
    }

    fetchConfig()
  }, [])

  useEffect(() => {
    const duration = 500
    const frameRate = 16
    const totalFrames = duration / frameRate
    const increment = (loadingPercentage - displayedPercentage) / totalFrames

    if (increment !== 0) {
      let currentFrame = 0
      const easingInterval = setInterval(() => {
        setDisplayedPercentage((prev) => {
          currentFrame += 1
          const next = prev + increment
          if (
            currentFrame >= totalFrames ||
            (increment > 0 && next >= loadingPercentage) ||
            (increment < 0 && next <= loadingPercentage)
          ) {
            clearInterval(easingInterval)
            return loadingPercentage
          }
          return next
        })
      }, frameRate)

      return () => clearInterval(easingInterval)
    }
  }, [loadingPercentage])

  const wagmiConfig = useMemo(() => {
    if (!appConfig) {
      return null
    }

    return getWagmiConfig(appConfig.chainId, appConfig.walletConnectPrivateKey)
  }, [appConfig?.chainId, appConfig?.walletConnectPrivateKey])

  if (!appConfig) {
    return (
      <div
        className={`h-screen bg-black text-white transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="w-full h-10 overflow-hidden">
            <div
              className="h-full bg-colorful-gradient"
              style={{
                width: `${displayedPercentage}%`,
              }}
            ></div>
          </div>
          <div className="self-end text-80 lg:text-114 font-extrabold mr-7">
            {Math.round(displayedPercentage)}%
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppConfigStorage.Provider initialState={{ appConfig }}>
      <ConfigProvider>
        <WagmiProvider config={wagmiConfig!} reconnectOnMount={true}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider showRecentTransactions={true}>
              <WalletConnector.Provider>
                <StakingPoolsStorage.Provider>
                  <StakingOperations.Provider>
                    <Head>
                      <title>Zilliqa Staking</title>
                    </Head>
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
  )
}
