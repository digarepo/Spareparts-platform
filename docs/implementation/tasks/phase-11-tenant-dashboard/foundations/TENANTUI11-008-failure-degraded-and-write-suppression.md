# Task: TENANTUI11-008 — Failure UX, Degraded Mode, and Write Suppression

## Purpose

Implement seller failure semantics (Domain AB): failures degrade capability, unsafe writes are suppressed, no fabricated data.

## Implementation Notes

- Implement shared states:
  - `UnauthenticatedState`
  - `ForbiddenState`
  - `AppErrorState`
  - `DegradedDataBanner`
- Implement a central write-suppression rule:
  - when tenant context unknown, contracts invalid, or key dependencies degraded => disable/omit mutation controls

## Acceptance Criteria

- Under uncertainty, mutation controls are suppressed.
- Degraded states are explicit and non-ambiguous.
