"use client";

import { AppConfig } from "@/pages/api/config";
import { createContainer } from "./context";

const useAppConfigStorage = (initialState?: { appConfig: AppConfig }) => {
  return {
    appConfig: initialState!.appConfig
  };
};

export const AppConfigStorage = createContainer(useAppConfigStorage);
