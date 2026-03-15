# Blueprint → Phase Mapping

This document maps architecture blueprint domains to the implementation task phases where they are operationalized.

Related:
- `docs/implementation/tasks/ARCHITECTURE-COVERAGE.md`

## A) Core platform foundations

| Blueprint | Covered by |
|---|---|
| Domain A — Repo architecture | Backend implementation phases (platform foundation) + Phase 16 (release governance) |
| Domain B — Data & environment enforcement | Backend implementation phases + Phase 15 (env isolation/parity) + Phase 16 (no silent launch) |
| Domain C — Identity/scope/authz boundaries | Backend implementation phases (IAM enforcement) + Phase 13 (hardening) + Phase 14 (regression tests) |
| Domain D — Identity & account model | Backend implementation phases (identity lifecycle semantics) + Phase 16–17 (runbooks/incident posture) |
| Domain E — Authentication & trust boundaries | Backend implementation phases (authn boundary) + Phase 13 (abuse controls) + Phase 14 (verification) |
| Domain F — Authorization roles/scope | Backend implementation phases (roles/permissions) + UI Phases 10/11 gating + Phase 14 regression |

## B) Commerce domains (authoritative backend)

| Blueprint | Covered by |
|---|---|
| Domain G — Product catalog core | Backend implementation phases + UI Phases 11/12 read surfaces |
| Domain H — Catalog visibility/publication | Backend implementation phases + UI Phases 11/12 visibility surfaces |
| Domain I — Taxonomy/classification | Backend implementation phases + Phase 12 category browsing |
| Domain J — Pricing/assets governance | Backend implementation phases + Phase 12 price display conventions |
| Domain K — Inventory core model | Backend implementation phases + Phase 11 inventory ops surfaces |
| Domain L — Availability/reservation | Backend implementation phases + Phase 14 integrity tests (where applicable) |
| Domain M — Inventory governance/consistency | Backend implementation phases + Phase 14/17 integrity/recovery verification |
| Domain N — Cart/order intent | Backend implementation phases + Phase 12 cart staleness/reconcile + Phase 14 integrity tests |
| Domain O — Order lines/pricing snapshots | Backend implementation phases + UI Phases 11/12 order views |
| Domain P — Order transitions/governance | Backend implementation phases + Phase 11 status actions + Phase 14/17 validation |
| Domain Q — Payment core model | Backend implementation phases |
| Domain R — Payment authority/escrow | Backend implementation phases + Phase 12 payment UX constraints |
| Domain S — Payment/order failure semantics | Backend implementation phases + Phase 12 failure UX + Phase 14 matrix tests + Phase 17 drills |
| Domain AI — Fulfillment core model | Backend implementation phases + Phase 11 fulfillment surfaces (MVP) |
| Domain AJ — Shipment/logistics model | Backend implementation phases |
| Domain AK — Delivery tracking governance | Backend implementation phases |
| Domain AL — Returns/refunds model | Backend implementation phases + UI Phases 11/12 limited visibility + Phase 17 recovery posture |
| Domain AM — Customer notification governance | Backend implementation phases (notification events) + Phase 12 notification history (informational-only) |

## C) Search domains

| Blueprint | Covered by |
|---|---|
| Domain T — Search purpose/scope | Backend implementation phases + Phase 12 degradation/fallback + Phase 14 search load smoke |
| Domain U — Search indexing/isolation | Backend implementation phases (index isolation rules) + Phase 14 isolation regression (partial) |
| Domain V — Search relevance governance | Backend implementation phases (relevance constraints) + Phase 16 release governance if tuning affects exposure |

## D) Admin/Seller UI governance domains

| Blueprint | Covered by |
|---|---|
| Domain W — Admin UI purpose/authority | Phase 10 |
| Domain X — Admin visibility/actions governance | Phase 10 |
| Domain Y — Admin auditability/failure | Phase 10 |
| Domain Z — Seller UI purpose/authority | Phase 11 |
| Domain AA — Seller visibility/mutation boundaries | Phase 11 |
| Domain AB — Seller auditability/failure | Phase 11 |

## E) Cross-cutting governance and operational readiness

| Blueprint | Covered by |
|---|---|
| Domain AC — Security hardening/threat boundaries | Phase 13 |
| Domain AD — Data integrity/consistency/recovery | Phase 17 (drills/runbooks) + Phase 14 (idempotency tests) |
| Domain AE — Observability/ops/secrets/env isolation | Phase 15 |
| Domain AF — Release readiness/launch governance | Phase 16 + Phase 14 release report artifact |
| Domain AG — Migration/cutover/change governance | Phase 16 |
| Domain AH — Post-release validation/incident readiness | Phase 17 |
