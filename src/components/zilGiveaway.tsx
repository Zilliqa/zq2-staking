import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { WalletConnector } from "@/contexts/walletConnector"
import {
  CHAIN_ZQ2_DEVNET,
  CHAIN_ZQ2_PROTOMAINNET,
  CHAIN_ZQ2_PROTOTESTNET,
} from "@/misc/chainConfig"
import { Button, Modal } from "antd"
import { useState } from "react"

const ZilGiveaway: React.FC = () => {
  const [showRequestZilPopup, setShowRequestZilPopup] = useState(false)
  const [zilRequested, setZilRequested] = useState(false)
  const [zilRequestFailed, setZilRequestFailed] = useState(false)
  const [failureReason, setFailureReason] = useState("")
  const { walletAddress } = WalletConnector.useContainer()
  const { appConfig } = AppConfigStorage.useContainer()

  const { updateWalletBalance } = WalletConnector.useContainer()

  const requestZil = async () => {
    const url =
      appConfig.chainId === CHAIN_ZQ2_DEVNET.id
        ? "https://faucet.zq2-devnet.zilliqa.com"
        : CHAIN_ZQ2_PROTOTESTNET.id === appConfig.chainId
          ? "https://faucet.zq2-prototestnet.zilliqa.com"
          : CHAIN_ZQ2_PROTOMAINNET.id === appConfig.chainId
            ? "https://faucet.zq2-protomainnet.zilliqa.com"
            : "N/A"

    // const formData = new FormData()
    // formData.append("address", walletAddress!.toLowerCase())
    const params = new URLSearchParams()
    params.append("address", walletAddress!)

    try {
      await fetch(url, {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      setZilRequested(true)
    } catch (error: any) {
      const errorString = `${error}`.trim()
      if (errorString.startsWith("TypeError: Failed to fetch")) {
        // This is hack around not adding the correct CORS headers on the faucet side
        setZilRequested(true)
      } else {
        setFailureReason(error.message)
        setZilRequestFailed(true)
      }
    } finally {
      setTimeout(() => {
        updateWalletBalance()
      }, 5000)
    }
  }

  const closePopup = () => {
    setShowRequestZilPopup(false)
    setZilRequested(false)
    setZilRequestFailed(false)
  }

  return (
    <>
      <Button
        size="small"
        className="btn-primary-teal px-2 md:px-3 max-lg:min-h-[39px] "
        onClick={() => {
          setShowRequestZilPopup(true)
          requestZil()
        }}
      >
        + ZIL
      </Button>

      <Modal
        title={`Requesting ZIL for ${walletAddress}`}
        open={showRequestZilPopup}
        onOk={() => setShowRequestZilPopup(false)}
        onCancel={() => setShowRequestZilPopup(false)}
        cancelButtonProps={{ className: "hidden" }}
        okButtonProps={{ className: "hidden" }}
        maskClosable={false}
      >
        <div className="pt-5">
          {zilRequestFailed ? (
            <>
              <div>Request failed</div>
              <div>{failureReason}</div>
              <div className="flex justify-end">
                <Button className="btn-primary-cyan " onClick={closePopup}>
                  Ok
                </Button>
              </div>
            </>
          ) : zilRequested ? (
            <div>
              <div>Free ZIL should be in your wallet soon!</div>
              <div>
                Remember that you can only make one request every 1 minute
              </div>
              <div className="flex justify-end">
                <Button
                  className="btn-primary-teal-lg mt-5"
                  onClick={closePopup}
                >
                  Ok
                </Button>
              </div>
            </div>
          ) : (
            <div className="loading-blur"> Loading...</div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ZilGiveaway
