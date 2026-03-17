# Task: CONTRACTS-24 — Taxonomy contracts
Blueprint: Domain I (Taxonomy, Classification & Navigation)
Phase: 02 Catalog

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define contracts for taxonomy identifiers and nodes so navigation and
classification can be modeled consistently across domains, APIs, and
infrastructure.

## Implementation Location

packages/contracts/src/catalog/taxonomy.schema.ts

## Implementation Notes

* Implement a Zod + TypeScript module that exports:
  * `TaxonomyIdSchema` and `TaxonomyId`
  * `TaxonomyNodeSchema` and `TaxonomyNode`
* TaxonomyId:
  * String-based identifier (e.g. ULID or similar) with appropriate validation
* TaxonomyNode:
  * Represents a single category in the taxonomy tree
  * Includes fields for id, parent id (optional), labels, and any metadata needed
    for navigation
* Documentation:
  * Module-level JSDoc describing taxonomy semantics and boundaries
  * JSDoc for each schema/type export
* Contracts must not:
  * Encode pricing, inventory, or availability semantics
  * Control product identity or variant structure

## Acceptance Criteria

* `taxonomy.schema.ts` exists in `packages/contracts/src/catalog/`
* `TaxonomyId` and `TaxonomyNode` schemas and types are exported
* Validation rules enforce identifier and structural constraints
* JSDoc is present and consistent with contracts documentation standards

## Dependencies

* CONTRACTS-01 — Catalog identifier contracts (if reusing identifier patterns)

## Estimated Effort

45–60 minutes

