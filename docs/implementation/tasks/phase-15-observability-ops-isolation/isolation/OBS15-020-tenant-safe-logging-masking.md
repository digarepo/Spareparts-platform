# Task: OBS15-020 — Tenant-safe Logging + Masking

## Purpose

Ensure observability cannot become a cross-tenant leakage channel (Domain AE).

## Implementation Notes

- Define a tenant-safe logging policy:
  - always include `tenantId` only when operating in tenant scope
  - never log other tenants' identifiers or aggregates in tenant-scoped logs
  - mask customer identifiers in tenant-scoped contexts unless explicitly permitted
- Ensure logs do not expose payment instrument details.

## Acceptance Criteria

- Tenant-scoped logs are safe to share with tenant operators.
- No cross-tenant identifiers appear in tenant-scoped logs.
