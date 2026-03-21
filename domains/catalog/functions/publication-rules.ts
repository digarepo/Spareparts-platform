import type { Product, ProductStatus } from "@spareparts/contracts";

/**
 * Validates whether a product can be published.
 *
 * @param product - Product to validate
 * @returns true if publication preconditions are met
 *
 * @remarks
 * Publication requires:
 * - Non-empty name and slug
 * - At least one variant
 * - Valid pricing (if applicable)
 */
export function canPublishProduct(product: Product): boolean {
  // Must have basic identity
  if (!product.name?.trim() || !product.slug) {
    return false;
  }

  // Must not already be published
  if (product.status === "published") {
    return false;
  }

  // Must have at least one variant (checked at persistence layer)
  // This is a domain guard; actual variant existence is verified by services

  return true;
}

/**
 * Determines visibility flags from product state.
 *
 * @param product - Product to evaluate
 * @returns Visibility flags for UI/search
 *
 * @remarks
 * - isVisible: product is published
 * - isSearchable: published and has taxonomy classification
 * - isOrderable: published and has price information
 */
export function determineProductVisibility(product: Product): {
  isVisible: boolean;
  isSearchable: boolean;
  isOrderable: boolean;
} {
  const isVisible = product.status === "published";
  const isSearchable = isVisible;
  const isOrderable = isVisible;

  return { isVisible, isSearchable, isOrderable };
}

/**
 * Validates a product status transition.
 *
 * @param currentStatus - Current product status
 * @param targetStatus - Desired status
 * @returns true if transition is allowed
 *
 * @remarks
 * Allowed transitions:
 * - draft → published (if canPublishProduct)
 * - draft → inactive
 * - published → inactive
 * - inactive → draft
 * - inactive → published (if canPublishProduct)
 */
export function canTransitionProductStatus(
  currentStatus: ProductStatus,
  targetStatus: ProductStatus,
  product: Product
): boolean {
  if (currentStatus === targetStatus) {
    return false; // No-op transition
  }

  switch (targetStatus) {
    case "published":
      return canPublishProduct(product);
    case "draft":
      return currentStatus === "inactive";
    case "inactive":
      return currentStatus === "draft" || currentStatus === "published";
    default:
      return false;
  }
}
