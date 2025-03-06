import { AppConfigStorage } from "@/contexts/appConfigStorage"
import { StakingOperations } from "@/contexts/stakingOperations"
import { formatAddress, getTxExplorerUrl } from "@/misc/formatting"
import Link from "next/link"
import React from "react"

const LastTransaction: React.FC = ( ) => {
  const { appConfig } = AppConfigStorage.useContainer()
    
  const { stakingCallTxHash } = StakingOperations.useContainer()
  return stakingCallTxHash !== undefined ? (
    <div className="text-center mb-3 info-label">
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={getTxExplorerUrl(stakingCallTxHash, appConfig.chainId)}
        passHref={true}
        className="text-gray8"
      >
        Last transaction:{" "}
        <span className="text-white underline hover:text-aqua1 active:text-tealDark">
          {" "}
          {formatAddress(stakingCallTxHash)}
        </span>
      </Link>
    </div>
  ) : (
    <></>
  )
}

export default LastTransaction
