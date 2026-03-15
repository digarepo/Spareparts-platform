# Task: RLS-042 — Create tenant payment isolation policy
Blueprint: Domain Q (Payment Model)
Phase: 06 Payments

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure tenants can only access their own payments.

## Implementation Location

packages/db/rls/payments.sql

## Implementation Notes

* Policy using tenant_id

## Acceptance Criteria

* tenant isolation enforced

## Dependencies

RLS-041

## Estimated Effort

10 minutes
