# Task: TENANTUI11-101 — Staff Invite + Role Assignments (Tenant)

## Purpose

Allow tenant admins to invite tenant staff and manage tenant-scoped roles.

## Implementation Notes

- Add `/staff/:staffId` detail route.
- Add invite workflow on `/staff`.
- Role assignments must:
  - be tenant-scoped
  - be permission-gated
  - be auditable
  - show audit receipt
- Ensure no cross-scope role assignments are possible.

## Acceptance Criteria

- Tenant staff can be invited/managed by authorized tenant admins.
- Actions are explicit and auditable.
