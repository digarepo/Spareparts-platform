# Task: TEST14-082 — SSR TTFB + Cache Smoke

## Purpose

Verify storefront SSR performance and caching does not leak private data.

## Implementation Notes

- Test SSR routes:
  - home
  - search
  - PDP
- Measure TTFB and verify caching headers.
- Ensure authenticated content is never cached as public.

## Acceptance Criteria

- SSR performance baseline exists.
- No private data is cached publicly.
