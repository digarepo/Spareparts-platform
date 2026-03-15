# Task: TENANTUI11-004 — API Client + Correlation IDs

## Purpose

Centralize tenant dashboard API calls with consistent auth headers, tenant context, and correlation IDs.

## Implementation Notes

- Create `apps/merchant-dashboard/app/lib/api/*`:
  - base URL configuration
  - `fetchJson` wrapper
  - attach access token
  - attach correlation/request id
- Normalize error shapes for UI (401/403/404/429/5xx).

## Acceptance Criteria

- All queries use shared API client.
- Errors surfaced include correlation reference when available.
