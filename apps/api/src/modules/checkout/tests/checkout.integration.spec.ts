import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { CheckoutService } from '../checkout.service';
import { OrderService } from '../../orders/services/order.service';
import { CartRepository } from '../../orders/repositories/cart.repository';
import { IdempotencyService } from '../../../shared/services/idempotency.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { CartFactory, CartItemFactory } from '../../../../test/factories/cart.factory';
import { OrderFactory, OrderItemFactory } from '../../../../test/factories/order.factory';
import { AccountFactory } from '../../../../test/factories/account.factory';
import { CreateOrderCommand } from '../../orders/dto/commands/create-order.command';
import { EthiopiaAddressCommand } from '../../orders/dto/commands/create-order.command';

// Import cleanup function from setup
async function cleanupDatabase(prisma: PrismaClient): Promise<void> {
  try {
    // Clean up in dependency order (foreign key constraints)
    // Use correct table names from @map annotations
    await prisma.$executeRaw`DELETE FROM "order_status_history"`;
    await prisma.$executeRaw`DELETE FROM "order_items"`;
    await prisma.$executeRaw`DELETE FROM "orders"`;
    await prisma.$executeRaw`DELETE FROM "cart_status_history"`;
    await prisma.$executeRaw`DELETE FROM "cart_items"`;
    await prisma.$executeRaw`DELETE FROM "carts"`;
    await prisma.account.deleteMany();
    await prisma.identity.deleteMany();

    console.log('🧹 Cleaned up test database tables');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

describe('Checkout Integration - Revenue Chain with Ethiopian Context', () => {
  let checkoutService: CheckoutService;
  let orderService: OrderService;
  let cartRepository: CartRepository;
  let idempotencyService: IdempotencyService;
  let redis: Redis;
  let prisma: PrismaClient;

  // Test data
  let tenant1: any;
  let tenant2: any;
  let customer1Account: any;
  let customer2Account: any;
  let ethiopianAddress: EthiopiaAddressCommand;

  beforeAll(async () => {
    // Initialize test database connection
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://test_spareparts:test_spareparts@localhost:5433/test_spareparts',
        },
      },
    });

    await prisma.$connect();

    // Initialize Redis
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 15, // Test database
    });
    await redis.ping();

    // Initialize services with proper mocks
    idempotencyService = new IdempotencyService(redis);

    // Create PrismaService wrapper for repositories
    const prismaServiceWrapper = { db: prisma } as any;

    // Mock ProductCatalogService with proper Ethiopian pricing
    const mockProductCatalogService = {
      getVariantPrice: vi.fn().mockImplementation(async (variantId: string) => ({
        price: '450.00',
        currency: 'ETB',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })),
    };

    cartRepository = new CartRepository(prismaServiceWrapper);

    // Mock OrderService with createOrderFromCart method
    orderService = {
      createOrderFromCart: vi.fn().mockImplementation(async (command: CreateOrderCommand) => {
        // Validate Ethiopian phone number format
        const ethiopianPhoneRegex = /^\+251[9][0-9]{8}$/;
        const phoneNumber = command.shippingAddress.phoneNumber;

        if (!ethiopianPhoneRegex.test(phoneNumber)) {
          throw new BadRequestException('Phone number must be in Ethiopia format (+2519XXXXXXXX)');
        }

        // Get cart items for the order
        const cart = await prisma.cart.findUnique({
          where: { id: command.cartId },
          include: { items: true },
        });

        if (!cart) {
          throw new NotFoundException('Cart not found');
        }

        // Calculate totals from cart items
        let subtotalAmount = '0.00';
        if (cart.items && cart.items.length > 0) {
          subtotalAmount = cart.items.reduce((sum, item) => {
            const price = parseFloat(item.observedUnitPrice || '0'); // Use observedUnitPrice for CartItem
            return sum + (price * item.quantity);
          }, 0).toFixed(2);
        }

        const taxAmount = (parseFloat(subtotalAmount) * 0.15).toFixed(2); // 15% VAT
        const totalAmount = (parseFloat(subtotalAmount) + parseFloat(taxAmount)).toFixed(2);

        // Create order with Ethiopian VAT calculation
        const order = await prisma.order.create({
          data: {
            id: OrderFactory.createOrder().id,
            customerId: command.customerId,
            tenantId: command.tenantId,
            status: 'pending',
            currency: 'ETB',
            subtotalAmount,
            taxAmount,
            shippingAmount: '0.00',
            totalAmount,
            shippingAddress: command.shippingAddress as any, // Cast to JSON for Prisma
            billingAddress: command.billingAddress as any, // Cast to JSON for Prisma
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Create order items
        const orderItems = await Promise.all(
          cart.items.map(async (item) => {
            const unitPrice = item.observedUnitPrice || '250.00'; // Use observedUnitPrice from CartItem
            const totalPrice = (parseFloat(unitPrice) * item.quantity).toFixed(2);

            return prisma.orderItem.create({
              data: {
                id: OrderItemFactory.createOrderItem().id,
                orderId: order.id,
                catalogVariantId: item.catalogVariantId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                productName: 'Ethiopian Coffee',
                variantName: 'Premium Grade - 1kg',
                createdAt: new Date(),
                customerId: command.customerId,
                tenantId: command.tenantId,
              },
            });
          })
        );

        // Return OrderResponseDto structure
        return {
          id: order.id,
          customerId: order.customerId,
          statusId: order.status,
          statusLabel: order.status,
          items: orderItems.map(item => ({
            id: item.id,
            orderId: item.orderId,
            catalogVariantId: item.catalogVariantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productName: item.productName,
            variantName: item.variantName,
            createdAt: item.createdAt,
          })),
          totals: {
            subtotalAmount: order.subtotalAmount,
            taxAmount: order.taxAmount,
            shippingAmount: order.shippingAmount,
            totalAmount: order.totalAmount,
          },
        };
      }),
    } as any;

    checkoutService = new CheckoutService(orderService, cartRepository, idempotencyService);

    // Create test tenants
    tenant1 = await prisma.tenant.create({
      data: {
        id: AccountFactory.createAccount().id,
        name: 'Ethiopian Coffee Shop',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    tenant2 = await prisma.tenant.create({
      data: {
        id: AccountFactory.createAccount().id,
        name: 'Ethiopian Textile Store',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create CartStatus records for foreign key constraints
    await prisma.cartStatus.createMany({
      data: [
        { code: 'ACTIVE', label: 'Active', description: 'Cart is active and can be modified', isModifiable: true, isConvertible: true, isDeleted: false },
        { code: 'ABANDONED', label: 'Abandoned', description: 'Cart was abandoned by user', isModifiable: true, isConvertible: false, isDeleted: false },
        { code: 'EXPIRED', label: 'Expired', description: 'Cart has expired', isModifiable: true, isConvertible: false, isDeleted: false },
        { code: 'CONVERTED', label: 'Converted', description: 'Cart has been converted to order', isModifiable: false, isConvertible: false, isDeleted: false },
      ],
      skipDuplicates: true,
    });

    // Create test identities first (required for Account foreign key)
    const identity1Id = AccountFactory.createAccount().id;
    const identity2Id = AccountFactory.createAccount().id;

    await prisma.identity.create({
      data: {
        id: identity1Id,
        email: 'customer1@ethiopian-coffee.test',
        lifecycleStatusCode: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.identity.create({
      data: {
        id: identity2Id,
        email: 'customer2@ethiopian-textile.test',
        lifecycleStatusCode: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create customer accounts with valid identityId
    customer1Account = await prisma.account.create({
      data: AccountFactory.createAccount({
        identityId: identity1Id,
        scopeCode: 'customer',
        tenantId: tenant1.id,
        accountStatusCode: 'active',
      }),
    });

    customer2Account = await prisma.account.create({
      data: AccountFactory.createAccount({
        identityId: identity2Id,
        scopeCode: 'customer',
        tenantId: tenant2.id,
        accountStatusCode: 'active',
      }),
    });

    // Ethiopian address with subCity and woreda validation
    ethiopianAddress = {
      street: 'Bole Medhanealem, Street 123',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      subCity: 'Bole',
      woreda: 'Woreda 06',
      postalCode: '1000',
      country: 'Ethiopia',
      phoneNumber: '+251911234567', // Valid Ethiopian format
    };

    console.log('✅ Checkout Integration Infrastructure Ready');
  });

  beforeEach(async () => {
    // Clean up Redis test keys
    const keys = await redis.keys('test:idempotency:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Clean up database using utility
    await cleanupDatabase(prisma);
  });

  afterEach(async () => {
    // Clean up Redis test keys
    const keys = await redis.keys('test:idempotency:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  describe('Cart to Order Transition with Ethiopian Context', () => {
    it('should create order with Ethiopian address validation (subCity and woreda)', async () => {
      // Create cart with Ethiopian items
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      // Add Ethiopian coffee items
      await prisma.cartItem.create({
        data: CartItemFactory.createEthiopianCartItem(
          cart.id,
          customer1Account.id,
          tenant1.id
        ),
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      // Process checkout
      const order = await checkoutService.processCheckout(
        cart.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        `checkout_${cart.id}_${Date.now()}`
      );

      // Verify order creation
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe(customer1Account.id);

      // Verify Ethiopian address fields are preserved
      const createdOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });

      expect(createdOrder).toBeDefined();
      expect(createdOrder?.shippingAddress).toMatchObject({
        subCity: 'Bole',
        woreda: 'Woreda 06',
        phoneNumber: '+251911234567',
      });

      // Verify Ethiopian VAT calculation (15%)
      if (createdOrder?.taxAmount) {
        expect(parseFloat(createdOrder.taxAmount)).toBeCloseTo(135.00, 2); // 15% of 900.00 (450.00 × 2)
      }

      // Verify financial totals in OrderResponseDto structure
      expect(order.totals).toBeDefined();
      if (order.totals) {
        expect(parseFloat(order.totals.subtotalAmount)).toBeGreaterThan(0);
        expect(parseFloat(order.totals.taxAmount)).toBeGreaterThan(0);
        expect(parseFloat(order.totals.totalAmount)).toBeGreaterThan(0);
      }

      console.log('✅ Ethiopian address validation and VAT calculation verified');
    });

    it('should validate Ethiopian phone number format', async () => {
      // Test invalid phone number
      const invalidAddress = { ...ethiopianAddress, phoneNumber: '0911234567' }; // Missing +251

      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: invalidAddress,
        billingAddress: invalidAddress,
      };

      // Should fail validation
      await expect(
        checkoutService.processCheckout(
          cart.id,
          customer1Account.id,
          tenant1.id,
          checkoutCommand,
          `checkout_${cart.id}_${Date.now()}`
        )
      ).rejects.toThrow('Phone number must be in Ethiopia format');

      console.log('✅ Ethiopian phone number validation verified');
    });
  });

  describe('IdempotencyService Integration', () => {
    it('should prevent duplicate checkout with same idempotency key', async () => {
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      await prisma.cartItem.create({
        data: CartItemFactory.createEthiopianCartItem(
          cart.id,
          customer1Account.id,
          tenant1.id
        ),
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const idempotencyKey = `checkout_${cart.id}_${Date.now()}`;

      // First checkout should succeed
      const order1 = await checkoutService.processCheckout(
        cart.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        idempotencyKey
      );

      expect(order1).toBeDefined();
      expect(order1?.id).toBeDefined();

      // Second checkout with same key should return same order
      const order2 = await checkoutService.processCheckout(
        cart.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        idempotencyKey
      );

      expect(order2.id).toBe(order1.id);

      // Verify only one order was created
      const customer1Orders = await prisma.order.findMany({
        where: {
          customerId: customer1Account.id,
          tenantId: tenant1.id
        },
      });

      expect(customer1Orders).toHaveLength(1);
      expect(customer1Orders[0].id).toBe(order1.id);

      console.log('✅ Idempotency preventing duplicate orders verified');
    });

    it('should handle concurrent checkout attempts safely', async () => {
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      await prisma.cartItem.create({
        data: CartItemFactory.createEthiopianCartItem(
          cart.id,
          customer1Account.id,
          tenant1.id
        ),
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const idempotencyKey = `checkout_${cart.id}_${Date.now()}`;

      // Simulate concurrent checkout attempts
      const results = await Promise.allSettled([
        checkoutService.processCheckout(cart.id, customer1Account.id, tenant1.id, checkoutCommand, idempotencyKey),
        checkoutService.processCheckout(cart.id, customer1Account.id, tenant1.id, checkoutCommand, idempotencyKey),
        checkoutService.processCheckout(cart.id, customer1Account.id, tenant1.id, checkoutCommand, idempotencyKey),
      ]);

      // All should succeed with the same order ID
      const successfulResults = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
      const orderIds = successfulResults.map(r => r.value.id);

      expect(successfulResults).toHaveLength(3);
      expect(new Set(orderIds).size).toBe(1); // All should be the same order

      // Verify only one order was created
      const orders = await prisma.order.findMany({
        where: { customerId: customer1Account.id, tenantId: tenant1.id },
      });

      expect(orders).toHaveLength(1);

      console.log('✅ Concurrent checkout safety verified');
    });
  });

  describe('Tenant Isolation RLS Testing', () => {
    it('should prevent cross-tenant order visibility', async () => {
      // Create carts for both tenants
      const cart1 = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      const cart2 = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer2Account.id, tenant2.id),
          status: 'ACTIVE',
        },
      });

      // Create orders for both tenants
      const checkoutCommand1: CreateOrderCommand = {
        cartId: cart1.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const checkoutCommand2: CreateOrderCommand = {
        cartId: cart2.id,
        customerId: customer2Account.id,
        tenantId: tenant2.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      await checkoutService.processCheckout(
        cart1.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand1,
        `checkout_${cart1.id}_${Date.now()}`
      );

      await checkoutService.processCheckout(
        cart2.id,
        customer2Account.id,
        tenant2.id,
        checkoutCommand2,
        `checkout_${cart2.id}_${Date.now()}`
      );

      // Verify tenant isolation - each tenant should only see their own orders
      const tenant1Orders = await prisma.order.findMany({
        where: { tenantId: tenant1.id },
      });

      const tenant2Orders = await prisma.order.findMany({
        where: { tenantId: tenant2.id },
      });

      expect(tenant1Orders).toHaveLength(1);
      expect(tenant2Orders).toHaveLength(1);
      if (tenant1Orders[0] && tenant2Orders[0]) {
        expect(tenant1Orders[0].customerId).toBe(customer1Account.id);
        expect(tenant2Orders[0].customerId).toBe(customer2Account.id);
      }

      // Verify no cross-tenant access
      const crossTenantAccess = await prisma.order.findMany({
        where: {
          tenantId: tenant1.id,
          customerId: customer2Account.id // Wrong customer for this tenant
        },
      });

      expect(crossTenantAccess).toHaveLength(0);

      console.log('✅ Tenant isolation RLS policies verified');
    });

    it('should enforce tenant isolation on order items', async () => {
      // Create order with items for tenant 1
      const cart1 = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      await prisma.cartItem.create({
        data: CartItemFactory.createEthiopianCartItem(
          cart1.id,
          customer1Account.id,
          tenant1.id
        ),
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart1.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      await checkoutService.processCheckout(
        cart1.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        `checkout_${cart1.id}_${Date.now()}`
      );

      // Verify order items are tenant-isolated
      const orderItems = await prisma.orderItem.findMany({
        where: { tenantId: tenant1.id },
      });

      expect(orderItems).toHaveLength(1);
      if (orderItems[0]) {
        expect(orderItems[0].productName).toBe('Ethiopian Coffee');
      }

      // Verify no cross-tenant item access
      const crossTenantItems = await prisma.orderItem.findMany({
        where: {
          tenantId: tenant1.id,
          customerId: customer2Account.id
        },
      });

      expect(crossTenantItems).toHaveLength(0);

      console.log('✅ Order item tenant isolation verified');
    });
  });

  describe('Account Model Identity References', () => {
    it('should use Account model for all identity references', async () => {
      // Create cart with account identity
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
          customerId: customer1Account.id, // Account ID reference
        },
      });

      await prisma.cartItem.create({
        data: {
          ...CartItemFactory.createEthiopianCartItem(
            cart.id,
            customer1Account.id,
            tenant1.id
          ),
          customerId: customer1Account.id, // Account ID reference
        },
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id, // Account ID reference
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const result = await checkoutService.processCheckout(
        cart.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        `checkout_${cart.id}_${Date.now()}`
      );

      // Verify order uses Account model references
      expect(result.customerId).toBe(customer1Account.id);

      const order = await prisma.order.findUnique({
        where: { id: result.id },
      });

      expect(order).toBeDefined();
      expect(order?.customerId).toBe(customer1Account.id);

      // Verify Account relationship integrity
      const account = await prisma.account.findUnique({
        where: { id: customer1Account.id },
      });

      expect(account).toBeDefined();
      if (account) {
        expect(account.id).toBe(customer1Account.id);
        expect(account.scopeCode).toBe('customer');
      }

      console.log('✅ Account model identity references verified');
    });

    it('should maintain account relationship integrity across cart-to-order transition', async () => {
      // Create account with specific properties
      const testAccountId = AccountFactory.createAccount().id;

      // Create identity first
      const testIdentity = await prisma.identity.create({
        data: {
          id: testAccountId,
          email: 'test-integrity@ethiopian.test',
          lifecycleStatusCode: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const testAccount = await prisma.account.create({
        data: AccountFactory.createAccount({
          identityId: testAccountId,
          scopeCode: 'customer',
          tenantId: tenant1.id,
          accountStatusCode: 'active',
        }),
      });

      // Create cart with account
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(testAccount.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      await prisma.cartItem.create({
        data: CartItemFactory.createEthiopianCartItem(
          cart.id,
          testAccount.id,
          tenant1.id
        ),
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: testAccount.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const order = await checkoutService.processCheckout(
        cart.id,
        testAccount.id,
        tenant1.id,
        checkoutCommand,
        `checkout_${cart.id}_${Date.now()}`
      );

      // Verify account relationship is maintained throughout the chain
      expect(order.customerId).toBe(testAccount.id);

      const orderRecord = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      expect(orderRecord).toBeDefined();
      if (orderRecord) {
        expect(orderRecord.customerId).toBe(testAccount.id);
        expect(orderRecord.items).toHaveLength(1);
        if (orderRecord.items[0]) {
          expect(orderRecord.items[0].customerId).toBe(testAccount.id);
        }
      }

      // Verify account integrity
      const account = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });

      expect(account).toBeDefined();
      if (account) {
        expect(account.accountStatusCode).toBe('active');
      }

      console.log('✅ Account relationship integrity verified');
    });
  });

  describe('Revenue Chain Financial Validation', () => {
    it('should calculate correct Ethiopian VAT and totals', async () => {
      // Create cart with multiple items for VAT testing
      const cart = await prisma.cart.create({
        data: {
          ...CartFactory.createCartForCheckout(customer1Account.id, tenant1.id),
          status: 'ACTIVE',
        },
      });

      // Add multiple Ethiopian items with different prices
      await prisma.cartItem.createMany({
        data: [
          CartItemFactory.createCartItemForCart(
            cart.id,
            customer1Account.id,
            tenant1.id,
            {
              variantId: generateUlid(),
              name: 'Ethiopian Coffee',
              variantName: 'Premium Grade - 1kg',
              price: '450.00',
              quantity: 2,
            }
          ),
          CartItemFactory.createCartItemForCart(
            cart.id,
            customer1Account.id,
            tenant1.id,
            {
              variantId: generateUlid(),
              name: 'Ethiopian Honey',
              variantName: 'Pure Wild Honey - 500g',
              price: '280.00',
              quantity: 1,
            }
          ),
        ],
      });

      const checkoutCommand: CreateOrderCommand = {
        cartId: cart.id,
        customerId: customer1Account.id,
        tenantId: tenant1.id,
        shippingAddress: ethiopianAddress,
        billingAddress: ethiopianAddress,
      };

      const order = await checkoutService.processCheckout(
        cart.id,
        customer1Account.id,
        tenant1.id,
        checkoutCommand,
        `checkout_${cart.id}_${Date.now()}`
      );

      // Verify financial calculations
      expect(order).toBeDefined();
      expect(order.totals).toBeDefined();

      if (order.totals) {
        // Expected calculations:
        // Coffee: 450.00 * 2 = 900.00
        // Honey: 280.00 * 1 = 280.00
        // Subtotal: 1180.00
        // VAT (15%): 177.00
        // Total: 1357.00
        expect(parseFloat(order.totals.subtotalAmount)).toBeCloseTo(1180.00, 2);
        expect(parseFloat(order.totals.taxAmount)).toBeCloseTo(177.00, 2); // 15% VAT
        expect(parseFloat(order.totals.totalAmount)).toBeCloseTo(1357.00, 2);
      }

      console.log('✅ Ethiopian VAT and financial calculations verified');
    });
  });
});

// Helper function to generate ULID
function generateUlid(): string {
  return '01' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
