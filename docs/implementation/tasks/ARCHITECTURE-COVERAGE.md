# Architecture Coverage Matrix (Blueprints → Phases)

This document is a pragmatic coverage map from architecture blueprints to implementation task phases.

Legend:
- Covered: explicitly addressed by implementation task sets (backend phases and UI phases 10–12)
- Remaining: not yet fully operationalized; tracked as post-MVP hardening/ops phases 13–17

## A. Product & commerce domains (mostly covered by backend task sets)

- **Catalog**: Domain G/H/I
  - Covered: backend implementation phases (catalog core, publication/visibility, taxonomy)
- **Pricing & assets governance**: Domain J
  - Covered: backend implementation phases
- **Inventory**: Domain K/L/M
  - Covered: backend implementation phases
- **Cart & order intent**: Domain N
  - Covered: backend implementation phases; reinforced in Storefront Phase 12 (cart staleness + reconciliation UX)
- **Orders**: Domain O/P
  - Covered: backend implementation phases; surfaced in Tenant UI Phase 11 + Storefront Phase 12
- **Payments**: Domain Q/R/S
  - Covered: backend implementation phases; surfaced in Tenant UI Phase 11 + Storefront Phase 12 payment failure semantics
- **Fulfillment / shipping / delivery / returns**: Domains AI/AJ/AK/AL
  - Covered: backend implementation phases; surfaced minimally in Tenant UI Phase 11 and Storefront account order detail tasks
- **Search**: Domains T/U/V
  - Covered: backend implementation phases; surfaced in Storefront Phase 12 (non-authoritative + degradation semantics)
- **Customer notifications**: Domain AM
  - Covered: Storefront Phase 12 notification history surface (informational-only)

## B. Frontend UI governance domains (covered by UI phases)

- **Admin UI purpose/authority**: Domain W
  - Covered: Phase 10
- **Admin visibility/actions governance**: Domain X
  - Covered: Phase 10
- **Admin auditability/failure**: Domain Y
  - Covered: Phase 10
- **Seller UI purpose/authority**: Domain Z
  - Covered: Phase 11
- **Seller visibility/mutation boundaries**: Domain AA
  - Covered: Phase 11
- **Seller auditability/failure**: Domain AB
  - Covered: Phase 11

## C. Cross-cutting foundational & operational governance (remaining)

These are architecture-mandated but typically require dedicated implementation/ops phases beyond feature delivery.

- **Identity, scope, auth boundaries**: Domain C
  - Remaining: formal verification tests, boundary audits, and security regression suite (Phases 13–14)
- **Identity & account model**: Domain D
  - Remaining: operational lifecycle playbooks (suspend/deactivate/terminate), recovery flows, and testing (Phases 13–16)
- **Authentication & trust boundaries**: Domain E
  - Remaining: hardening, rate limiting/lockouts, secure headers, and abuse monitoring (Phases 13–15)
- **Authorization roles & scope**: Domain F
  - Remaining: continuous verification + testing harness (Phase 14), ops guardrails (Phase 15)
- **Security hardening & threat boundaries**: Domain AC
  - Remaining: Phase 13
- **Data integrity, consistency & recovery**: Domain AD
  - Remaining: Phase 17 (plus release readiness constraints in Phase 16)
- **Observability, operations & environment isolation**: Domain AE
  - Remaining: Phase 15
- **Release readiness & launch governance**: Domain AF
  - Remaining: Phase 16
- **Migration, cutover & change governance**: Domain AG
  - Remaining: Phase 16
- **Post-release validation & incident readiness**: Domain AH
  - Remaining: Phase 17

## Proposed remaining phases

- **Phase 13 — Security & Trust Hardening** (Domains AC, C/D/E/F hardening aspects)
- **Phase 14 — Testing & Verification System** (release no-go enforcement via tests; security + isolation regression)
- **Phase 15 — Observability, Ops Access, Secrets & Env Isolation** (Domain AE)
- **Phase 16 — Release Readiness, Feature Availability, Cutover & Runbooks** (Domains AF/AG)
- **Phase 17 — Post-Release Validation, Incident Readiness, Data Integrity & Recovery Drills** (Domains AH/AD)
