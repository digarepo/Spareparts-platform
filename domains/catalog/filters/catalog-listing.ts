import type {
  CatalogListQuery,
  ProductStatus,
  TaxonomyId
} from "@spareparts/contracts";

/**
 * Represents domain-level catalog filtering criteria.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** filters are bounded and validated
 */
export interface CatalogFilterCriteria {
  status: ProductStatus;
  taxonomyIds?: Set<TaxonomyId>;
  searchText?: string;
  pagination: {
    offset: number;
    limit: number;
  };
}

/**
 * Translates a catalog list query into domain filter criteria.
 *
 * @param query - Validated catalog list query
 * @returns Domain-level filtering criteria
 *
 * @example
 * ```ts
 * const criteria = applyCatalogFilters({
 *   pagination: { page: 1, limit: 10 },
 *   filter: { status: "published", taxonomyId: "cat-123" }
 * });
 * ```
 */
export function applyCatalogFilters(query: CatalogListQuery): CatalogFilterCriteria {
  const { pagination, filter } = query;

  // Convert page-based pagination to offset/limit
  const offset = pagination.page * pagination.limit;
  const limit = pagination.limit;

  const criteria: CatalogFilterCriteria = {
    status: filter.status,
    pagination: { offset, limit },
  };

  // Include taxonomy filter (subtree expansion handled by services)
  if (filter.taxonomyId) {
    criteria.taxonomyIds = new Set([filter.taxonomyId]);
  }

  // Include search filter (normalization handled by services)
  if (filter.search?.trim()) {
    criteria.searchText = filter.search.trim();
  }

  return criteria;
}

/**
 * Validates catalog filter constraints.
 *
 * @param criteria - Filter criteria to validate
 * @returns true if criteria are within allowed bounds
 *
 * @throws Error when criteria violate domain constraints
 */
export function validateCatalogFilters(criteria: CatalogFilterCriteria): boolean {
  // Validate pagination bounds
  if (criteria.pagination.limit < 1 || criteria.pagination.limit > 100) {
    throw new Error("Pagination limit must be between 1 and 100");
  }

  if (criteria.pagination.offset < 0) {
    throw new Error("Pagination offset must be non-negative");
  }

  // Validate search text length
  if (criteria.searchText && criteria.searchText.length > 255) {
    throw new Error("Search text must be 255 characters or less");
  }

  return true;
}

/**
 * Checks if a product matches the given filter criteria.
 *
 * @param product - Product to evaluate (with taxonomy associations)
 * @param criteria - Filter criteria
 * @returns true if product matches all criteria
 *
 * @remarks
 * This is a pure domain function; actual database filtering is handled by services.
 */
export function matchesCatalogFilters(
  product: {
    id: string;
    status: ProductStatus;
    taxonomyIds?: Set<TaxonomyId>;
    name: string;
    description?: string;
  },
  criteria: CatalogFilterCriteria
): boolean {
  // Status filter
  if (product.status !== criteria.status) {
    return false;
  }

  // Taxonomy filter
  if (criteria.taxonomyIds && product.taxonomyIds) {
    const hasMatchingTaxonomy = [...criteria.taxonomyIds].some(id =>
      product.taxonomyIds!.has(id)
    );
    if (!hasMatchingTaxonomy) {
      return false;
    }
  }

  // Search filter (simple text match)
  if (criteria.searchText) {
    const searchLower = criteria.searchText.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const descMatch = product.description?.toLowerCase().includes(searchLower);
    if (!nameMatch && !descMatch) {
      return false;
    }
  }

  return true;
}
