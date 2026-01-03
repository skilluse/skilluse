# Interactive Upgrade Selection

## Problem

Currently, `skilluse upgrade` automatically upgrades all skills with available updates:

```bash
$ skilluse upgrade
Checking for updates (1/3)...
Checking for updates (2/3)...
Checking for updates (3/3)...
Upgrading skills...
✔ commit
✔ review-pr
✔ test-runner
✓ Upgraded 3 skill(s)
```

Users have no control over which skills to upgrade. They may want to:
- Skip certain updates (breaking changes, not ready to upgrade)
- Review what changed before upgrading
- Upgrade only specific skills

## Solution

Add interactive multi-select UI when updates are available.

```bash
$ skilluse upgrade

Checking for updates...

Found 3 skills with updates available:

  ┌─────────────────────────────────────────────────┐
  │ Select skills to upgrade:                       │
  │                                                 │
  │ [x] commit      (abc1234 → def5678)            │
  │ [x] review-pr   (1112222 → 3334444)            │
  │ [ ] test-runner (aaa1111 → bbb2222)            │
  │                                                 │
  │ Space: toggle  Enter: confirm  A: all  Esc: cancel │
  └─────────────────────────────────────────────────┘

Upgrading 2 skills...
✓ commit
✓ review-pr

✓ Upgraded 2 skill(s)
```

## Design

### Default behavior: Interactive

Show multi-select when updates are found. All skills are pre-selected by default.

### `--yes` flag: Auto-upgrade

Skip the selection UI and upgrade all (current behavior).

```bash
skilluse upgrade --yes   # Auto-upgrade all without prompt
```

### Single skill: Direct upgrade

When specifying a skill name, no selection needed.

```bash
skilluse upgrade commit   # Upgrade specific skill directly
```

## Implementation

### Changes to `upgrade.tsx`

1. After finding upgrades, show `MultiSelect` component
2. Pre-select all items by default
3. On confirm, upgrade only selected skills
4. Add `--yes` option to schema

```typescript
export const options = z.object({
  yes: z
    .boolean()
    .default(false)
    .describe("Skip selection and upgrade all"),
});
```

### New state for selection

```typescript
type UpgradeState =
  | { phase: "checking" }
  | { phase: "checking_updates"; current: number; total: number }
  | { phase: "no_updates" }
  | { phase: "select"; upgrades: UpgradeInfo[] }  // New phase
  | { phase: "upgrading"; upgrades: UpgradeInfo[]; current: number }
  | { phase: "success"; upgraded: string[] }
  | { phase: "error"; message: string };
```

## Acceptance Criteria

- [ ] `upgrade` shows multi-select UI when updates are available
- [ ] All skills pre-selected by default
- [ ] User can toggle individual skills with Space
- [ ] User can select/deselect all with 'A' key
- [ ] Enter confirms selection and starts upgrade
- [ ] Esc cancels without upgrading
- [ ] `upgrade --yes` auto-upgrades all (current behavior)
- [ ] `upgrade <name>` upgrades specific skill directly (no change)
- [ ] Shows short commit SHA for each skill (abc1234 → def5678)

## Out of Scope

- Showing what changed between versions (changelog)
- Version numbers (currently using commit SHA)
- Local caching of skill metadata
