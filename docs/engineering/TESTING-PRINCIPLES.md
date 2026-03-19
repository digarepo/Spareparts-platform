# Testing Principles and Strategy

## Goals

- Provide confidence at each merge gate without slowing delivery
- Align effort to phase: scaffolding vs release-candidate vs hardened product
- Use a consistent, modern stack (Vitest, Playwright, Supertest)

---

## Test Types and When to Apply

| Test Type | Tool | Phase Gate | Scope | Goal |
|-----------|------|------------|-------|------|
| Manual verification | CLI/Postman | Phase → `dev` | Critical paths | Basic smoke; no regressions |
| Unit tests | Vitest | `dev` → `main` | Services, utils | Business logic, edge cases |
| Integration tests | Vitest + Supertest | `dev` → `main` | API boundaries | HTTP contracts, error paths |
| E2e tests | Playwright | Phase 13/14 | UI flows | User journeys, cross-app |
| Security regression | Vitest + custom fixtures | Phase 13/14 | Tenant isolation, authz | No cross-tenant leaks |
| Performance smoke | Playwright/k6 | Phase 14 | Hot paths | Latency/throughput bounds |

---

## Phase 1 (Foundations) → `dev`

**No automated tests required.** Manual verification suffices:
- API boots
- `/health` returns 200
- `/tenancy/memberships` respects tenant context
- Catalog stubs return expected errors

**Rationale:** Phase 1 is scaffolding; exhaustive testing comes later.

---

## `dev` → `main` (Release Candidate)

**Required before first tagged release:**
- Unit tests for core services (CatalogService, PrismaService)
- Integration tests for all API endpoints
- Basic tenant isolation smoke (not exhaustive)

**Still not required:**
- Full security hardening (Phase 13)
- Performance/load (Phase 14)
- UI E2e (later phases)

---

## Phase 13/14 (Testing & Security)

**Exhaustive validation:**
- Playwright E2e for storefront/merchant/admin flows
- Security regression suites (cross-tenant, IDOR, deny-by-default)
- Performance smoke (search, checkout hot paths)
- CI gates and release readiness reports

---

## Tooling Details

### Unit Tests (Vitest)
- Fast, in-memory
- Mock external deps (Prisma, Redis)
- Focus on business logic, edge cases

### Integration Tests (Vitest + Supertest)
- Real HTTP server via NestJS TestModule
- Real database (test schema) or transactional fixtures
- Validate contracts, error envelopes

### E2e Tests (Playwright)
- Full browser automation
- Multi-app flows (storefront → admin)
- Visual and functional regression

### Security Regression
- Custom fixtures for tenant data
- Assert deny-by-default, no existence leaks
- Run in CI with isolated test schema

---

## File Organization

```
apps/api/src/**/*.spec.ts          # Unit tests
apps/api/test/**/*.integration.spec.ts  # Integration tests
apps/*/test-e2e/**/*.spec.ts       # Playwright E2e (when UI exists)
packages/db/test/**/*.rls.spec.ts  # RLS/security regression
```

---

## CI Gates

- **Phase → `dev`:** Manual verification checklist
- **`dev` → `main`:** Unit + integration tests pass
- **Phase 13/14:** Full suite + security + performance smoke

Failures are explicit and stop the pipeline.

---

## Standards

- Use Vitest globals (`describe`, `it`, `expect`) with `globals: true`
- Write tests for failure paths, not just happy paths
- Keep tests fast and deterministic; no flaky sleeps
- Use descriptive test names: “should reject when tenantId missing”

---

## References

- `docs/implementation/tasks/phase-14-testing-verification/`
- `docs/engineering/JSDOC-STANDARD.md`
- Phase 14 tasks for security, performance, and release readiness
