# Task: TENANTUI11-007 — Route Loaders + Query Prefetch Strategy

## Purpose

Use React Router loaders to prefetch key route data while TanStack Query remains the client cache and state source.

## Implementation Notes

- For major routes (dashboard, products list, inventory list, orders list):
  - implement loader that triggers query prefetch
- Ensure loader failures:
  - fail closed
  - show explicit degraded/error states

## Acceptance Criteria

- Major routes benefit from prefetch.
- Loader errors do not leak partial/mis-scoped data.
