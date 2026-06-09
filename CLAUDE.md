# ABOUTME: Orientation for Claude Code / contributors working in the zq2-staking repo

# ABOUTME: Architecture, commands, conventions, gotchas, and operational runbooks

# CLAUDE.md

Guidance for working in this repository.

## What this is

ZQ2 Staking Portal: a **Next.js 14 (pages router) + TypeScript** front end for staking ZIL on Zilliqa 2. Chain reads use **viem**; wallet connection uses **wagmi + RainbowKit**; UI is **antd + Tailwind**; time handling is **Luxon**. App state lives in **unstated-next**-style containers (a local copy in `src/contexts/context.tsx`).

## Commands

Package manager is **npm** (`package-lock.json`). Do not use pnpm/yarn.

```bash
npm install
npm run dev          # next dev on http://localhost:3000
npm run build        # next build (output: "standalone")
npm run lint         # eslint --fix
npm run lint:check   # eslint (no fix) — the CI-style gate
npm run test         # vitest run (unit tests)
npm run format       # prettier --write .
```

There is **no `tsc` in package.json**; type checking is `npx tsc --noEmit` (see gotcha below).

## Layout

```
src/
  misc/                  # pure logic + chain config
    stakingPoolsConfig.ts  # pool definitions per chain + StakingPoolDefinition type + pure helpers
    walletsConfig.ts       # on-chain wallet reads (stakes/unstakes/rewards) + mock fixtures
    chainConfig.ts         # chain definitions, getViemClient, RainbowKit connectors
    stakingAbis.ts         # trimmed ABIs (functions only, no events)
    formatting.ts          # ZIL/token formatting helpers
    __tests__/             # vitest unit tests (pure functions)
  contexts/              # unstated-next containers (app state)
    stakingPoolsStorage.tsx  # pools + user positions; selector projection
    stakingOperations.tsx    # stake/unstake/claim/stakeReward tx wiring
    walletConnector.tsx      # real (wagmi) + mock wallet state
    appConfigStorage.tsx     # runtime config from /api/config
  components/            # React components (antd + Tailwind)
  pages/                # routes (pages router); pages/api/config.ts serves runtime config
  script/               # one-off CLI tools run via `npx tsx`
public/static/          # pool icons referenced by definition.iconUrl
images/frontend/        # production Dockerfile + image Makefile
.env.mocked | .env.local_zq2 | .env.zq2_testnet | .env.mainnet  # per-env config (rename to .env or pass via ENV_FILE)
docker-compose.yml      # local dev (mocked) + prod-like (mainnet) profiles
```

## Core concepts

- **Chains & env.** The app reads `ZQ2_STAKING_*` **server-side at runtime** via `src/pages/api/config.ts` (so a built image is reconfigured by env at run time, no rebuild). `ZQ2_STAKING_CHAIN_ID` selects which pool set + RPC is used. Known ids: `9999999` = MOCK, `32769` = mainnet, `33103` = prototestnet (full list in `chainConfig.ts`).
- **Mock wallet mode.** When `chainId === MOCK_CHAIN.id` (9999999), `walletsConfig.ts` serves the `dummyWallets` fixtures instead of on-chain reads, and a mock wallet selector replaces RainbowKit. On any real chain, the same data fetchers do on-chain reads for the connected address — so a dummy wallet whose `address` is a real one, run against a real chain, will read that address's real on-chain data.
- **Pool soft-delete (`active`).** `StakingPoolDefinition.active?: boolean` (`undefined`/`true` = active, `false` = retired). `isStakingPoolActive` / `isPoolVisibleInStakeSelector` / `getPoolRetirementNotice` in `stakingPoolsConfig.ts` are the single source of truth. A retired pool is hidden from "Available to stake" unless the connected wallet still has a bonded stake; staking and re-staking rewards are blocked; unstake/claim stay available. To retire a pool, set `active: false` (optionally `retirementNotice: "..."` for custom copy).
- **Filtered vs unfiltered projections (`stakingPoolsStorage.tsx`).** `activeStakingPoolsData` drives the "Available to stake" selector. Everything else (combiners for unstakes/rewards, `getMinimalPoolStakingAmount`, the `?poolId=` lookup) uses the **unfiltered** list so retired pools still resolve for withdrawal/claim.

## Conventions

- Prettier: **no semicolons, double quotes, 2-space indent** (`.prettierrc.js`); ESLint enforces `prettier/prettier` + double quotes. Run `npm run lint` before committing.
- TypeScript strict; path alias `@/*` -> `./src/*`.
- Tests are **Vitest** over **pure functions** (no React/DOM); see `src/misc/__tests__`. UI flows are verified via the dev container (see docker-compose) rather than RTL.

## Gotchas

- **`tsc --noEmit` is not clean on a fresh tree.** ~13 `Cannot find module '*.svg'` errors are pre-existing: Next resolves `.svg` imports at build/runtime, but bare `tsc` does not. Filter them when checking your own changes: `npx tsc --noEmit 2>&1 | grep -v "svg' or its corresponding type declarations"`.
- **`sharp` in production.** `next/image` optimization needs `sharp` in standalone mode; it is installed in the runner stage of `images/frontend/Dockerfile`. Without it you get repeated "'sharp' is required..." logs (non-fatal; the original image is served).
- **`eth_getLogs` is capped at 50 blocks** on `api.zilliqa.com`. Do not scan logs over wide ranges; use the Otterscan `ots_*` index instead (see runbook).

## Docker (local)

```bash
docker compose --profile dev up            # mocked data, hot reload, :3000
docker compose --profile prod up --build   # mainnet standalone build, :3000
ENV_FILE=.env.zq2_testnet docker compose --profile dev up   # override env
```

## Runbooks

### Add a delegator pool

`npx tsx src/script/fetchPoolStaticData.ts --network_id <id> --contract_address <addr> --name <name> --icon_url /static/<file> --type LIQUID|NON_LIQUID`, then paste the printed `definition` into `stakingPoolsConfigForChainId` in `stakingPoolsConfig.ts`.

### Recover the wallets staking in a (non-liquid) pool

Per-delegator lists are not directly enumerable and `eth_getLogs` is throttled, but the RPC exposes the Otterscan index. To list current delegators of a pool:

```bash
npx tsx src/script/recoverPoolDelegators.ts \
  --network_id 32769 \
  --contract_address 0x2b5e0D8Db793955684ddC4eaD286900Cb791cc3F
```

It walks `ots_searchTransactionsBefore` to collect every address that touched the contract, then reads `getDelegatedAmount()` from each (a non-zero result = current delegator) and checks the sum against `getDelegatedTotal()`. Useful before/after retiring a pool (e.g. to notify delegators).

Manual equivalent with Foundry `cast`:

```bash
cast call <pool> "getDelegatedTotal()(uint256)" --rpc-url https://api.zilliqa.com
cast call <pool> "getDelegatedAmount()(uint256)" --from <wallet> --rpc-url https://api.zilliqa.com
```

Note: for **liquid** pools the delegator holds the liquid staking ERC-20 instead, so enumerate token holders rather than calling `getDelegatedAmount`.
