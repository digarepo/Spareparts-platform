# Task: TEST14-062 — Platform Admin Governance E2E

## Purpose

Validate platform governance workflows without cross-scope leakage.

## Implementation Notes

- E2E scenarios (platform staff):
  - sign in
  - view tenant directory
  - perform governance action (suspend/reinstate)
  - verify audit linkage

## Acceptance Criteria

- Governance actions are permission-gated.
- Audit receipts are present.
