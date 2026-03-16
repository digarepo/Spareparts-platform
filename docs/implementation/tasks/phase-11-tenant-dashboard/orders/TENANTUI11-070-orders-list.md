# Task: TENANTUI11-070 — Orders List (Tenant Portion)

## Purpose

Allow tenant staff to view orders relevant to their tenant (tenant portion only).

## Implementation Notes

- Add route module `/orders`.
- Filters:
  - status
  - date range
  - search by order id / customer reference (non-PII)
- Columns:
  - order id
  - status
  - created at
  - total (tenant portion)
  - payment status (tenant-observable)

## Acceptance Criteria

- Orders list is tenant-scoped and permission-gated.
- No customer PII is displayed unless explicitly permitted.
