# Task: ADMINUI10-006 — React Router Loaders + Query Prefetch Strategy

## Purpose

Use route loaders to prefetch key data for routes while using TanStack Query as the cache and source-of-truth for client state.

## Implementation Notes

- For major routes (dashboard, tenants list, tenant detail, audit explorer):
  - implement a loader that triggers query prefetch
  - ensure loader failures are mapped to route error boundaries safely
- Keep loaders read-only.

## Acceptance Criteria

- Major routes load with prefetch behavior (reduced UI jank).
- Loader failures do not leak partial privileged data.
