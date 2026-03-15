# Task: TENANTUI11-022 — Permission-aware Sidebar Navigation

## Purpose

Render navigation that only exposes pages the tenant staff member is permitted to view.

## Implementation Notes

- Implement `TenantSidebarNav`:
  - accepts permission set
  - filters nav items (fail-closed)
  - uses `NavLink` active styling
- Hide entire nav groups when empty.

## Acceptance Criteria

- Sidebar links align with permissions.
- No link renders for forbidden routes.
