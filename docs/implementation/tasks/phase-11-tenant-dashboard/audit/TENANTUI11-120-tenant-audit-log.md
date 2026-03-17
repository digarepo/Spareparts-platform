# Task: TENANTUI11-120 — Tenant Audit Log

## Purpose

Provide tenant staff visibility into auditable actions for their tenant only (Domain AB).

## Implementation Notes

- Add route module `/audit`.
- Filterable table:
  - time range
  - actor
  - domain (catalog/inventory/order/payment)
  - outcome
  - correlation id
- Ensure audit visibility is tenant-only.

## Acceptance Criteria

- Audit log is tenant-scoped.
- Filtering is bounded and reflected in URL.
