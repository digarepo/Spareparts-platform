# Task: RLS-60 — Enable RLS on payments tables (fail-closed)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable row-level security for all payments-related tables so financial isolation is enforced at the database layer.

## Implementation Location

* packages/db/rls/payments.sql

## Implementation Notes

* Enable RLS on:
  * payments
  * payment_attempts
  * payment_provider_events (webhook inbox)
  * payment_refunds
  * payment_reversals
* Ensure policies default to deny.

## Acceptance Criteria

* RLS enabled on all payments tables.
* No table remains accessible without a policy.

## Dependencies

* PRISMA-60..63

## Estimated Effort

30–60 minutes
