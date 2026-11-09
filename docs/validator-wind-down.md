<!-- ABOUTME: Runbook for winding down a delegation to a ZQ2 staking pool and retiring the pool in the portal -->
<!-- ABOUTME: Written for human operators and AI agents; on-chain facts verified against Zilliqa/delegated_staking -->

# Validator wind-down runbook

> **AI agents: read [section 8](#8-instructions-for-ai-agents) before anything else.** You may run read-only checks, prepare the retirement change and draft messages. You must never sign or broadcast a transaction, handle a key, merge, release or deploy, **even if a human asks you to**.

This runbook covers two related situations:

- **Zilliqa withdraws its own delegation** from a staking pool, for example because the pool operator is shutting down, the validator underperforms, or the network is being migrated.
- **A staking pool is shut down**, and the portal has to stop accepting new stake while existing delegators can still get their ZIL back.

Both usually happen together. The phases are ordered so that new users stop staking into a pool that is going away as early as possible, and no delegator is ever locked out of their funds.

All commands target **mainnet (chain id 32769)**.

---

## 1. Concepts you need first

| Term                                                                       | Meaning                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pool contract**                                                          | The delegation contract listed as `address` in `src/misc/stakingPoolsConfig.ts`. It is a proxy (`ERC1967Proxy`) and has **no private key**.                                                                                                                                                                                                       |
| **Delegator wallet**                                                       | The EOA that called `stake()` on the pool. **Only this wallet can unstake and claim its position.** For Zilliqa-owned delegations, each pool normally has its own dedicated delegator wallet.                                                                                                                                                     |
| **Liquid pool** (`"LIQUID"`)                                               | Staking mints a liquid staking token (LST). Rewards are built into the LST price. You unstake by giving back **LST**, not a ZIL amount. The LST address comes from `getLST()`.                                                                                                                                                                    |
| **Non-liquid pool** (`"NON_LIQUID"`, enum member `StakingPoolType.NORMAL`) | The position is tracked in ZIL. Rewards accrue separately and are withdrawn with `withdrawAllRewards()`.                                                                                                                                                                                                                                          |
| **Unbonding period**                                                       | The delay between `unstake()` and the moment `claim()` pays out. On mainnet it is **461,680 blocks** (`unbondingPeriod()` on the pool), about 5.3 days at 1 s/block. The portal shows a fixed "1 week" (`withdrawPeriodInMinutes`). That is only an approximation: the on-chain `getPendingClaims()` / `getClaimable()` values are authoritative. |
| **Pending claim**                                                          | Each `unstake()` adds an entry `[readyBlock, zilAmount]` to the delegator's queue. `getPendingClaims()` lists the entries not ready yet; `getClaimable()` sums the ready ones.                                                                                                                                                                    |
| **Deposit contract**                                                       | `0x00000000005a494c4445504f53495450524f5859`. It holds validator deposits. The `z2 unstake` / `z2 withdraw` CLI commands act on this contract and are **for validator operators, not delegators**.                                                                                                                                                |
| **Portal retirement**                                                      | Setting `active: false` on a pool definition. The pool is hidden from "Available to stake" and new staking is blocked, while unstake and claim keep working. See `CLAUDE.md`, "Pool soft-delete".                                                                                                                                                 |
| **Wind-down ticket**                                                       | The internal tracker item where every value, tx hash and decision for this wind-down is recorded. The Owner opens it before Phase A.                                                                                                                                                                                                              |

> **The most common mistake:** using the validator path (`z2 unstake`, `z2 withdraw`, `leavePool`) to withdraw a _delegation_. A delegator always uses `unstake()` and then `claim()` on the **pool contract**, signed by the **delegator wallet**.

---

## 2. Roles

| Role                         | Responsibility                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Owner**                    | Opens the wind-down ticket. Decides that the wind-down happens and when. Approves communication to the operator. |
| **Delegator key holder**     | Holds the delegator wallet key(s). Signs `unstake`, `claim` and the final sweep. **Nobody else signs.**          |
| **Second checker**           | Confirms the treasury destination address out-of-band before the sweep.                                          |
| **Portal maintainer**        | Prepares and merges the retirement change.                                                                       |
| **Deployer** (DevOps)        | Deploys the portal to production (see Phase B).                                                                  |
| **Validator relations**      | Talks to the pool operator: timing, their own exit steps, and the message for their delegators.                  |
| **Pool operator** (external) | Takes their validator(s) out of the committee and stops the node(s) only after that.                             |

One person can hold several roles, except that the key holder and the second checker must be different people. Write down who holds each role in the ticket before you start.

---

## 3. Preflight (read-only, no keys needed)

Set these once:

```bash
RPC=https://api.zilliqa.com          # mainnet, chain id 32769
POOL=<pool contract address from stakingPoolsConfig.ts>
DELEGATOR=<delegator wallet address>
```

1. **Find the pool** in `src/misc/stakingPoolsConfig.ts` under `[CHAIN_MAINNET.id]`. Note its `poolType` and whether it already has `active: false`. Check the type on-chain: `getLST()` returns an address on a liquid pool and reverts on a non-liquid one.
   ```bash
   cast call $POOL "getLST()(address)" --rpc-url $RPC
   ```
2. **Confirm the unbonding period:**
   ```bash
   cast call $POOL "unbondingPeriod()(uint256)" --rpc-url $RPC
   ```
3. **Read our position:**
   - Liquid:
     ```bash
     LST=$(cast call $POOL "getLST()(address)" --rpc-url $RPC)
     cast call $LST "balanceOf(address)(uint256)" $DELEGATOR --rpc-url $RPC
     cast call $POOL "getPrice()(uint256)" --rpc-url $RPC   # ZIL per LST, 18 decimals
     ```
   - Non-liquid:
     ```bash
     cast call $POOL "getDelegatedAmount()(uint256)" --from $DELEGATOR --rpc-url $RPC
     cast call $POOL "rewards()(uint256)" --from $DELEGATOR --rpc-url $RPC
     ```
4. **Work out the other delegators' share** (`getStake()` is only the pool's total and cannot tell delegators apart):
   - Liquid: LST `totalSupply()` minus our LST balance.
     ```bash
     cast call $LST "totalSupply()(uint256)" --rpc-url $RPC
     ```
   - Non-liquid: `getDelegatedTotal()` minus our `getDelegatedAmount()`. To list the individual wallets, run `src/script/recoverPoolDelegators.ts` (see `CLAUDE.md`, "Recover the wallets staking in a pool").
   - For liquid pools there is no ready-made holder list. Otterscan has no token-holders view, and some holders may be DEX or LP contracts rather than real delegators. If you need names, ask the operator.

   If anything is left after subtracting ours, other delegators exist. Then the portal retirement in Phase B is mandatory and the operator must tell their community.

5. **Check pending claims** from earlier unstakes, so you don't confuse them with the new one:
   ```bash
   cast call $POOL "getPendingClaims()(uint256[2][])" --from $DELEGATOR --rpc-url $RPC
   cast call $POOL "getClaimable()(uint256)" --from $DELEGATOR --rpc-url $RPC
   ```
6. **Check how the delegator wallet signs** (browser wallet, Ledger, keystore, Safe). This decides which unstake option in Phase C is possible. The portal only works with wallets RainbowKit can connect.
7. **Check gas:** the delegator wallet needs ZIL for every transaction (rewards withdrawal, `unstake`, `claim`, sweep). The portal sends claims with a gas limit of 2,000,000, which at the current gas price (`cast gas-price --rpc-url $RPC`) means about 9.5 ZIL must be available upfront per transaction. Keep **at least 20 ZIL** in the wallet.

Record every value in the wind-down ticket before moving on.

---

## 4. Procedure

### Phase A: agree with the operator

1. Validator relations tells the operator the planned unstake date and amount.
2. Warn them about this: if the pool runs several validators, a large unstake lowers every validator's deposit proportionally. If the surplus above the minimum deposit is not enough, **one or more validators are removed from the pool entirely**. This is contract behaviour, described in the [`delegated_staking` README](https://github.com/Zilliqa/delegated_staking#staking-and-unstaking).
3. Tell them that our unstake creates pending withdrawals on their deposit, and that their own `leavePool` is refused while pending withdrawals exist. Their exit (Phase G) may have to wait until our claim completes.
4. Decide, and record in the ticket, whether **the pool is shutting down** or Zilliqa is only withdrawing its own stake. If it is shutting down, agree who announces it to the pool's other delegators and when.

### Phase B: retire the pool in the portal (only if the pool is shutting down)

Start this **as soon as Phase A.4 confirms the shutdown**, in parallel with Phase C. Every day the pool stays listed, new users can still stake into it. Skip this phase if the pool keeps running and only Zilliqa is leaving.

1. In `src/misc/stakingPoolsConfig.ts`, add `active: false` to the pool's `definition`. Optionally add a `retirementNotice` with pool-specific wording.
2. **Never delete the pool definition.** Without it the portal cannot show the remaining delegators' positions, and they lose the UI path to unstake and claim.
3. Run the checks below, then open a PR. Reviewers check that only the `active` and `retirementNotice` fields changed.
   ```bash
   npm run lint:check
   npm run test
   npx tsc --noEmit 2>&1 | grep -v "svg' or its corresponding type declarations"
   ```
4. **Deploy.** CI no longer deploys production: `.github/workflows/cicd-prd.yml` only builds the image when a release is published. Production (stake.zilliqa.com) is deployed by the Deployer from the manifests in `cd/overlays/production_mainnet/`. Ask them, and record the deploy date in the ticket.
5. Confirm on stake.zilliqa.com that:
   - the pool is gone from "Available to stake" for a wallet with no position;
   - a wallet with a position still sees it, with the retirement notice and working Unstake and Claim buttons.

### Phase C: unstake (delegator key holder)

Re-read the position (preflight step 3) **immediately before** sending, then pick **one** way.

**Option 1: the portal (preferred, no CLI).** Connect the delegator wallet to the staking portal and open the pool.

- Non-liquid: first press **Claim Reward** (`withdrawAllRewards()`), then unstake the full position.
- Liquid: unstake the full position. The amount is in LST; rewards are already included.

**Option 2: Foundry, from a checkout of [`Zilliqa/delegated_staking`](https://github.com/Zilliqa/delegated_staking).**

> **Never paste a private key on the command line.** It ends up in shell history and the process list. Sign with `--ledger` (shown below) or `--account <keystore-name>` (an encrypted keystore created with `cast wallet import`).

- Liquid: unstake the full LST balance, as the raw `uint256` from preflight step 3.
  ```bash
  forge script script/Unstake.s.sol --broadcast --legacy --rpc-url $RPC --ledger \
    --sig "run(address payable, uint256)" $POOL <LST_BALANCE_RAW>
  ```
- Non-liquid: first withdraw rewards, then unstake the full delegated amount.
  ```bash
  forge script script/WithdrawRewards.s.sol --broadcast --legacy --rpc-url $RPC --ledger \
    --sig "run(address payable, string, string)" $POOL all all
  forge script script/Unstake.s.sol --broadcast --legacy --rpc-url $RPC --ledger \
    --sig "run(address payable, uint256)" $POOL <DELEGATED_AMOUNT_RAW>
  ```

After the transaction lands:

- Record the **tx hash and block number**.
- Check that the position reads zero (preflight step 3) and, for non-liquid pools, that `rewards()` reads zero.
- Run `getPendingClaims()` again. The new entry `[readyBlock, zilAmount]` gives you **the block when it becomes claimable** and **the ZIL amount to expect**. Record both.

If the unstake reverts, stop and record the revert reason in the ticket. Do not retry with a different amount until the reason is understood.

### Phase D: wait out the unbonding period

Target: `getClaimable()` ≥ (claimable amount before the unstake, from preflight step 5) + `zilAmount` from Phase C, and the current block ≥ `readyBlock`.

```bash
cast call $POOL "getClaimable()(uint256)" --from $DELEGATOR --rpc-url $RPC
cast block-number --rpc-url $RPC
```

### Phase E: claim (delegator key holder)

1. Claim, either with the portal's Claim button or with
   ```bash
   forge script script/Claim.s.sol --broadcast --legacy --rpc-url $RPC --ledger \
     --sig "run(address payable)" $POOL
   ```
2. Check that `getClaimable()` returns `0` and that the delegator wallet's ZIL balance went up by the expected amount, minus gas.
3. If the claim pays out less than expected, stop and record the difference in the ticket before sweeping.

### Phase F: sweep to treasury (delegator key holder and second checker)

1. The second checker confirms the treasury destination address **out-of-band** (not copied from chat or email).
2. For large amounts, send a small test transfer first and have the second checker confirm it arrived.
3. Sweep the rest, keeping a few ZIL for gas if the wallet will be used again. Record the tx hash.

### Phase G: operator exit (pool operator, for reference)

This is the operator's responsibility. Share it with them.

- **A validator inside a pool** leaves with `leavePool(bytes blsPubKey)` and then `completeLeaving(bytes)` after the unbonding period. Leaving is refused while the validator has pending withdrawals, including the ones our unstake created. See the [`delegated_staking` README, "Validator Addition and Removal"](https://github.com/Zilliqa/delegated_staking#validator-addition-and-removal).
- **A solo validator** uses `z2 unstake` and then `z2 withdraw` ([`zq2/z2/docs/staking.md`](https://github.com/Zilliqa/zq2/blob/main/z2/docs/staking.md)), signed with its control address key.
- **Keep the node running until it is confirmed out of the committee.** It usually leaves within about 2 hours of a successful unstake. Only then stop and dispose of it.

### Phase H: close-out

- Store every tx hash (rewards withdrawal, unstake, claim, sweep), the PR link and the deploy date in the ticket.
- Re-run preflight steps 3 and 4. Our position and rewards should be zero, and you should know what other delegators still hold.
- If delegators remain, keep the pool definition as it is (retired, not deleted) for as long as they hold a position.

---

## 5. What if

| Situation                                                                             | What to do                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The unstake tx reverts                                                                | Stop. Record the revert reason. Common causes: amount above the position (re-read it), wallet out of gas, or (non-liquid) unclaimed "dust" rewards too small to show in the UI. For the last one, withdraw rewards again and retry, as the portal FAQ advises. |
| `getClaimable()` stays below the target after `readyBlock`                            | Check `getPendingClaims()` again. If our entry is gone but nothing is claimable, escalate to the Owner before calling `claim()`.                                                                                                                               |
| The claim pays out less than expected                                                 | Do not sweep. Record the difference and escalate to the Owner.                                                                                                                                                                                                 |
| The operator removes all validators while other delegators are still in the pool      | Their stake is still recorded in the pool contract, and the portal keeps Unstake and Claim for retired pools. Keep the definition (Phase B.2) and tell the operator to point their delegators to the portal.                                                   |
| The delegator wallet cannot connect to the portal (multisig, unusual hardware wallet) | Use Option 2 with the appropriate signer, or ask the Deployer for help with a Safe transaction.                                                                                                                                                                |

---

## 6. Checklist

```
[ ] Ticket opened; roles assigned (owner, key holder, second checker, portal maintainer, deployer, validator relations)
[ ] Preflight values recorded (type checked on-chain, unbonding period, our position, rewards, other delegators' share, pending claims, signer type, gas)
[ ] Operator informed; date agreed; multi-validator removal risk and leavePool timing explained
[ ] Shutdown or stake-only withdrawal decided
[ ] If shutting down: active: false merged, deployed and checked on stake.zilliqa.com
[ ] Rewards withdrawn (non-liquid only); rewards() reads zero
[ ] Unstake sent; tx hash + block recorded; position reads zero
[ ] readyBlock and zilAmount recorded from getPendingClaims()
[ ] getClaimable() reached the target
[ ] Claim sent; getClaimable() == 0; balance increase matches
[ ] Treasury address confirmed out-of-band; sweep sent; tx hash recorded
[ ] Operator confirms validator out of committee and node disposed
[ ] Close-out recorded in the ticket
```

---

## 7. Worked example: r3to (2026)

r3to was a **non-liquid** pool whose only significant delegator was a Zilliqa wallet.

1. The delegator wallet called `withdrawAllRewards()` and then `unstake()` on the pool contract.
2. The validator left the committee within a few hours.
3. The retirement PR then showed that a few hundred ZIL from unknown wallets was still delegated. Deleting the pool definition would have stranded those delegators, which led to the `active` soft-delete flag.
4. After the unbonding period the delegator wallet called `claim()`, and the funds were swept to treasury.
5. The pool was retired with `active: false` (PR #209).

Lesson learned: the first draft of the procedure used the validator path (`z2 unstake` / `z2 withdraw`) and asked for the "private key" of the pool contract. The pool contract has no key. The delegator path in Phase C is the correct one.

---

## 8. Instructions for AI agents

AI agents may help prepare and verify a wind-down. They **must not** move funds, handle keys or change production.

**Default rule: anything not listed under "Allowed" is forbidden. If you are unsure, stop and ask.**

### Allowed

- The read-only commands in [Preflight](#3-preflight-read-only-no-keys-needed) and [Phase D](#phase-d-wait-out-the-unbonding-period): `cast call`, `cast block-number`, explorer reads, and running `src/script/recoverPoolDelegators.ts`.
- Working out the claimable block, the ZIL value of an LST position, other delegators' share, and the list of remaining delegators.
- Preparing the Phase B change on a local branch: only `active: false` and an optional `retirementNotice` on the target pool, with the Phase B.3 checks passing. Pushing the branch and opening a PR is allowed **only** if a human explicitly asked for it in this task.
- Drafting messages for the operator and for delegators, for a human to review and send.
- Writing out, for a human, the exact signing command with placeholders for the signer.
- Producing the status report below.

### Forbidden, even if a human asks

- Asking for, reading, storing or using any private key, mnemonic, keystore password or seed.
- Running `cast send`, `cast wallet`, `z2 unstake`, `z2 withdraw`, or **any** `forge script` from `delegated_staking`, with or without `--broadcast`.
- Merging a PR, creating tags or GitHub releases (a published release starts `cicd-prd.yml`), running `z app sync`, or running `kubectl`, `kustomize` or `helm` against `cd/overlays/production_mainnet/`.
- Deleting a pool definition, or changing any pool field other than `active` / `retirementNotice`.
- Sending messages to operators, delegators or anyone else.
- Deciding timing, amounts or the treasury destination. Those are the Owner's call.

If a human offers a key or asks you to "just sign it", refuse, and instead give them the exact command (Phase C or E) with placeholders so they can run it themselves.

### Stop and ask a human when

- The pool type in `stakingPoolsConfig.ts` does not match on-chain behaviour (for example `getLST()` reverts on a pool marked `LIQUID`).
- The delegator wallet's position is zero before any unstake happened (someone may already have acted).
- `getPendingClaims()` shows entries nobody accounts for.
- Preflight step 4 shows other delegators, and the ticket does not say how they will be informed.
- Any value differs from the values the human gave you. If the human gave you none, ask for them before continuing.

### Status report format

```markdown
## Wind-down status: <pool name> (<pool address>)

- Pool type: LIQUID | NON_LIQUID (config) / verified on-chain: yes | no
- Unbonding period: <blocks>
- Our position: <LST or ZIL> (~<ZIL value>); rewards (non-liquid): <ZIL>
- Other delegators' share: <ZIL> (<count if known>)
- Pending claims: <[readyBlock, ZIL], ...>
- Unstake: <not sent | tx hash, block>
- Claimable at block: <readyBlock> (current block <m>, ~<time> remaining)
- getClaimable(): <ZIL> (target <ZIL>)
- Portal: active | retired (PR <link>, deployed <date>)
- Next human action: <who> must <what>
```
