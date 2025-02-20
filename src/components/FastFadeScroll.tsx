import { StakingPoolType } from "@/misc/stakingPoolsConfig"
import { useState, useEffect, ReactNode } from "react"

interface FastFadeScrollProps {
  children: ReactNode
  fadeDuration?: number
  className?: string
  isPoolLiquid?: StakingPoolType 
}

const FastFadeScroll = ({
  children,
  fadeDuration = 1000,
  className = "",
  isPoolLiquid 
}: FastFadeScrollProps) => {
  const [isScrolling, setIsScrolling] = useState(false)
  let scrollTimeout: any

  const handleScroll = () => {
    setIsScrolling(true)
    clearTimeout(scrollTimeout)

    scrollTimeout = setTimeout(() => {
      setIsScrolling(false)
    }, fadeDuration)
  }

  useEffect(() => {
    return () => clearTimeout(scrollTimeout)
  }, [])

  const isPoolLiquidBool = () =>
    isPoolLiquid ===
    StakingPoolType.LIQUID
  console.log(isPoolLiquid)

  return (
    <div
      onScroll={handleScroll}
      className={`${className} ${isScrolling ? "scrollbar-visible" : "scrollbar-hidden"}
        ${isPoolLiquidBool() ? "scrollbar-aqua":"scrollbar-purple"}`}
    >
      {children}
    </div>
  )
}

export default FastFadeScroll
