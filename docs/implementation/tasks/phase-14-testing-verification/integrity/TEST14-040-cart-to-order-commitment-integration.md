# Task: TEST14-040 — Cart → Order Commitment Integration

## Purpose

Verify cart intent semantics and explicit order commitment (Domain N).

## Implementation Notes

- Test flow:
  - create cart intent
  - mutate cart
  - simulate staleness (price/availability change)
  - require explicit reconciliation
  - commit order only after confirmation

## Acceptance Criteria

- No silent cart correction.
- Order is created only through explicit commit.
