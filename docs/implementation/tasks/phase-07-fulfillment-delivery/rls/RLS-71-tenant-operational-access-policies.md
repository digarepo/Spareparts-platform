# Task: RLS-71 — Tenant operational access policies (fulfillment/shipment)
Blueprint: Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow tenants to operate on their own fulfillment and shipment records while preventing cross-tenant access.

## Implementation Location

* packages/db/rls/fulfillment-delivery.sql

## Implementation Notes

* Tenants may:
  * SELECT their fulfillments/shipments
  * INSERT fulfillments/shipments in their tenant scope
  * UPDATE via allowed state transitions (or restrict UPDATE and rely on controlled procedures)
* Tenants must not:
  * access other tenants’ fulfillment/shipment records

## Acceptance Criteria

* Tenant read/write is scoped by `tenant_id`.
* Cross-tenant access is denied.

## Dependencies

* RLS-70

## Estimated Effort

45–90 minutes
