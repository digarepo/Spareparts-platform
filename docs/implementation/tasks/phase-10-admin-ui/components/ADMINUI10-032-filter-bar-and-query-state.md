# Task: ADMINUI10-032 — Filter Bar + Query State

## Purpose

Standardize filters/search controls used by list pages (tenants, staff, audit).

## Implementation Notes

- Implement `AdminFilterBar` and primitives:
  - text search
  - select filters
  - date range (where relevant)
- Keep filter state reflected in URL search params.

## Acceptance Criteria

- Filters are shareable via URL.
- List pages can reuse the filter bar.
