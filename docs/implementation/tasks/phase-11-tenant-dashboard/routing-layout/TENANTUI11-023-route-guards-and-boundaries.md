# Task: TENANTUI11-023 — Route Guards + Boundaries (Tenant)

## Purpose

Enforce auth + tenant-scope authorization boundaries consistently on route entry.

## Implementation Notes

- Implement guard patterns:
  - unauthenticated => unauthenticated screen
  - authenticated but unauthorized => forbidden screen
  - tenant context missing/ambiguous => fail-closed screen
- Apply guard to all route modules.

## Acceptance Criteria

- Every tenant route is guarded.
- Deep links to forbidden pages do not reveal partial content.
