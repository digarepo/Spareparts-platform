# Task: STOREUI12-002 — API Client + Correlation IDs

## Purpose

Centralize Storefront API calls with consistent headers and correlation IDs.

## Implementation Notes

- Implement `apps/storefront/app/lib/api/*`:
  - base URL config
  - `fetchJson` wrapper
  - attach correlation/request id
- Attach auth token only when user is authenticated (accounts optional).
- Normalize error shapes (401/403/404/429/5xx).

## Acceptance Criteria

- Storefront data access uses the shared API client.
- Errors surface a support-friendly correlation reference when available.
