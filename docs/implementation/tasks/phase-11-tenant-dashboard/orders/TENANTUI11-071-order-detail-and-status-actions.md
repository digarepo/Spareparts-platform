# Task: TENANTUI11-071 — Order Detail + Status Actions

## Purpose

Provide tenant staff order detail view and allowed order actions.

## Implementation Notes

- Add route module `/orders/:orderId`.
- Display:
  - items for this tenant
  - fulfillment status
  - payment outcome status
  - timeline
- Implement allowed actions (only if backend supports and permission allows):
  - accept/confirm order
  - cancel (bounded and confirmable)
  - update fulfillment state (handoff/shipped) if modeled
- All actions must:
  - be auditable
  - show audit receipt/correlation reference
  - be suppressed in degraded mode

## Acceptance Criteria

- Order detail is tenant-scoped.
- Actions are explicit, confirmable where risky, and auditable.
