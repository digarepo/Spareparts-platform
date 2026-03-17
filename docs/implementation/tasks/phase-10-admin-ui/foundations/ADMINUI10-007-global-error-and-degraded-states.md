# Task: ADMINUI10-007 — Global Error UX + Degraded States

## Purpose

Implement consistent failure semantics (Domain Y): fail-closed, explicit degraded indicators, and isolation of failures.

## Implementation Notes

- Define shared components:
  - `AppErrorState`
  - `ForbiddenState`
  - `UnauthenticatedState`
  - `DegradedDataBanner` (partial/unavailable/stale)
- Ensure route-level error boundaries render safe content.
- Ensure sensitive pages do not display stale privileged data after auth loss.

## Acceptance Criteria

- 401/403 render the correct state.
- API outages show degraded states with clear messaging.
- No silent fallbacks or guessed data.
