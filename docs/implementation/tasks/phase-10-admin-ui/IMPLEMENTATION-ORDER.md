# Phase 10 — Implementation Order (Hierarchical)

This file defines the recommended implementation sequence for Phase 10 so parent layers are built before child routes/components.

## 1) Foundations (blocking)

- `foundations/ADMINUI10-001-spa-mode-and-build-config.md`
- `foundations/ADMINUI10-002-auth-consumption-and-permission-model.md`
- `foundations/ADMINUI10-003-api-client-and-request-context.md`
- `foundations/ADMINUI10-004-contract-validation-boundary.md`
- `foundations/ADMINUI10-005-tanstack-query-client-and-defaults.md`
- `foundations/ADMINUI10-006-route-loaders-prefetch-strategy.md`

## 2) Global UX semantics

- `foundations/ADMINUI10-007-global-error-and-degraded-states.md`
- `foundations/ADMINUI10-008-audit-attribution-ui-conventions.md`
- `components/ADMINUI10-034-degraded-banner-and-staleness.md`

## 3) App shell + routing (parent layer)

- `routing-layout/ADMINUI10-020-admin-route-map-and-navigation-ia.md`
- `routing-layout/ADMINUI10-021-admin-app-shell-layout.md`
- `routing-layout/ADMINUI10-022-permission-aware-sidebar-nav.md`
- `routing-layout/ADMINUI10-023-route-guards-and-boundaries.md`
- `routing-layout/ADMINUI10-024-breadcrumbs-and-page-metadata.md`

## 4) Shared components (child layer used by all routes)

- `components/ADMINUI10-030-admin-page-shell-components.md`
- `components/ADMINUI10-031-admin-data-table.md`
- `components/ADMINUI10-032-filter-bar-and-query-state.md`
- `components/ADMINUI10-033-action-dialogs-and-confirmation-patterns.md`

## 5) Leaf routes (feature areas)

Implement in this order so earlier routes can reuse patterns:

- `dashboard/ADMINUI10-040-dashboard-route-and-widgets.md`
- `tenants/ADMINUI10-050-tenants-list-route.md`
- `tenants/ADMINUI10-051-tenant-detail-route.md`
- `staff/ADMINUI10-060-staff-directory-route.md`
- `staff/ADMINUI10-061-staff-detail-and-role-assignments.md`
- `staff/ADMINUI10-062-roles-and-permissions-route.md`
- `staff/ADMINUI10-063-invite-platform-staff.md`
- `staff/ADMINUI10-064-disable-and-reactivate-staff.md`
- `staff/ADMINUI10-065-revoke-sessions-and-reset-mfa.md`
- `staff/ADMINUI10-066-access-events-surface.md`
- `policies/ADMINUI10-070-policies-route.md`
- `policies/ADMINUI10-071-policy-history-and-audit-links.md`
- `policies/ADMINUI10-072-policy-diff-view.md`
- `search-governance/ADMINUI10-080-search-governance-route.md`
- `payments/ADMINUI10-090-payments-observability-route.md`
- `audit/ADMINUI10-100-audit-explorer-route.md`
- `audit/ADMINUI10-101-audit-detail-route.md`
- `audit/ADMINUI10-102-audit-saved-views.md`
- `audit/ADMINUI10-103-audit-export.md`
- `system/ADMINUI10-110-system-health-route.md`

## 6) Integration checks

- `integration/ADMINUI10-120-end-to-end-navigation-smoke.md`
- `integration/ADMINUI10-121-governance-action-audit-smoke.md`
- `integration/ADMINUI10-122-privacy-regression-checks-payments.md`
