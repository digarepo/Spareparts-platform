# Task: DOMAIN-30 — IAM domain module and models
Blueprints: Domain C (Identity & Scope), Domain D (Identity & Account Model)
Phase: 03 IAM

## Layer

domain

## Package / Area

domains/iam

## Purpose

Create the IAM domain module with explicit domain models for Identity, Account,
Scope, and lifecycle state, separate from persistence and HTTP concerns.

## Implementation Location

domains/iam/

## Implementation Notes

* Create or verify:
  * `domains/iam/index.ts` for public exports
  * `domains/iam/models/` for domain types
  * `domains/iam/functions/` for pure domain logic
* Domain models should:
  * Reflect blueprint separation: identity ≠ account ≠ role
  * Require explicit scope for operations
  * Avoid framework and ORM types

## Acceptance Criteria

* IAM domain module structure exists and exports a clear public surface
* Core domain models exist for Identity and Account semantics
* No infrastructure or app framework imports in domain code

## Dependencies

* CONTRACTS-31 and CONTRACTS-32 (for shared boundary types)

## Estimated Effort

60–90 minutes

