# Task: ADMINUI10-005 — TanStack Query Client + Defaults

## Purpose

Establish TanStack Query for caching, request dedupe, and consistent loading/error behaviors.

## Implementation Notes

- Add TanStack Query provider to the app root providers.
- Define query defaults appropriate for admin:
  - retries: conservative
  - stale time: explicit per-query
  - refetch-on-focus: intentional (not accidental)
- Provide standard query key conventions.

## Acceptance Criteria

- Queries function via TanStack Query provider.
- Query keys are stable and consistent.
