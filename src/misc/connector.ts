import { createConnector } from "wagmi"
import { injected, InjectedParameters } from "wagmi/connectors"

interface Provider {
  [key: string]: any
}

function getExplicitInjectedProvider(flag: string): Provider | undefined {
  const _window = typeof window !== "undefined" ? window : undefined
  if (typeof _window === "undefined" || typeof _window.ethereum === "undefined")
    return undefined
  const providers = _window.ethereum.providers
  return providers
    ? providers.find((provider: Provider) => provider[flag])
    : _window.ethereum[flag]
      ? _window.ethereum
      : undefined
}

function getWindowProviderNamespace(namespace: string): any {
  const providerSearch = (provider: any, namespace2: string): any => {
    const [property, ...path] = namespace2.split(".")
    const _provider = provider[property]
    if (_provider) {
      if (path.length === 0) return _provider
      return providerSearch(_provider, path.join("."))
    }
  }
  if (typeof window !== "undefined") return providerSearch(window, namespace)
}

function hasInjectedProvider({
  flag,
  namespace,
}: {
  flag?: string
  namespace?: string
}): boolean {
  if (namespace && typeof getWindowProviderNamespace(namespace) !== "undefined")
    return true
  if (flag && typeof getExplicitInjectedProvider(flag) !== "undefined")
    return true
  return false
}

function getInjectedProvider({
  flag,
  namespace,
}: {
  flag?: string
  namespace?: string
}): Provider | undefined {
  const _window = typeof window !== "undefined" ? window : undefined
  if (typeof _window === "undefined") return undefined
  if (namespace) {
    const windowProvider = getWindowProviderNamespace(namespace)
    if (windowProvider) return windowProvider
  }
  const providers = _window.ethereum?.providers
  if (flag) {
    const provider = getExplicitInjectedProvider(flag)
    if (provider) return provider
  }
  if (typeof providers !== "undefined" && providers.length > 0)
    return providers[0]
  return _window.ethereum
}

function createInjectedConnector(provider?: Provider) {
  return (walletDetails: any) => {
    // Use 'any' for walletDetails to avoid defining a new type
    const injectedConfig: any = provider
      ? {
          target: () => ({
            id: walletDetails.rkDetails.id,
            name: walletDetails.rkDetails.name,
            provider,
          }),
        }
      : {}
    return createConnector((config) => ({
      ...injected(injectedConfig)(config),
      ...walletDetails,
    }))
  }
}

function getInjectedConnector({
  flag,
  namespace,
  target,
}: {
  flag?: string
  namespace?: string
  target?: Provider
}): any {
  // Use 'any' because the return type of createConnector is complex and not directly exposed
  const provider = target ? target : getInjectedProvider({ flag, namespace })
  return createInjectedConnector(provider)
}

export { hasInjectedProvider, getInjectedConnector }
