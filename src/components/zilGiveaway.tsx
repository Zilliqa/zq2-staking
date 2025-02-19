import { WalletConnector } from "@/contexts/walletConnector"
import { Button, Modal } from "antd"
import { useState } from "react"

const ZilGiveaway: React.FC = () => {
  const [showRequestZilPopup, setShowRequestZilPopup] = useState(false)
  const [zilRequested, setZilRequested] = useState(false)
  const [zilRequestFailed, setZilRequestFailed] = useState(true)
  const [failureReason, setFailureReason] = useState("")
  const { walletAddress } = WalletConnector.useContainer()

  const requestZil = async () => {
    const url = "https://faucet.zq2-devnet.zilliqa.com"
    const formData = new FormData()
    formData.append("address", walletAddress!)

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        // Successful request (status code 200-299)
        console.log("Faucet request successful!")
        // You might want to process the response body here.  It could be HTML, JSON, or plain text.
        const responseText = await response.text()
        console.log("Response:", responseText) // Inspect the response
        setZilRequested(true)
      } else {
        // Handle errors (status codes 400 and above)
        console.error(
          `Faucet request failed: ${response.status} ${response.statusText}`
        )
        const errorText = await response.text() // Get error details, if any
        setFailureReason(errorText)
        setZilRequestFailed(true)
      }
    } catch (error: any) {
      // Network errors (e.g., no internet connection)
      console.error("Network error:", error)
      setFailureReason(error.message)
      setZilRequestFailed(true)
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
        className="btn-primary-gradient-aqua-lg px-0 lg:btn-primary-gradient-aqua lg:w-1/2 w-2/3"
        onClick={() => {
          setShowRequestZilPopup(true)
          requestZil()
        }}
      >
        Get Free ZIL
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
        <div className="py-5">
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
            <Button
              className="btn-primary-gradient-aqua-lg"
              onClick={closePopup}
            >
              Free ZIL should be in your wallet soon!
            </Button>
          ) : (
            <div className="animated-gradient h-[1.5em] "></div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ZilGiveaway
