# Task: STOREUI12-004 — TanStack Query Client + SSR Prefetch

## Purpose

Use TanStack Query for caching and dedupe while supporting SSR data prefetch for SEO-critical routes.

## Implementation Notes

- Add QueryClient provider and defaults.
- Define stable query key conventions.
- For SSR routes (home, search, product detail):
  - prefetch queries via loaders and hydrate on client
- Ensure no leaking of user-private data into shared SSR output.

## Acceptance Criteria

- SSR renders with prefetched data for SEO routes.
- Client hydration does not refetch unnecessarily.
