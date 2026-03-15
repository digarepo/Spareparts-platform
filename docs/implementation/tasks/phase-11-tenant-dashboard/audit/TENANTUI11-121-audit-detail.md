# Task: TENANTUI11-121 — Tenant Audit Detail

## Purpose

Provide a detailed, read-only view of a tenant audit event.

## Implementation Notes

- Add route module `/audit/:eventId`.
- Display:
  - actor
  - tenant context
  - timestamp
  - intent vs outcome
  - correlation id
  - targeted entities

## Acceptance Criteria

- Audit detail is tenant-scoped and permission-gated.
- Attribution is consistent with conventions.
