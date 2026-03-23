import { Module } from "@nestjs/common";
import { CatalogController } from "../http/controllers/catalog.controller";
import { CatalogService } from "./catalog.service";
import { PrismaModule } from "../prisma/prisma.module";

/**
 * Module for catalog-related controllers and services.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** orchestrates controllers and services
 * - **Threading/Async:** no async behavior at module level
 */
@Module({
    imports: [PrismaModule],
    controllers: [CatalogController],
    providers: [CatalogService],
    exports: [CatalogService]
})
export class CatalogModule {}
