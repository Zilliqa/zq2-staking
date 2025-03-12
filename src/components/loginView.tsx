import Image from "next/image"
import ArrowRightWhite from "../assets/svgs/arrow-right-white.svg"
import CustomWalletConnect from "@/components/customWalletConnect"

const LoginView: React.FC = () => {
  return (
    <div className="relative">
      <div className="text-center p-4">
        <h1 className="bold33 lg:mt-20 4k:mt-56">
          Stake ZIL. <br /> Earn Rewards.
          <br /> Secure the Network.
        </h1>
        <p className="mt-6 body2-v2">
          Give it a try, and give us your feedback !
        </p>
      </div>

      <div className="flex flex-col items-center mt-12 ">
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
