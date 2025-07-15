import { Button } from "antd"
import { EyeOutlined } from "@ant-design/icons"
import { useRouter } from "next/router"
import { WalletConnector } from "@/contexts/walletConnector"

const WatchButton = () => {
  const router = useRouter()

  const { walletAddress } = WalletConnector.useContainer()

  const handleWatchClick = () => {
    if (walletAddress) {
      router.push(`/watch?address=${walletAddress}`)
    } else {
      router.push("/watch")
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 80, // Position it next to the FAQ button
        zIndex: 1000,
      }}
    >
      <Button
        type="primary"
        shape="circle"
        onClick={handleWatchClick}
        className="btn-primary-teal !w-10 !h-10 !text-lg !p-0"
        title="Watch Address"
      >
        <EyeOutlined />
      </Button>
    </div>
  )
}

export default WatchButton
