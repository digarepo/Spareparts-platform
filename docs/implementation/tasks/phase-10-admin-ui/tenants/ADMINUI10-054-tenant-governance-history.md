# Task: ADMINUI10-054 — Tenant Governance History (Audit-linked)

## Purpose

Provide a clear governance history for a tenant by linking to audit events.

## Implementation Notes

- Add a "Governance History" section on `/tenants/:tenantId`.
- Display recent governance events affecting this tenant:
  - status changes
  - flag changes
- Each entry links to `/audit/:eventId`.

## Acceptance Criteria

- Governance history is visible to authorized users.
- Entries deep-link to audit detail.
