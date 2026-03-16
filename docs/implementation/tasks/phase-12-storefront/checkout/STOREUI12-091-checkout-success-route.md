# Task: STOREUI12-091 — Checkout Success Route

## Purpose

Provide a confirmation page after successful order + payment flow.

## Implementation Notes

- Add route module `/checkout/success`.
- Display:
  - order id
  - summary
  - next steps
  - link to order detail (if available)

## Acceptance Criteria

- Success page renders safely.
- Does not leak private data when accessed without auth.
