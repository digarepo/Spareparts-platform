# Task: ADMINUI10-100 — Audit Explorer Route

## Purpose

Provide a platform audit explorer consistent with Domain Y: attribution, immutability, and safe filtering.

## Implementation Notes

- Add route module `/audit`.
- Provide filterable table:
  - time range
  - actor
  - action type
  - outcome
  - correlation id
- Link rows to audit detail route.
- Ensure query filters are bounded and validated.

## Acceptance Criteria

- Audit explorer supports filtering via URL search params.
- Results are rendered with stable columns and safe empty states.
