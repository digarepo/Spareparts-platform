import { generateUlid, createEthiopianAmount, createPriceTimestamp, createEthiopianAddress } from './index';

/**
 * Factory for creating Cart test data matching the Prisma schema.
 */
export class CartFactory {
  static createCart(overrides?: Partial<Cart>): Cart {
    const now = new Date();
    return {
      id: generateUlid(),
      customerId: generateUlid(),
      tenantId: generateUlid(),
      status: 'active',
      currency: 'ETB',
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
      subtotalAmount: createEthiopianAmount('0.00'),
      totalItems: 0,
      metadata: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  static createCartWithItems(customerId: string, tenantId: string, itemCount: number = 1): Cart {
    const cart = this.createCart({
      customerId,
      tenantId,
      totalItems: itemCount,
      subtotalAmount: createEthiopianAmount(itemCount * 100), // 100 ETB per item
    });

    return cart;
  }

  static createExpiredCart(customerId: string, tenantId: string): Cart {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return this.createCart({
      customerId,
      tenantId,
      status: 'expired',
      expiresAt: yesterday,
    });
  }

  static createAbandonedCart(customerId: string, tenantId: string): Cart {
    return this.createCart({
      customerId,
      tenantId,
      status: 'abandoned',
      metadata: { abandonmentReason: 'user_session_timeout' },
    });
  }

  static createCartForCheckout(customerId: string, tenantId: string): Cart {
    return this.createCart({
      customerId,
      tenantId,
      status: 'active',
      totalItems: 2,
      subtotalAmount: createEthiopianAmount('250.00'), // 2 items at different prices
      metadata: { 
        readyForCheckout: true,
        priceFreshnessValid: true 
      },
    });
  }
}

/**
 * Factory for creating CartItem test data matching the Prisma schema.
 */
export class CartItemFactory {
  static createCartItem(overrides?: Partial<CartItem>): CartItem {
    const now = new Date();
    const unitPrice = createEthiopianAmount('100.00');
    const quantity = 1;
    const lineTotal = createEthiopianAmount(String(parseFloat(unitPrice) * quantity));

    return {
      id: generateUlid(),
      cartId: generateUlid(),
      customerId: generateUlid(),
      tenantId: generateUlid(),
      catalogVariantId: generateUlid(),
      quantity,
      observedUnitPrice: unitPrice,
      lineTotal,
      productName: 'Test Product',
      variantName: 'Test Variant',
      priceCapturedAt: createPriceTimestamp(now),
      metadata: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  static createCartItemForCart(
    cartId: string, 
    customerId: string, 
    tenantId: string,
    productInfo: {
      variantId: string;
      name: string;
      variantName: string;
      price: string;
      quantity: number;
    }
  ): CartItem {
    const now = new Date();
    const lineTotal = createEthiopianAmount(
      String(parseFloat(productInfo.price) * productInfo.quantity)
    );

    return this.createCartItem({
      cartId,
      customerId,
      tenantId,
      catalogVariantId: productInfo.variantId,
      quantity: productInfo.quantity,
      observedUnitPrice: productInfo.price,
      lineTotal,
      productName: productInfo.name,
      variantName: productInfo.variantName,
      priceCapturedAt: createPriceTimestamp(now),
    });
  }

  static createEthiopianCartItem(cartId: string, customerId: string, tenantId: string): CartItem {
    return this.createCartItemForCart(
      cartId,
      customerId,
      tenantId,
      {
        variantId: generateUlid(),
        name: 'Ethiopian Coffee',
        variantName: 'Premium Grade - 1kg',
        price: createEthiopianAmount('450.00'),
        quantity: 2,
      }
    );
  }
}

// Type definitions matching Prisma schema
export interface Cart {
  id: string;
  customerId: string;
  tenantId: string;
  status: string;
  currency: string;
  expiresAt: Date | null;
  subtotalAmount: string | null;
  totalItems: number | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  customerId: string;
  tenantId: string;
  catalogVariantId: string;
  quantity: number;
  observedUnitPrice: string;
  lineTotal: string;
  productName: string;
  variantName: string;
  priceCapturedAt: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}
