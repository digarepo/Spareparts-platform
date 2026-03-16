# Task: STOREUI12-203 — Payment Failure + Recovery Smoke

## Purpose

Validate payment failure semantics: explicit failure, no implied order cancellation, safe retry.

## Implementation Notes

- Simulate a payment failure outcome.
- Verify UI:
  - routes to `/checkout/failure`
  - explains order may still exist
  - offers safe actions (retry/return to cart) when permitted

## Acceptance Criteria

- Failure messaging is explicit.
- UI does not imply order cancellation.
