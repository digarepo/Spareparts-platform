# Task: RLS-73 — Platform supervisor observability policy (read-only)
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow platform supervisory staff to observe fulfillment and shipment state across tenants for support and incident response, without performing tenant actions.

## Implementation Location

* packages/db/rls/fulfillment-delivery.sql

## Implementation Notes

* Platform supervisor:
  * SELECT across tenants
  * no operational writes to tenant-owned fulfillment/shipment

## Acceptance Criteria

* Platform can read across tenants.
* Policies are read-only for operational tables.

## Dependencies

* RLS-70

## Estimated Effort

30–60 minutes
