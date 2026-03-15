# Task: ADMINUI10-003 — API Client + Request Context (Correlation)

## Purpose

Centralize API calls from platform-admin to `apps/api` with consistent auth headers, correlation IDs, and safe error normalization.

## Implementation Notes

- Create `apps/platform-admin/app/lib/api/*`:
  - base URL configuration (env)
  - `fetchJson` wrapper
  - attach access token (from auth facade)
  - attach correlation/request id (client-generated) for traceability
- Normalize error shape for UI:
  - distinguish 401/403/404/429/5xx
  - preserve backend-provided `correlationId` when available
- Do not store secrets in the client.

## Acceptance Criteria

- All queries use the shared API client.
- Errors presented to UI include a support-friendly reference (correlation id when available).
- 401/403 are handled consistently.
