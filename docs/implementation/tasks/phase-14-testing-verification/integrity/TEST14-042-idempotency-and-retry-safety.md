# Task: TEST14-042 — Idempotency + Retry Safety

## Purpose

Verify retry safety guarantees (Domain AD): no duplicate commitments, no partial meaning.

## Implementation Notes

- Identify idempotent endpoints:
  - order creation
  - payment attempt creation
  - refund/reversal requests
- Add tests that replay identical intents and verify:
  - single commitment
  - explicit duplicate detection

## Acceptance Criteria

- Replays do not create duplicate orders/payments.
- Partial execution is not externally visible.
