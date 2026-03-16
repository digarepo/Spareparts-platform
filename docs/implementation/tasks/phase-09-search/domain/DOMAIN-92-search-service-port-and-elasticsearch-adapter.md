# Task: DOMAIN-92 — Search service port + Elasticsearch adapter (replaceable)
Blueprint: Domain T (replaceable/rebuildable), TECH_STACK (Elasticsearch), Domain AD (derived)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search + packages/infra/search

## Purpose

Define a domain-facing port for search execution and implement an Elasticsearch adapter behind it.

## Implementation Location

* domains/search/src/ports/search.port.ts
* packages/infra/search/src/adapters/elasticsearch.search-adapter.ts

## Implementation Notes

* Port must not leak Elasticsearch-specific types.
* Adapter must enforce tenant filters from validated context.

## Acceptance Criteria

* Domain depends on the port only.
* Adapter can be replaced without domain changes.

## Dependencies

* ES-90
* ES-93

## Estimated Effort

120–240 minutes
