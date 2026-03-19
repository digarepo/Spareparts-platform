import { Module } from "@nestjs/common";
import { CatalogController } from "../http/controllers/catalog.controller";
import { CatalogService } from "./catalog.service";

/**
 * Module for catalog-related controllers and services.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** orchestrates controllers and services
 * - **Threading/Async:** no async behavior at module level
 */
@Module({
    controllers: [CatalogController],
    providers: [CatalogService],
    exports: [CatalogService]
})
export class CatalogModule {}
