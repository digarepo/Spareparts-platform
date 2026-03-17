# Task: ADMINUI10-004 — Contract Validation Boundary (Zod)

## Purpose

Validate API responses at the UI boundary using shared contracts to avoid rendering unsafe/unknown shapes.

## Implementation Notes

- Introduce contract validation helpers in `apps/platform-admin/app/lib/contracts/*`.
- For each API response used in the admin UI:
  - validate with a Zod schema from `packages/contracts` (or define admin-specific view schemas if needed)
  - on validation failure: surface a safe "data unavailable" state (fail-closed) and log diagnostic metadata.

## Acceptance Criteria

- Critical pages do not render unvalidated data.
- Validation failures produce a clear degraded UI state.
