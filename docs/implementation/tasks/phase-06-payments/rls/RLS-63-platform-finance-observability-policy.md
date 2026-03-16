# Task: RLS-63 — Platform finance observability policy (read-only)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow platform finance/security staff to observe payment and provider-event records across tenants for audit and incident response, without granting mutation rights.

## Implementation Location

* packages/db/rls/payments.sql

## Implementation Notes

* Create a platform-finance role policy:
  * SELECT on all payment tables
  * no INSERT/UPDATE/DELETE except for explicit platform-owned processing tables if needed

## Acceptance Criteria

* Platform finance can read across tenants.
* Policies are read-only for core financial truth tables.

## Dependencies

* RLS-60

## Estimated Effort

30–60 minutes
