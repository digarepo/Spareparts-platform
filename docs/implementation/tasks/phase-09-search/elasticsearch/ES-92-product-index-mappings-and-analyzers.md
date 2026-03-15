# Task: ES-92 — Product index mappings + analyzers (deterministic, explainable)
Blueprint: Domain V (determinism, explainability), Domain T (catalog discovery)
Phase: 09 Search

## Layer

infrastructure

## Package / Area

packages/infra/search

## Purpose

Define deterministic index mappings and analyzers for product discovery.

## Implementation Location

* packages/infra/search/src/indexing/products/products.mappings.ts
* packages/infra/search/src/indexing/products/products.analyzers.ts

## Implementation Notes

* Ranking must not depend on:
  * pricing
  * inventory
  * conversion
  * platform revenue
* Allowed ranking factors:
  * text match quality
  * explicit user filters
  * locale/language processing

## Acceptance Criteria

* Mapping/analyzer config is versioned.
* Ranking behavior is deterministic for same query + context.

## Dependencies

* ES-91

## Estimated Effort

120–240 minutes
