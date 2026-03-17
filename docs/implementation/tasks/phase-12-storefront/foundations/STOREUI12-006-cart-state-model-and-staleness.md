# Task: STOREUI12-006 — Cart State Model + Staleness (Intent)

## Purpose

Implement cart semantics as customer intent (Domain N): ephemeral, non-binding, multi-tenant capable, and potentially stale.

## Implementation Notes

- Implement cart state model:
  - supports multiple tenants in one cart
  - line items store observed price snapshot
- Staleness rules:
  - cart may become stale; never silently correct
  - show explicit diff when price/availability changes
  - provide user-confirmed reconciliation

## Acceptance Criteria

- Cart groups items by tenant.
- Staleness is explicit and reconciliation requires customer confirmation.
