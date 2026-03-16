# Task: ADMINUI10-102 — Audit Saved Views

## Purpose

Enable users to save frequently used audit filter configurations.

## Implementation Notes

- On `/audit`, implement saved views:
  - save current filter set with a name
  - list saved views
  - apply a saved view
  - delete a saved view
- Saved views must be scoped appropriately (platform staff scope).

## Acceptance Criteria

- Users can save/apply/delete views.
- Saved views do not allow unbounded or unsafe queries.
