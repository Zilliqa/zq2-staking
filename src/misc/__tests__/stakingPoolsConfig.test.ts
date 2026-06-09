// ABOUTME: Unit tests for the soft-delete (active flag) filtering decision
// ABOUTME: Covers isStakingPoolActive + isPoolVisibleInStakeSelector for DEVOPS-365
import { describe, expect, it } from "vitest"
import {
  DEFAULT_RETIREMENT_NOTICE,
  getPoolRetirementNotice,
  isPoolVisibleInStakeSelector,
  isStakingPoolActive,
  StakingPoolDefinition,
  StakingPoolType,
} from "@/misc/stakingPoolsConfig"

const makeDefinition = (
  overrides: Partial<StakingPoolDefinition> = {}
): StakingPoolDefinition => ({
  id: "test-pool",
  name: "Test Pool",
  poolType: StakingPoolType.NORMAL,
  address: "0x0000000000000000000000000000000000000000",
  tokenAddress: "0x0000000000000000000000000000000000000000",
  tokenDecimals: 18,
  tokenSymbol: "ZIL",
  iconUrl: "/static/test.webp",
  minimumStake: 100000000000000000000n,
  withdrawPeriodInMinutes: 10080,
  ...overrides,
})

describe("isStakingPoolActive", () => {
  it("treats a pool with no active field as active (default true)", () => {
    expect(isStakingPoolActive(makeDefinition())).toBe(true)
  })

  it("treats active: true as active", () => {
    expect(isStakingPoolActive(makeDefinition({ active: true }))).toBe(true)
  })

  it("treats active: false as inactive (retired)", () => {
    expect(isStakingPoolActive(makeDefinition({ active: false }))).toBe(false)
  })
})

describe("isPoolVisibleInStakeSelector", () => {
  it("shows an active pool regardless of bonded stake", () => {
    expect(isPoolVisibleInStakeSelector(makeDefinition(), undefined)).toBe(true)
    expect(isPoolVisibleInStakeSelector(makeDefinition(), 0n)).toBe(true)
  })

  it("hides a retired pool when the wallet has no bonded stake", () => {
    const retired = makeDefinition({ active: false })
    expect(isPoolVisibleInStakeSelector(retired, undefined)).toBe(false)
    expect(isPoolVisibleInStakeSelector(retired, 0n)).toBe(false)
  })

  it("keeps a retired pool when the wallet still has a bonded stake (unstake path)", () => {
    expect(
      isPoolVisibleInStakeSelector(makeDefinition({ active: false }), 350n)
    ).toBe(true)
  })
})

describe("getPoolRetirementNotice", () => {
  it("returns null for an active pool", () => {
    expect(getPoolRetirementNotice(makeDefinition())).toBeNull()
    expect(getPoolRetirementNotice(makeDefinition({ active: true }))).toBeNull()
  })

  it("returns the default notice for a retired pool with no custom copy", () => {
    expect(getPoolRetirementNotice(makeDefinition({ active: false }))).toBe(
      DEFAULT_RETIREMENT_NOTICE
    )
  })

  it("returns the custom notice for a retired pool that sets one", () => {
    const def = makeDefinition({
      active: false,
      retirementNotice: "r3to has wound down. Withdraw via the Claim tab.",
    })
    expect(getPoolRetirementNotice(def)).toBe(
      "r3to has wound down. Withdraw via the Claim tab."
    )
  })
})

describe("selector filtering vs unfiltered merge paths", () => {
  it("only narrows the stake selector; the raw list still contains retired pools", () => {
    const combined = [
      { definition: makeDefinition({ id: "active" }), bonded: undefined },
      {
        definition: makeDefinition({ id: "retired-empty", active: false }),
        bonded: undefined,
      },
      {
        definition: makeDefinition({ id: "retired-bonded", active: false }),
        bonded: 350n,
      },
    ]

    const stakeSelector = combined.filter((p) =>
      isPoolVisibleInStakeSelector(p.definition, p.bonded)
    )

    // Selector hides only the retired pool with no bonded stake.
    expect(stakeSelector.map((p) => p.definition.id)).toEqual([
      "active",
      "retired-bonded",
    ])

    // The raw list (used by unstake / claim / reward merge paths) is untouched.
    expect(combined.map((p) => p.definition.id)).toContain("retired-empty")
  })
})
