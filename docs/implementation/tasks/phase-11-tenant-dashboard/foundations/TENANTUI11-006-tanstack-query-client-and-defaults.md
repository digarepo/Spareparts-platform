# Task: TENANTUI11-006 — TanStack Query Client + Defaults

## Purpose

Establish TanStack Query for caching, request dedupe, and consistent loading/error behaviors in tenant dashboard.

## Implementation Notes

- Add TanStack Query provider to app providers.
- Define defaults:
  - conservative retries
  - explicit stale times
  - intentional refetch-on-focus
- Define query key conventions (tenant-scoped keys).

## Acceptance Criteria

- Queries function via TanStack Query provider.
- Query keys are stable and tenant-scoped.
