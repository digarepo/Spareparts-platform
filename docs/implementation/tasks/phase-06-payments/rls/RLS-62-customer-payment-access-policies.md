# Task: RLS-62 — Customer access policies (own payments only)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure customers can only view payments tied to their own identity and cannot access other customers’ financial attempts.

## Implementation Location

* packages/db/rls/payments.sql

## Implementation Notes

* SELECT policies:
  * customers may SELECT payments where `customer_id = current_customer_id()`
  * for multi-tenant orders, this still returns records scoped per tenant obligation but tied to the same customer.
* Customers must not be able to read raw provider events or internal processing errors.

## Acceptance Criteria

* Customer reads are scoped to their own `customer_id`.
* Sensitive provider inbox data is not customer-readable.

## Dependencies

* RLS-60

## Estimated Effort

45–90 minutes
