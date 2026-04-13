import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { CartRepository } from './repositories/cart.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogModule } from '../../catalog/catalog.module';

/**
 * Orders module with comprehensive order management capabilities.
 *
 * @remarks
 * - **Scope:** Order lifecycle management and customer order operations
 * - **Authority:** Customer-owned orders with tenant isolation
 * - **Invariants:** Multi-tenant security, financial precision, audit trails
 * - **Dependencies:** Prisma for database, Catalog for product validation
 *
 * Features:
 * - Order creation from carts with Ethiopia VAT calculations
 * - Order status transitions with governance and audit
 * - Customer and tenant-scoped order queries
 * - Shipping information updates and tracking
 * - Production-grade error handling and logging
 */
@Module({
  imports: [
    PrismaModule,
    CatalogModule,
  ],
  controllers: [
    OrdersController,
  ],
  providers: [
    OrderService,
    OrderRepository,
    CartRepository,
  ],
  exports: [
    OrderService,
    OrderRepository,
  ],
})
export class OrdersModule {}
