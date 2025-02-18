import { useState, useEffect, ReactNode } from "react"

interface FastFadeScrollProps {
  children: ReactNode
  fadeDuration?: number
  className?: string
}

const FastFadeScroll = ({
  children,
  fadeDuration = 1000,
  className = "",
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

  return (
    <div
      onScroll={handleScroll}
      className={`${className} ${isScrolling ? "scrollbar-visible" : "scrollbar-hidden"} scrollbar-gradient`}
    >
      {children}
    </div>
  )
}

export default FastFadeScroll
