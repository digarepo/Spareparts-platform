# Task: TENANTUI11-032 — Filter Bar + URL Search Params State

## Purpose

Standardize list page filtering and ensure filters are shareable/bookmarkable.

## Implementation Notes

- Implement `TenantFilterBar`:
  - text search
  - select filters
  - date range for orders/audit
- Reflect state in URL search params.

## Acceptance Criteria

- Filters persist in URL and restore on reload.
