# Task: RLS-91 — Tenant search config isolation policy
Blueprint: Domain U (tenant isolation), Domain V (governance authority)
Phase: 09 Search

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Ensure tenant-scoped search configuration is readable/mutable only within the owning tenant scope, and cannot be used to manipulate global ranking.

## Implementation Location

* packages/db/rls/search.sql

## Implementation Notes

* Tenant staff may:
  * read tenant-scoped config
  * request changes that are subject to governance controls (if applicable)
* Tenants must not:
  * modify global ranking semantics

## Acceptance Criteria

* Policies enforce strict tenant_id scoping.

## Dependencies

* RLS-90

## Estimated Effort

45–90 minutes
