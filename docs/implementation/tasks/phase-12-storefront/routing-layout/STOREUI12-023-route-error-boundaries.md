# Task: STOREUI12-023 — Route Error Boundaries

## Purpose

Ensure SSR/CSR route failures render safe error pages without leaking partial state.

## Implementation Notes

- Add route-level error boundaries for:
  - search
  - product detail
  - checkout
  - account
- Ensure 404 renders a dedicated not-found experience.

## Acceptance Criteria

- Errors render consistently on server and client.
- No blank screens.
