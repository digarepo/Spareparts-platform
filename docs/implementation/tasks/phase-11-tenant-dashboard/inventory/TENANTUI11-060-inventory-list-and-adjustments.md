# Task: TENANTUI11-060 — Inventory List + Adjustments

## Purpose

Allow tenant staff to view current stock and perform inventory adjustments within tenant scope.

## Implementation Notes

- Add route module `/inventory`.
- Render inventory table:
  - product
  - SKU
  - on-hand
  - reserved (if supported)
  - available
- Provide adjustment workflow:
  - increase/decrease
  - reason code
  - confirmation dialog
  - audit receipt
- Suppress adjustments in degraded mode.

## Acceptance Criteria

- Inventory list renders.
- Adjustments are permission-gated, confirmable, and auditable.
