# Task: DOMAIN-93 — Ranking neutrality + explainability model
Blueprint: Domain V (neutrality, explainability, determinism)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search

## Purpose

Codify ranking/relevance principles so:
- ordering is neutral
- ranking does not change eligibility
- explainability is possible at a conceptual level

## Implementation Location

* domains/search/src/ranking/ranking-policy.ts

## Implementation Notes

* Forbidden factors:
  * pricing
  * inventory levels
  * conversion metrics
  * platform revenue
* Must be deterministic for same query + context.

## Acceptance Criteria

* Ranking policy exists and is referenced by adapter/query builder.

## Dependencies

* Domain V

## Estimated Effort

60–120 minutes
