# Task: API-03 — Implement product creation and listing endpoints
Blueprints: Domain G (Product Catalog Core), Domain H (Catalog Visibility & Publication)
Phase: 01 Foundations

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Implement product creation and listing endpoints that validate inputs and outputs
via contracts, respect tenant context, and delegate to domain and database layers.

## Implementation Location

apps/api/src/http/controllers/catalog.controller.ts

## Implementation Notes

* Implement endpoints:
  * `POST /catalog/products` — create a new product (and initial variants/prices if required)
  * `GET /catalog/products` — list products for the current tenant
* Each endpoint must:
  * Use contracts to validate and type request payloads and responses
  * Obtain `TenantContext` from the tenant context pipeline
  * Delegate to domain services or application services for business logic
  * Interact with the database layer via repositories or services, not inline queries
* Error handling:
  * Fail closed when tenant context is missing or invalid
  * Return appropriate HTTP status codes for validation or domain errors

## Acceptance Criteria

* `POST /catalog/products` and `GET /catalog/products` are implemented and wired
* Endpoints validate inputs and outputs with catalog contracts
* Tenant context is applied to all catalog queries and mutations
* Domain and database logic are not implemented directly in the controller methods

## Dependencies

* API-01 — Implement tenant context pipeline
* API-02 — Implement catalog controller with contracts integration
* CONTRACTS-01 through CONTRACTS-03 — Catalog contracts
* DB-02 through DB-04 — Catalog-related models and indexes

## Estimated Effort

60–120 minutes

