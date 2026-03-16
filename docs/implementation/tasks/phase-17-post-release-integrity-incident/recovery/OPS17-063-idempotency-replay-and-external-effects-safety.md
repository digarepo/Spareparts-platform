# Task: OPS17-063 — Idempotency/Replay + External Effects Safety

## Purpose

Ensure recovery and retries do not duplicate commitments or replay external effects (Domain AD).

## Implementation Notes

- Verify idempotency keys on commitment endpoints.
- Explicitly prevent replay of external side effects:
  - payments
  - notifications

## Acceptance Criteria

- Replays do not duplicate orders/payments.
- External side effects are not re-executed during recovery.
