# Task: ES-93 — Tenant isolation indexing strategy (customer vs tenant vs platform)
Blueprint: Domain U (isolation), Domain T (visibility preservation)
Phase: 09 Search

## Layer

infrastructure

## Package / Area

packages/infra/search

## Purpose

Implement a tenant isolation strategy that prevents cross-tenant leakage via search.

## Implementation Location

* packages/infra/search/src/tenancy/search-tenancy.strategy.ts

## Implementation Notes

* Decide and implement one strategy (document the choice):
  * per-tenant indices
  * shared index with strict tenant_id routing and query filter
* Customer scope:
  * only published/public entities
  * no tenant-internal metadata
* Tenant scope:
  * strict tenant-only data
* Platform scope:
  * observational read-only across tenants

## Acceptance Criteria

* Isolation strategy is explicit and tested.
* Missing/ambiguous context fails closed.

## Dependencies

* CONTRACTS-91
* ES-90

## Estimated Effort

120–240 minutes
