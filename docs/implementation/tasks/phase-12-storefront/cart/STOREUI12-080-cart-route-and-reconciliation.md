# Task: STOREUI12-080 — Cart Route + Reconciliation

## Purpose

Implement the cart as customer intent with multi-tenant grouping and explicit staleness reconciliation (Domain N).

## Implementation Notes

- Add route module `/cart`.
- Display:
  - grouped by tenant
  - per-tenant subtotal + overall total
- Implement reconciliation step:
  - validate current product/price snapshots
  - show diffs (price/availability)
  - require explicit acceptance to proceed

## Acceptance Criteria

- Cart shows per-tenant breakdown.
- Stale changes are explicit and require confirmation.
