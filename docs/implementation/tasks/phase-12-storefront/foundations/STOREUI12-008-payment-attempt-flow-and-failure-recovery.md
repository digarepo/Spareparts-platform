# Task: STOREUI12-008 — Payment Attempt Flow + Failure Recovery

## Purpose

Implement payment attempt UX consistent with payment authority/integrity (Domains R/S).

## Implementation Notes

- Payment attempts:
  - initiated by customer
  - attached to exactly one order obligation
- Failure UX must:
  - treat payment failure as a terminal payment outcome
  - not imply order cancellation
  - provide safe next actions (retry payment where permitted)
- Do not display raw payment method details.

## Acceptance Criteria

- Payment failures are explicit and recoverable when allowed.
- UI never infers order truth from payment attempts.
