# Task: STOREUI12-033 — Cart Line Items + Tenant Grouping

## Purpose

Render cart contents grouped by tenant seller with clear per-seller subtotals and overall totals.

## Implementation Notes

Implement components:
- `CartLineItem`
- `CartTenantGroup`
- `CartSummary`

Rules (Domain N):
- cart is intent; allow staleness
- never silently adjust; reconciliation must be explicit

## Acceptance Criteria

- Cart visually groups items per tenant.
- Totals are clearly broken down.
