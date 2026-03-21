import type { Product, ProductStatus } from "@spareparts/contracts";

/**
 * Catalog product aggregate root.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** slug is unique per tenant; status transitions are validated
 */
export interface ProductAggregate extends Product {
    /**
     * Computed visibility flags derived from status and metadata.
     *
     * @remarks
     * - isVisible: true for published products
     * - isSearchable: true for published products with taxonomy
     * - isOrderable: true for published products with price
     */
    visibility: {
        isVisible: boolean;
        isSearchable: boolean;
        isOrderable: boolean;
    };
}

/**
 * Represents product visibility flags
 *
 * @remarks
 * These are derived values, not stored fields.
 */
export interface ProductVisibility {
    isVisible: boolean;
    isSearchable: boolean;
    isOrderable: boolean;
}
