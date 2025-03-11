import Image from "next/image"
import React, { useState, useEffect } from "react"
import close from "../assets/svgs/close-icon-small.svg"
import { StakingPoolsStorage } from "@/contexts/stakingPoolsStorage"
import { useRouter } from "next/router"
import CustomWalletConnect from "./customWalletConnect"
import ArrowRightWhite from "../assets/svgs/arrow-icon.svg"
interface MobilePopupProps {
  isOpen: boolean
  onClose: () => void
  isWalletConnected: boolean // Add this prop
}
const MobilePopup = ({
  isOpen,
  onClose,
  isWalletConnected,
}: MobilePopupProps) => {
  const { stakingPoolForView } = StakingPoolsStorage.useContainer()
  const router = useRouter()

  // Add this useEffect to watch wallet connection state
  useEffect(() => {
    if (isWalletConnected) {
      onClose()
    }
  }, [isWalletConnected, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 mx-4 z-50 md:hidden bg-gray  ${isOpen ? "visible" : "invisible"}`}
      onClick={onClose}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 rounded-t-15 border-t border-r border-l border-gray3 
                 bg-aqua-grey-gradient backdrop-blur-17 p-5 transform transition-transform duration-300 ease-out
                 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end ">
          <button onClick={onClose} aria-label="Close">
            <Image alt="Close Icon" src={close} width={20} height={20} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-between text-center pt-4 pb-10 ">
          <h2 className="text-white2 text-26 leading-tight font-bold">
            Start earning ZIL
          </h2>
          <p className="text-gray3 text-16 font-medium leading-tight mt-3 ">
            Stake ZIL. <br /> Earn Rewards.
            <br /> Secure the Network.
          </p>
          <div className="flex items-center space-x-4 mt-6">
            <CustomWalletConnect notConnectedClassName="capitalize text-16  font-bold btn-primary-teal !w-fit  group flex items-center justify-center">
              Connect wallet
              <Image
                className="  h-4 w-4 transform transition-transform ease-out duration-500 group-hover:translate-x-2"
                src={ArrowRightWhite}
                alt="arrow icon"
                width={13}
                height={13}
              />
            </CustomWalletConnect>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobilePopup
