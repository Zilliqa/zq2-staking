import { dummyWallets } from "@/contexts/dummyWalletsData";
import { WalletConnector } from "@/contexts/walletConnector";
import { Modal, Radio, Space } from "antd";
import { useState } from "react";



const DummyWalletSelector: React.FC = () => {

  const {
    isDummyWalletSelectorOpen,
    setDummyWallet,
    disconnectWallet,
  } = WalletConnector.useContainer();

  const [walletIndex, setValue] = useState(0);

  const selectedWalletChanged = (e: any) => {
    setValue(e.target.value);
  }

  return (
    <>
      <Modal title="Basic Modal" open={isDummyWalletSelectorOpen} okText="Connect" onOk={() => setDummyWallet(dummyWallets[walletIndex])} onCancel={disconnectWallet}>
        <Radio.Group onChange={selectedWalletChanged} value={walletIndex}>
        <Space direction="vertical">
          {
            dummyWallets.map((wallet, index) => (
              <Radio key={index} value={index}>{wallet.name}</Radio>
            ))
          }
        </Space>
      </Radio.Group>
      </Modal>
    </>
  );
};

export default DummyWalletSelector;