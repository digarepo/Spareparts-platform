# Task: OBS15-061 — No Impersonation + Break-glass Boundaries

## Purpose

Prevent operational tooling from becoming an implicit authority path (Domain AE).

## Implementation Notes

- Explicitly forbid:
  - impersonation of tenants/customers by operators
  - “support access” that bypasses IAM
  - production-only shortcuts
- If a break-glass process exists, it must:
  - be explicitly governed
  - be audited
  - not bypass domain invariants

## Acceptance Criteria

- Operational tooling cannot impersonate users.
- Any exceptional access is governed and auditable.
