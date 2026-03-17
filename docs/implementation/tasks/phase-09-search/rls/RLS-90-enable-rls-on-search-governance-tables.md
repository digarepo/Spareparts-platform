# Task: RLS-90 — Enable RLS on search governance tables
Blueprint: Domain B (tenant isolation), Domain V (governance)
Phase: 09 Search

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable row-level security on search governance tables so configuration and audit records cannot leak across tenants/scopes.

## Implementation Location

* packages/db/rls/search.sql

## Implementation Notes

* Enable RLS on:
  * search_index_metadata
  * search_relevance_config (synonyms/weights)
  * search_audit_log
* Default deny.

## Acceptance Criteria

* RLS is enabled for all search governance tables.
* No table is readable without explicit policies.

## Dependencies

* PRISMA-90..92

## Estimated Effort

30–60 minutes
