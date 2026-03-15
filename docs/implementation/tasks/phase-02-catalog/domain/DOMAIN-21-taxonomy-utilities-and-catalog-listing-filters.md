# Task: DOMAIN-21 — Taxonomy utilities and catalog listing filters
Blueprints: Domain I (Taxonomy Classification), Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 02 Catalog

## Layer

domain

## Package / Area

domains/catalog

## Purpose

Implement taxonomy utilities (tree building and traversal) and catalog listing
filter logic as pure domain functions, ensuring taxonomy remains descriptive-only
and does not leak into product identity, pricing, or inventory semantics.

## Implementation Location

domains/catalog/

## Implementation Notes

* Create or extend domain utilities for taxonomy:
  * Tree builder (build nested taxonomy from flat nodes)
  * Traversal helpers (ancestors/descendants, path building)
* Implement catalog listing filter logic:
  * Interpret `CatalogListQuery` contracts
  * Translate filters into domain-level criteria (not DB queries directly)
* Functions must:
  * Use taxonomy and listing contracts for types
  * Remain pure and deterministic (no persistence, no HTTP)
  * Preserve Domain I boundary: taxonomy is descriptive only

## Acceptance Criteria

* Taxonomy tree/traversal utilities exist in `domains/catalog/`
* Listing filter logic exists and consumes `CatalogListQuery` contract types
* No infrastructure, ORM, or HTTP imports in these utilities
* Behavior aligns with Domain I non-authority rules

## Dependencies

* CONTRACTS-23 — Catalog listing query contracts
* CONTRACTS-24 — Taxonomy contracts

## Estimated Effort

60–120 minutes

