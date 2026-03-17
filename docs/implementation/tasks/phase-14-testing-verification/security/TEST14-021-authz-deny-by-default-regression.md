# Task: TEST14-021 — AuthZ Deny-by-Default Regression

## Purpose

Prove the deny-by-default posture for authorization (Domains C/F).

## Implementation Notes

- Add tests for missing/ambiguous inputs:
  - missing scope
  - missing identity
  - missing permission
  - mismatched scope vs identity category
- Ensure the system denies access without side effects.

## Acceptance Criteria

- All ambiguous/missing authz inputs result in denial.
- No partial execution occurs.
