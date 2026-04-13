import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutGuard } from './guards/checkout.guard';
import { CartRepository } from '../orders/repositories/cart.repository';
import { OrderRepository } from '../orders/repositories/order.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdempotencyService } from '../../shared/services/idempotency.service';
import { CatalogModule } from '../../catalog/catalog.module';
import { RedisModule } from '../../redis/redis.module';

/**
 * Checkout module with comprehensive cart-to-order conversion capabilities.
 *
 * @remarks
 * - **Scope:** Checkout operations with idempotency and governance
 * - **Authority:** Customer checkout with explicit intent confirmation
 * - **Invariants:** No duplicate orders, no ghost orders, financial integrity
 * - **Dependencies:** Prisma for database, Catalog for product validation, Orders for order creation
 *
 * Features:
 * - Idempotent checkout with idempotency keys
 * - Cart validation and inventory verification
 * - Single-use checkout tokens
 * - Comprehensive audit logging
 * - Production-grade error handling
 */
@Module({
  imports: [
    PrismaModule,
    CatalogModule,
    RedisModule,
  ],
  controllers: [
    CheckoutController,
  ],
  providers: [
    CheckoutService,
    CheckoutGuard,
    CartRepository,
    OrderRepository,
    IdempotencyService,
  ],
  exports: [
    CheckoutService,
    CheckoutGuard,
  ],
})
export class CheckoutModule {}
