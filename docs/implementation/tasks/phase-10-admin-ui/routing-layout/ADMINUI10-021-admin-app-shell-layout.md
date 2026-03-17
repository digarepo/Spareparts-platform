# Task: ADMINUI10-021 — Admin App Shell Layout

## Purpose

Implement the admin application shell (header + sidebar + content) used by all admin pages.

## Implementation Notes

- Create `AdminAppShell` layout component.
- Must include:
  - Left sidebar navigation
  - Top header bar
  - Main content outlet area
- Header must always display a non-dismissable "Platform Scope" indicator.
- Ensure responsive behavior:
  - sidebar collapses on small screens

## Acceptance Criteria

- All admin routes render within the shell.
- Layout is responsive.
- Platform scope indicator is always visible.
