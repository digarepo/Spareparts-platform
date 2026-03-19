import { Injectable } from "@nestjs/common";

import type {
    CreateProductRequest,
    CreateVariantRequest,
    ProductListResponse,
    ProductResponse
} from '@spareparts/contracts';
import { getRequestContext } from "../infrastructure/request-context";

/**
 * Application service for catalog operations.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** database via repositories
 * - **Threading/Async:** all methods are async
 * - **Tenancy:** all queries apply tenant-scoped RLS
 */
@Injectable()
export class CatalogService {
    /**
     * Creates a product within the current tenant context.
     *
     * @param request - validated product creation payload
     * @returns the created product representation
     *
     * @throws Error - not implemented
     */
    async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
        const ctx = getRequestContext();
        throw new Error("Not implemented");
    }

    /**
     * Lists products scoped to the current tenant.
     *
     * @returns products belonging to the tenant
     *
     * @throws Error - not implemented
     */
    async listProducts(): Promise<ProductListResponse> {
        const ctx = getRequestContext();
        throw new Error("Not implemented");
    }

    /**
     * Creates a variant under a product.
     *
     * @param request - validated variant creation payload
     * @returns the updated product representation
     *
     * @throws Error - not implemented
     */
    async createVariant(request: CreateVariantRequest): Promise<ProductResponse> {
        const ctx = getRequestContext();
        throw new Error("Not implemented");
    }
}
