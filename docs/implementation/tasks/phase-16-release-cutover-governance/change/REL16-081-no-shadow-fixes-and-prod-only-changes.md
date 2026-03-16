# Task: REL16-081 — No Shadow Fixes + No Prod-only Changes

## Purpose

Prevent production-only logic, manual ungoverned fixes, and environment divergence (Domain AG; aligns with AE/AF).

## Implementation Notes

- Explicitly forbid:
  - production-only fixes
  - manual data edits outside governance
  - temporary workarounds that persist
- Document how exceptions are handled (should be effectively none).

## Acceptance Criteria

- Policy is explicit and reviewable.
- Change process prevents untracked fixes.
