# Task: TENANTUI11-110 — Tenant Settings

## Purpose

Provide a bounded tenant settings surface for tenant-owned configuration.

## Implementation Notes

- Add route module `/settings`.
- Settings must be explicitly tenant-owned (no platform settings).
- Candidate settings (only if backend supports):
  - store profile (name, description)
  - notification preferences
  - branding assets
- All mutations must be auditable and suppressed in degraded mode.

## Acceptance Criteria

- Settings page is permission-gated.
- Mutations are explicit and auditable.
