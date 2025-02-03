"use client"
/**
 * This file is a copy of https://github.com/jamiebuilds/unstated-next/blob/master/src/unstated-next.tsx
 * The reason it is the copy is that the project is no longer maintained and we are using new version of React
 *
 * In theory, this should land in the "@zilliqa/zilliqa-ui" but then you need to set up jsx transpilation
 * if you are reading that and have time to do it, please do!
 */
import React from "react"

const EMPTY: unique symbol = Symbol()

export interface ContainerProviderProps<State> {
  initialState?: State
  children: React.ReactNode
}

export interface Container<Value, State> {
  Provider: React.ComponentType<ContainerProviderProps<State>>
  useContainer: () => Value
  MockProvider: React.ComponentType<ContainerProviderProps<Partial<Value>>>
}

export function createContainer<Value, State>(
  useHook: (initialState?: State) => Value,
  mockkContextCreator?: (overrides: Partial<Value>) => Value
): Container<Value, State> {
  let Context = React.createContext<Value | typeof EMPTY>(EMPTY)

  function Provider(props: ContainerProviderProps<State>) {
    let value = useHook(props.initialState)
    return <Context.Provider value={value}>{props.children}</Context.Provider>
  }

  function MockProvider(props: ContainerProviderProps<Partial<Value>>) {
    if (!mockkContextCreator) {
      throw new Error(
        "MockProvider can only be used when mockkContextCreator is provided"
      )
    }
    let value = mockkContextCreator(props.initialState || {})
    return <Context.Provider value={value}>{props.children}</Context.Provider>
  }

  function useContainer(): Value {
    let value = React.useContext(Context)
    if (value === EMPTY) {
      throw new Error("Component must be wrapped with <Container.Provider>")
    }
    return value
  }

  return { Provider, useContainer, MockProvider }
}
