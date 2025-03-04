import Image from "next/image"
import ArrowRightWhite from "../assets/svgs/arrow-right-white.svg"
import CustomWalletConnect from "./customWalletConnect"

const LoginView: React.FC = () => {
  return (
    <div className="relative 4k:mt-52">
      <div className="text-center p-4">
        <h1 className="bold52 text-white">Staking Portal</h1>
        <p className="mt-6 body2-v2 text-white4">
        Stake ZIL. <br /> Earn Rewards.<br /> Secure the Network.{" "}
        </p>
      </div>

      <div className="flex flex-col items-center mt-12.5 ">
        <CustomWalletConnect notConnectedClassName="btn-primary-teal !w-fit px-14 group flex items-center">
          <div className="flex">
            Connect wallet
            <Image
              className="ml-3 h-6 w-6 transform transition-transform ease-out duration-500 group-hover:translate-x-2"
              src={ArrowRightWhite}
              alt="arrow icon"
              width={24}
              height={24}
            />
          </div>
        </CustomWalletConnect>
      </div>
    </div>
  )
}

export default LoginView
