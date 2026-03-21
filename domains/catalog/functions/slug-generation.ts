import type { ProductSlug } from "@spareparts/contracts";

/**
 * Generates a URL-safe product slug from a name.
 *
 * @param name - Human-readable product name
 * @returns Normalized slug suitable for URLs
 *
 * @throws Error when name is empty or cannot be normalized
 *
 * @example
 * ```ts
 * generateProductSlug("My Awesome Product!") // "my-awesome-product"
 * ```
 */
export function generateProductSlug(name: string): ProductSlug {
  if (!name?.trim()) {
    throw new Error("Product name is required for slug generation");
  }

  const normalized = name
    .toLowerCase()
    .trim()
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");

  if (!normalized) {
    throw new Error("Unable to generate slug from provided name");
  }

  // Enforce max length
  const slug = normalized.slice(0, 100);
  return slug as ProductSlug;
}
