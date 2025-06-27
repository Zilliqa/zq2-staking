"use client"

import { AppConfig } from "@/pages/api/config"
import { createContainer } from "./context"
import { useState } from "react"

const useAppConfigStorage = (initialState?: { appConfig: AppConfig }) => {
  const [isPreviewAuthenticated, setIsPreviewAuthenticated] = useState(false)

  const tryPreviewAuthentication = async (password: string) => {
    // hash the password using SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const previewPasswordHash = await crypto.subtle
      .digest("SHA-256", data)
      .then((hashBuffer) =>
        // convert the hash to a hex string
        Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      )

    const response = await fetch(
      `/api/preview_authenticate?secretHash=${previewPasswordHash}`,
      {
        method: "GET",
      }
    )

    if (response.ok) {
      setIsPreviewAuthenticated(true)
    } else {
      setIsPreviewAuthenticated(false)
    }
  }

  return {
    appConfig: initialState!.appConfig,
    isPreviewAuthenticated,
    tryPreviewAuthentication,
  }
}

export const AppConfigStorage = createContainer(useAppConfigStorage)
