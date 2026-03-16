# Task: ADMINUI10-051 — Tenant Detail Route (Read-only)

## Purpose

Provide platform admins a read-only tenant detail page for observability and compliance context.

## Implementation Notes

- Add route module `/tenants/:tenantId`.
- Show sections:
  - tenant metadata (non-sensitive)
  - status + governance flags
  - aggregated stats (catalog/order/payment/search as available)
  - related audit events filter (link to audit explorer)
- Ensure data is redacted to platform-safe envelope (no customer PII).

## Acceptance Criteria

- Tenant detail renders without exposing tenant business operations.
- Degraded banner shows when partial data.
