# Task: RLS-61 — Tenant obligation isolation policies (payments, attempts, refunds)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enforce that tenant staff can only observe payment records for obligations owned by their tenant, without granting them authority to mutate financial outcomes.

## Implementation Location

* packages/db/rls/payments.sql

## Implementation Notes

* SELECT policies:
  * tenants may SELECT payments where `tenant_id = current_tenant_id()`
  * tenants may SELECT attempts/refunds/reversals linked to those payments
* INSERT/UPDATE policies:
  * tenants must not be able to create payment attempts, provider events, or modify payment status directly.
  * any tenant-initiated refund requests (if supported) should write into a separate request table, not mutate financial records.

## Acceptance Criteria

* Tenants can read only their tenant-scoped payment data.
* Tenants cannot mutate core payment records.

## Dependencies

* RLS-60

## Estimated Effort

45–90 minutes
