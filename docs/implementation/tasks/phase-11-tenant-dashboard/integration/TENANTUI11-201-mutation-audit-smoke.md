# Task: TENANTUI11-201 — Mutation + Audit Smoke

## Purpose

Validate that tenant mutations produce auditable outcomes and UI surfaces an audit receipt.

## Implementation Notes

- Execute at least one mutation per domain:
  - catalog/product update
  - inventory adjustment
  - order action (e.g., cancel/confirm) if supported
- Verify:
  - explicit confirmation where required
  - outcome shown with correlation/audit reference
  - audit event appears in tenant audit log and detail

## Acceptance Criteria

- Mutations are auditable and traceable.
- UI shows receipts consistently.
