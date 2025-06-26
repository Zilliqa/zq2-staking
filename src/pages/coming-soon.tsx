import Head from "next/head"
import { useEffect, useState } from "react"
import { DateTime } from "luxon"
import Image from "next/image"
import logoUrl from "../assets/svgs/logo.svg"
import { Button } from "antd"

// Set your launch date here
const LAUNCH_DATE = DateTime.fromISO("2025-06-30T13:00:00Z")

function getTimeLeft() {
  const now = DateTime.now()
  let diff = LAUNCH_DATE.diff(now, ["days", "hours"]).toObject()
  // Clamp to zero if past
  if (LAUNCH_DATE < now) diff = { days: 0, hours: 0 }
  return {
    days: Math.max(0, Math.floor(diff.days || 0)),
    hours: Math.max(0, Math.floor(diff.hours || 0)),
  }
}

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Head>
        <title>Coming Soon | Zilliqa Staking</title>
        <meta name="description" content="Zilliqa Staking is launching soon!" />
      </Head>
      <div className="min-h-screen flex flex-col justify-between text-white px-4 relative overflow-hidden">
        {/* Logo at the top */}
        <div className="w-full flex justify-center pt-8 pb-4">
          <Image
            src={logoUrl}
            alt="Logo"
            width={192}
            height={64}
            className="mx-auto"
          />
        </div>
        {/* Centered content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
            {" "}
            Coming Soon
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 text-center max-w-xl">
            We&apos;re working hard to bring you the new staking platform.{" "}
            <a
              href="https://x.com/zilliqa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D0C6] hover:underline"
            >
              Stay tuned
            </a>{" "}
            as we migrate to Zilliqa 2.0!
          </p>
          {/* Glass effect card for counter */}
          <div className="mb-8">
            <div className="relative group rounded-3xl px-8 py-8 flex gap-6 md:gap-12 shadow-2xl bg-white/10 backdrop-blur-xl overflow-hidden transition-transform duration-300 hover:scale-105">
              {/* Animated shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 z-0">
                <div
                  className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60"
                  style={{ backgroundSize: "200% 100%" }}
                />
              </div>
              {/* Counter content */}
              <div className="relative z-10 flex gap-6 md:gap-12">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center min-w-[80px]"
                  >
                    <span className="text-5xl md:text-6xl font-mono font-extrabold tabular-nums drop-shadow-lg text-white">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="text-xs md:text-base text-gray-100 uppercase tracking-widest mt-2 font-semibold drop-shadow">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center max-w-lg">
            <p className="mb-4">
              If you have staked on the legacy staking you can now unstake your
              tokens immediately.
              <br />
              <Button
                href="https://zillion.zilliqa.com"
                target="_blank"
                type="primary"
                className="mt-5 btn-primary-teal px-10 py-2 text-lg font-bold rounded-full shadow-lg transition-transform duration-200 hover:scale-105"
              >
                Unstake now
              </Button>
            </p>
          </div>
        </div>
        {/* Footer at the bottom */}
        <footer className="w-full text-gray-500 text-sm text-center py-6">
          &copy; {new Date().getFullYear()} Zilliqa Staking
        </footer>
      </div>
    </>
  )
}

export default ComingSoon
