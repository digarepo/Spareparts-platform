# Task: ADMINUI10-050 — Tenants List Route (Read-only)

## Purpose

Provide a platform-scope, read-only listing of tenants for observability and governance context.

## Implementation Notes

- Add route module `/tenants`.
- Render list with `AdminDataTable`.
- Include filters in URL:
  - status
  - created date range
  - text search (name/id)
- Add minimal columns:
  - tenant name
  - tenant id
  - status
  - created at
- Row click navigates to tenant detail.

## Acceptance Criteria

- Tenants list renders with filters.
- No tenant operational actions exist.
