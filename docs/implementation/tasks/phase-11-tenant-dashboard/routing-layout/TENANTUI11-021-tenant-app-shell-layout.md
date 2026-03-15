# Task: TENANTUI11-021 — Tenant App Shell Layout

## Purpose

Implement the tenant dashboard shell (header + sidebar + content) used by all seller routes.

## Implementation Notes

- Create `TenantAppShell` layout component.
- Must include:
  - sidebar navigation
  - top header with active tenant context indicator
  - main content outlet
- Ensure responsive behavior (sidebar collapses on small screens).

## Acceptance Criteria

- All tenant routes render within the shell.
- Active tenant context is always visible.
