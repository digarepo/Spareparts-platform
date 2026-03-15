# Task: TENANTUI11-100 — Tenant Staff Directory

## Purpose

Allow tenant admins to view tenant staff within the same tenant.

## Implementation Notes

- Add route module `/staff`.
- Table columns:
  - name/email (as permitted)
  - role(s)
  - status
  - last login (if available)

## Acceptance Criteria

- Staff list is tenant-scoped.
- Permission-gated.
