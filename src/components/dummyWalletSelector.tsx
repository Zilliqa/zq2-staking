import { WalletConnector } from "@/contexts/walletConnector"
import { dummyWallets } from "@/misc/walletsConfig"
import { Modal, Radio, Space } from "antd"
import { useState } from "react"

const DummyWalletSelector: React.FC = () => {
  const {
    isDummyWalletSelectorOpen,
    selectDummyWallet,
    disconnectDummyWallet,
  } = WalletConnector.useContainer()

  const [walletIndex, setValue] = useState(0)

  const selectedWalletChanged = (e: any) => {
    setValue(e.target.value)
  }

  return (
    <>
      <Modal
        title="Basic Modal"
        open={isDummyWalletSelectorOpen}
        okText="Connect"
        onOk={() => selectDummyWallet(dummyWallets[walletIndex])}
        onCancel={disconnectDummyWallet}
        okButtonProps={{ className: "btn-primary-cyan" }}
      >
        <Radio.Group onChange={selectedWalletChanged} value={walletIndex}>
          <Space direction="vertical">
            {dummyWallets.map((wallet, index) => (
              <Radio key={index} value={index}>
                {wallet.name}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </>
  )
}

export default DummyWalletSelector
