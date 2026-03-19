import { Controller, Get, Post } from "@nestjs/common";

import type {
    CreateProductRequest,
    CreateVariantRequest,
    ProductListResponse,
    ProductResponse,
} from '@spareparts/contracts';

import {CatalogService } from '../../catalog/catalog.service';

/**
 * Catalog endpoints for product and variant management.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** contracts + database via CatalogService
 * - **Invariants:** all operations require tenant context
 */
@Controller("catalog")
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {}

    /**
     * Creates a product within the current tenant.
     *
     * @param request - validated product creation payload
     * @returns the created product representation
     *
     * @throws Error - not implemented
     */
    @Post("products")
    public async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
        throw new Error("Not implemented");
    }

    /**
     * Lists products scoped to the current tenant.
     *
     * @returns products belonging to the tenant
     *
     * @throws Error - not implemented
     */
    @Get("products")
    public async listProducts(): Promise<ProductListResponse> {
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
    @Post("variants")
    public async createVariant(request: CreateVariantRequest): Promise<ProductResponse> {
        throw new Error("NOt implemented");
    }
}
