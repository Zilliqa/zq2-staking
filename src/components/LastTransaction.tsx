import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { formatAddress, getTxExplorerUrl } from "@/misc/formatting"
import Link from "next/link"
import React from "react"

export interface LastTransactionProps {
  txHash?: string
}

const LastTransaction: React.FC<LastTransactionProps> = ({ txHash }) => {
  const { appConfig } = AppConfigStorage.useContainer()

  return txHash !== undefined ? (
    <div className="text-center mb-3 info-label">
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={getTxExplorerUrl(txHash, appConfig.chainId)}
        passHref={true}
        className="text-gray8"
      >
        Last transaction:{" "}
        <span className="text-white underline hover:text-teal1 active:text-tealDark">
          {" "}
          {formatAddress(txHash)}
        </span>
      </Link>
    </div>
  ) : (
    <></>
  )
}

export default LastTransaction
