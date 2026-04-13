import { generateUlid, createEthiopianAmount, createPriceTimestamp, createEthiopianAddress } from './index';

/**
 * Factory for creating Order test data matching the Prisma schema.
 */
export class OrderFactory {
  static createOrder(overrides?: Partial<Order>): Order {
    const now = new Date();
    const subtotalAmount = createEthiopianAmount('200.00');
    const taxAmount = createEthiopianAmount('30.00'); // 15% VAT
    const shippingAmount = createEthiopianAmount('20.00');
    const totalAmount = createEthiopianAmount(String(
      parseFloat(subtotalAmount) + parseFloat(taxAmount) + parseFloat(shippingAmount)
    ));

    return {
      id: generateUlid(),
      customerId: generateUlid(),
      tenantId: generateUlid(),
      status: 'pending',
      currency: 'ETB',
      subtotalAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
      shippingAddress: createEthiopianAddress(),
      billingAddress: createEthiopianAddress(),
      metadata: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  static createOrderForCustomer(
    customerId: string, 
    tenantId: string, 
    items: OrderItem[]
  ): Order {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const subtotalAmount = createEthiopianAmount(String(subtotal));
    const taxAmount = createEthiopianAmount(String(subtotal * 0.15)); // 15% Ethiopian VAT
    const shippingAmount = createEthiopianAmount('20.00');
    const totalAmount = createEthiopianAmount(String(
      subtotal + parseFloat(taxAmount) + parseFloat(shippingAmount)
    ));

    return this.createOrder({
      customerId,
      tenantId,
      status: 'pending',
      subtotalAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
      metadata: {
        itemCount: items.length,
        source: 'checkout',
      },
    });
  }

  static createConfirmedOrder(customerId: string, tenantId: string): Order {
    return this.createOrder({
      customerId,
      tenantId,
      status: 'confirmed',
      metadata: {
        confirmedAt: new Date().toISOString(),
        paymentMethod: 'mobile_money',
      },
    });
  }

  static createShippedOrder(customerId: string, tenantId: string): Order {
    return this.createOrder({
      customerId,
      tenantId,
      status: 'shipped',
      metadata: {
        shippedAt: new Date().toISOString(),
        trackingNumber: 'ET-TRACK-123456',
        shippingProvider: 'Ethiopian Postal Service',
      },
    });
  }

  static createDeliveredOrder(customerId: string, tenantId: string): Order {
    return this.createOrder({
      customerId,
      tenantId,
      status: 'delivered',
      metadata: {
        deliveredAt: new Date().toISOString(),
        deliveryConfirmation: true,
      },
    });
  }

  static createCancelledOrder(customerId: string, tenantId: string, reason: string): Order {
    return this.createOrder({
      customerId,
      tenantId,
      status: 'cancelled',
      metadata: {
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
        refundProcessed: false,
      },
    });
  }

  static createEthiopianOrder(customerId: string, tenantId: string): Order {
    const ethiopianAddress = createEthiopianAddress({
      street: 'Bole Medhanealem, Street 123',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '06',
      postalCode: '1000',
    });

    return this.createOrder({
      customerId,
      tenantId,
      status: 'pending',
      shippingAddress: ethiopianAddress,
      billingAddress: ethiopianAddress,
      metadata: {
        market: 'ethiopia',
        currency: 'ETB',
        paymentMethod: 'telebirr',
      },
    });
  }
}

/**
 * Factory for creating OrderItem test data matching the Prisma schema.
 */
export class OrderItemFactory {
  static createOrderItem(overrides?: Partial<OrderItem>): OrderItem {
    const now = new Date();
    const unitPrice = createEthiopianAmount('100.00');
    const quantity = 1;
    const totalPrice = createEthiopianAmount(String(parseFloat(unitPrice) * quantity));

    return {
      id: generateUlid(),
      orderId: generateUlid(),
      customerId: generateUlid(),
      tenantId: generateUlid(),
      catalogVariantId: generateUlid(),
      inventoryReservationId: generateUlid(),
      quantity,
      unitPrice,
      totalPrice,
      productName: 'Test Product',
      variantName: 'Test Variant',
      metadata: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  static createOrderItemForOrder(
    orderId: string,
    customerId: string,
    tenantId: string,
    productInfo: {
      variantId: string;
      name: string;
      variantName: string;
      price: string;
      quantity: number;
      reservationId?: string;
    }
  ): OrderItem {
    const now = new Date();
    const totalPrice = createEthiopianAmount(
      String(parseFloat(productInfo.price) * productInfo.quantity)
    );

    return this.createOrderItem({
      orderId,
      customerId,
      tenantId,
      catalogVariantId: productInfo.variantId,
      inventoryReservationId: productInfo.reservationId,
      quantity: productInfo.quantity,
      unitPrice: productInfo.price,
      totalPrice,
      productName: productInfo.name,
      variantName: productInfo.variantName,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createEthiopianOrderItem(orderId: string, customerId: string, tenantId: string): OrderItem {
    return this.createOrderItemForOrder(
      orderId,
      customerId,
      tenantId,
      {
        variantId: generateUlid(),
        name: 'Ethiopian Coffee - Yirgacheffe',
        variantName: 'Premium Grade - 500g',
        price: createEthiopianAmount('280.00'),
        quantity: 2,
        reservationId: generateUlid(),
      }
    );
  }

  static createMultipleOrderItems(
    orderId: string,
    customerId: string,
    tenantId: string,
    products: Array<{
      variantId: string;
      name: string;
      variantName: string;
      price: string;
      quantity: number;
    }>
  ): OrderItem[] {
    return products.map((product, index) =>
      this.createOrderItemForOrder(
        orderId,
        customerId,
        tenantId,
        {
          ...product,
          reservationId: generateUlid(),
        }
      )
    );
  }
}

// Type definitions matching Prisma schema
export interface Order {
  id: string;
  customerId: string;
  tenantId: string;
  status: string;
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  shippingAddress: any;
  billingAddress: any;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  customerId: string;
  tenantId: string;
  catalogVariantId: string;
  inventoryReservationId: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  productName: string;
  variantName: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}
