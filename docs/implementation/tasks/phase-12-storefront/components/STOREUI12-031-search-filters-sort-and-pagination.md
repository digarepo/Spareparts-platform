# Task: STOREUI12-031 — Search Filters, Sort, Pagination

## Purpose

Provide reusable search and browse controls for advanced discovery.

## Implementation Notes

Implement components:
- `SearchFilters`
- `SearchSort`
- `Pagination`

Rules:
- Search is discovery-only (Domain T).
- Filter state must be reflected in URL search params.

## Acceptance Criteria

- Filters/sort update URL params.
- Pagination works with SSR + hydration.
