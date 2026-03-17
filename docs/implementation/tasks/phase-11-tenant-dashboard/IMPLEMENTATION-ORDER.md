# Phase 11 — Implementation Order (Hierarchical)

Implement top-down so shared infrastructure and safety semantics exist before feature routes.

## 1) Foundations (blocking)

- `foundations/TENANTUI11-001-spa-mode-and-build-config.md`
- `foundations/TENANTUI11-002-tenant-context-resolution-and-guardrails.md`
- `foundations/TENANTUI11-003-auth-consumption-and-permission-model.md`
- `foundations/TENANTUI11-004-api-client-and-correlation-ids.md`
- `foundations/TENANTUI11-005-contract-validation-boundary.md`
- `foundations/TENANTUI11-006-tanstack-query-client-and-defaults.md`
- `foundations/TENANTUI11-007-route-loaders-prefetch-strategy.md`
- `foundations/TENANTUI11-008-failure-degraded-and-write-suppression.md`
- `foundations/TENANTUI11-009-audit-attribution-ui-conventions.md`

## 2) Shell + routing

- `routing-layout/TENANTUI11-020-route-map-and-navigation-ia.md`
- `routing-layout/TENANTUI11-021-tenant-app-shell-layout.md`
- `routing-layout/TENANTUI11-022-permission-aware-sidebar-nav.md`
- `routing-layout/TENANTUI11-023-route-guards-and-boundaries.md`
- `routing-layout/TENANTUI11-024-breadcrumbs-and-page-metadata.md`

## 3) Shared components

- `components/TENANTUI11-030-page-shell-components.md`
- `components/TENANTUI11-031-data-table-and-empty-states.md`
- `components/TENANTUI11-032-filter-bar-and-url-state.md`
- `components/TENANTUI11-033-form-patterns-and-validation.md`
- `components/TENANTUI11-034-mutation-confirmation-and-audit-receipts.md`
- `components/TENANTUI11-035-degraded-banner-and-staleness.md`

## 4) Feature routes (leaf)

- `dashboard/TENANTUI11-040-dashboard-overview.md`
- `catalog/TENANTUI11-050-products-list.md`
- `catalog/TENANTUI11-051-product-detail-and-edit.md`
- `inventory/TENANTUI11-060-inventory-list-and-adjustments.md`
- `orders/TENANTUI11-070-orders-list.md`
- `orders/TENANTUI11-071-order-detail-and-status-actions.md`
- `fulfillment/TENANTUI11-080-fulfillment-list-and-detail.md`
- `payments/TENANTUI11-090-payments-outcomes-visibility.md`
- `staff/TENANTUI11-100-tenant-staff-directory.md`
- `staff/TENANTUI11-101-staff-invite-and-role-assignments.md`
- `settings/TENANTUI11-110-tenant-settings.md`
- `audit/TENANTUI11-120-tenant-audit-log.md`
- `audit/TENANTUI11-121-audit-detail.md`

## 5) Integration checks

- `integration/TENANTUI11-200-navigation-and-permissions-smoke.md`
- `integration/TENANTUI11-201-mutation-audit-smoke.md`
- `integration/TENANTUI11-202-degraded-mode-smoke.md`
