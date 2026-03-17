# Task: DOMAIN-32 — Authorization decision engine (scope-first, auditable)
Blueprints: Domain F (Authorization, Roles, and Active Scope), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

domain

## Package / Area

domains/iam

## Purpose

Implement a pure, deterministic authorization decision function that evaluates
requested actions against permissions within a single active scope, producing
allow/deny outcomes and audit-friendly decision details.

## Implementation Location

domains/iam/functions/authorize.ts (or similar)

## Implementation Notes

* Authorization must be:
  * Pure (no side effects)
  * Scope-first (exactly one active scope per request)
  * Deny-by-default (missing input = deny)
* Inputs (explicit):
  * authenticated identity (id + lifecycle state)
  * active scope (platform/tenant/customer)
  * target tenant id (if tenant scope)
  * requested action + resource
  * effective permission set (derived from roles)
* Outputs:
  * allow/deny boolean
  * structured reason codes suitable for audit logs and debugging
* Do not:
  * Query databases inside the decision function
  * Hide failures (explicit denial)

## Acceptance Criteria

* Authorization function exists and is unit-tested across:
  * missing scope → deny
  * wrong scope → deny
  * missing permission → deny
  * valid permission in correct scope → allow
* Decision output is explainable and can be persisted as an audit record

## Dependencies

* DOMAIN-30 — IAM domain module and models
* CONTRACTS-32 — Authorization and RBAC contracts

## Estimated Effort

90–150 minutes

