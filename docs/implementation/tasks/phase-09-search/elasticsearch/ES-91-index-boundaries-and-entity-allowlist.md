# Task: ES-91 — Index boundaries + explicit entity allowlist
Blueprint: Domain T (Indexable entity principle, non-indexable data)
Phase: 09 Search

## Layer

infrastructure

## Package / Area

packages/infra/search

## Purpose

Implement an explicit allowlist of indexable entities and enforce non-indexable hard boundaries (payments, raw inventory, secrets).

## Implementation Location

* packages/infra/search/src/indexing/index-boundaries.ts

## Implementation Notes

* Define allowed document types:
  * public catalog discovery (products, variants, taxonomy)
  * tenant-local management (tenant products; optionally tenant orders as read-only)
  * platform observational (non-sensitive)
* Prohibit indexing:
  * payment/escrow
  * raw inventory quantities
  * auth secrets

## Acceptance Criteria

* Allowlist exists and is used by index builders.
* Attempt to index forbidden data is rejected.

## Dependencies

* Domains T/U

## Estimated Effort

60–120 minutes
