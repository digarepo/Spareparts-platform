# Phase 12 — Implementation Order (Hierarchical)

Implement top-down so SSR, SEO, safety semantics, and shared components exist before feature routes.

## 1) Foundations (blocking)

- `foundations/STOREUI12-001-ssr-mode-and-seo-metadata.md`
- `foundations/STOREUI12-002-api-client-and-correlation-ids.md`
- `foundations/STOREUI12-003-contract-validation-boundary.md`
- `foundations/STOREUI12-004-tanstack-query-client-and-ssr-prefetch.md`
- `foundations/STOREUI12-005-optional-auth-and-customer-context.md`
- `foundations/STOREUI12-006-cart-state-model-and-staleness.md`
- `foundations/STOREUI12-007-checkout-order-commitment-boundary.md`
- `foundations/STOREUI12-008-payment-attempt-flow-and-failure-recovery.md`
- `foundations/STOREUI12-009-global-error-and-degraded-states.md`

## 2) Shell + routing

- `routing-layout/STOREUI12-020-route-map-and-navigation-ia.md`
- `routing-layout/STOREUI12-021-storefront-app-shell-layout.md`
- `routing-layout/STOREUI12-022-search-box-and-suggestions-header.md`
- `routing-layout/STOREUI12-023-route-error-boundaries.md`

## 3) App-local reusable components (`apps/storefront/app/components`)

- `components/STOREUI12-030-product-card-and-price-display.md`
- `components/STOREUI12-031-search-filters-sort-and-pagination.md`
- `components/STOREUI12-032-category-nav-and-breadcrumbs.md`
- `components/STOREUI12-033-cart-line-items-and-tenant-grouping.md`
- `components/STOREUI12-034-checkout-stepper-and-forms.md`
- `components/STOREUI12-035-order-status-and-timeline.md`

## 4) Feature routes (leaf)

- `home/STOREUI12-040-home-route.md`
- `search/STOREUI12-050-search-results-route.md`
- `search/STOREUI12-051-related-items-and-empty-states.md`
- `categories/STOREUI12-060-category-browse-route.md`
- `product/STOREUI12-070-product-detail-route.md`
- `cart/STOREUI12-080-cart-route-and-reconciliation.md`
- `checkout/STOREUI12-090-checkout-route-guest-first.md`
- `checkout/STOREUI12-091-checkout-success-route.md`
- `checkout/STOREUI12-092-checkout-failure-route.md`
- `account/STOREUI12-100-account-entry-and-auth-optional.md`
- `account/STOREUI12-101-orders-list-route.md`
- `account/STOREUI12-102-order-detail-route.md`
- `account/STOREUI12-103-notification-history-surface.md`

## 5) Integration checks

- `integration/STOREUI12-200-ssr-seo-smoke.md`
- `integration/STOREUI12-201-guest-checkout-smoke.md`
- `integration/STOREUI12-202-cart-staleness-and-diff-smoke.md`
- `integration/STOREUI12-203-payment-failure-recovery-smoke.md`
- `integration/STOREUI12-204-search-degradation-and-category-fallback-smoke.md`
