# Task: TEST14-020 — Cross-Tenant Isolation Regression Suite

## Purpose

Continuously verify tenant isolation across all critical read/write paths.

## Implementation Notes

- Add automated tests that attempt:
  - cross-tenant resource reads by guessed IDs
  - cross-tenant list query bypass
  - cross-tenant mutation attempts
- Validate:
  - deny-by-default
  - no existence leaks

## Acceptance Criteria

- Suite covers critical tenant-scoped APIs.
- Failures are deterministic and actionable.
