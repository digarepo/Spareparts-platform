# Task: TENANTUI11-051 — Product Detail + Edit

## Purpose

Allow authorized tenant staff to view and edit a product.

## Implementation Notes

- Add route module `/products/:productId`.
- Sections:
  - product details
  - pricing
  - media (if supported)
  - status controls
- Mutations must:
  - be permission-gated
  - validate inputs
  - show audit receipt/correlation reference
  - be suppressed in degraded mode

## Acceptance Criteria

- Product detail renders for authorized users.
- Edits are explicit and auditable.
