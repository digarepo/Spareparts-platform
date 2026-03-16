# Task: CONTRACTS-30 — Establish IAM contracts structure
Blueprint: Domain A (Repository & Package Architecture)
Phase: 03 IAM

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Create a stable, grouped contract surface for IAM (auth + authorization) so APIs,
domains, and infrastructure share consistent types and validation rules.

## Implementation Location

packages/contracts/src/iam/

## Implementation Notes

* Ensure the following directories exist:
  * `packages/contracts/src/iam/auth/`
  * `packages/contracts/src/iam/authorization/`
  * `packages/contracts/src/iam/index.ts` (public entry point)
* Contracts must remain:
  * framework-agnostic
  * persistence-agnostic
  * immutable unless versioned

## Acceptance Criteria

* IAM contracts directories exist under `packages/contracts/src/iam/`
* IAM index export file exists and is ready to re-export auth/authz modules

## Dependencies

None

## Estimated Effort

10–20 minutes

