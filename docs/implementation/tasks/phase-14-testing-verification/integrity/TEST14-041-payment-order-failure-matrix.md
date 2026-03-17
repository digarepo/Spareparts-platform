# Task: TEST14-041 — Payment/Order Failure Matrix

## Purpose

Verify payment-order integrity and failure semantics (Domain S).

## Implementation Notes

- Define a matrix of scenarios:
  - payment success
  - payment failure (terminal)
  - payment retry allowed vs not allowed
  - timeouts/unknown outcomes
- Assert:
  - payment outcomes do not rewrite order truth
  - refunds/reversals are explicit

## Acceptance Criteria

- All scenarios have deterministic expected outcomes.
- No scenario results in implied order cancellation.
