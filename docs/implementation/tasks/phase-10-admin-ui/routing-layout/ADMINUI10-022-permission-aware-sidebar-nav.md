# Task: ADMINUI10-022 — Permission-aware Sidebar Navigation

## Purpose

Render a sidebar navigation that only shows routes the current user may view.

## Implementation Notes

- Implement `AdminSidebarNav`:
  - accepts current permission set
  - filters nav items
  - uses `NavLink` active styles
- Hide entire nav sections when empty.
- Never render a link to a route requiring higher privileges.

## Acceptance Criteria

- Nav items match permissions (fail-closed).
- Active route state is visually clear.
