# Task: STOREUI12-202 — Cart Staleness + Diff Smoke

## Purpose

Validate cart intent semantics: explicit staleness and user-confirmed reconciliation.

## Implementation Notes

- Add item to cart.
- Simulate price/availability change (mock or test fixture).
- Verify UI:
  - detects mismatch
  - shows explicit diff
  - requires acceptance before checkout

## Acceptance Criteria

- No silent cart correction occurs.
- Customer must explicitly confirm changes.
