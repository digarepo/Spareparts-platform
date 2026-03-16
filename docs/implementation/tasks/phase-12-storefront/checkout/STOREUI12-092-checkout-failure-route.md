# Task: STOREUI12-092 — Checkout Failure Route

## Purpose

Provide safe and explicit payment failure UX consistent with payment integrity (Domains R/S).

## Implementation Notes

- Add route module `/checkout/failure`.
- Explain:
  - payment attempt failed
  - order may still exist
- Provide safe actions (only if supported):
  - retry payment
  - update payment method
  - return to cart

## Acceptance Criteria

- Failure page is explicit and helpful.
- Does not imply order cancellation.
