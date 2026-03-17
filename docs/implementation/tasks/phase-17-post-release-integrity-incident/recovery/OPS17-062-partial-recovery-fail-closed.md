# Task: OPS17-062 — Partial Recovery: Fail-closed Semantics

## Purpose

Define how the system behaves if partial recovery is unavoidable (Domain AD).

## Implementation Notes

- Restored components must be explicitly identified.
- Unrestored components must fail closed.
- Fabricated or inferred data is forbidden.

## Acceptance Criteria

- Partial recovery behavior is explicit.
- Safety overrides availability.
