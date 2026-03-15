# Task: ADMINUI10-023 — Route Guards + Boundaries

## Purpose

Enforce auth and authorization boundaries consistently on route entry.

## Implementation Notes

- Implement guard patterns:
  - unauthenticated => login/unauthenticated state
  - authenticated but unauthorized => forbidden state
- Apply to all routes using route modules and/or a wrapper route.
- Ensure route errors do not leak partial content.

## Acceptance Criteria

- Every admin route is guarded.
- Deep links behave correctly.
