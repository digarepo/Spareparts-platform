import type {
  CustomerId,
  TenantId,
  CurrencyAmount,
  OrderId,
  OrderItemId,
  OrderQuantity,
  CheckoutCatalogVariantId as CatalogVariantId
} from '@spareparts/contracts';
import { OrderStatus } from './value-objects/order-status';
import { DomainIdGenerator } from './value-objects/id-generator';

/**
 * Order item value object with pricing snapshot.
 *
 * @remarks
 * - **Scope:** order composition
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** quantity is positive integer, pricing is immutable
 */
export interface OrderItem {
  id: OrderItemId;
  orderId: OrderId;
  tenantId: TenantId;
  catalogVariantId: CatalogVariantId;
  inventoryReservationId?: string; // Phase 4 link
  quantity: OrderQuantity;
  unitPrice: CurrencyAmount; // Immutable pricing snapshot
  totalPrice: CurrencyAmount;
  productName: string;
  variantName: string;
  variantAttributes?: Record<string, unknown>;
  pricingMetadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Order address value object.
 *
 * @remarks
 * - **Scope:** order delivery information
 * - **Authority:** domain only
 * - **Invariants:** address fields are validated for Ethiopia context
 */
export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string; // Optional for Ethiopia context
  subCity?: string; // Ethiopia context: helpful for delivery
  woreda?: string; // Ethiopia context: administrative division
  country: string; // ISO 3166-1 alpha-2
}

/**
 * Order totals value object.
 *
 * @remarks
 * - **Scope:** order financial calculations
 * - **Authority:** domain only
 * - **Invariants:** all amounts are computed with proper precision
 */
export interface OrderTotals {
  subtotalAmount: CurrencyAmount;
  taxAmount: CurrencyAmount;
  shippingAmount: CurrencyAmount;
  totalAmount: CurrencyAmount;
}

/**
 * Order timestamps value object.
 *
 * @remarks
 * - **Scope:** order lifecycle tracking
 * - **Authority:** domain only
 * - **Invariants:** timestamps follow business process flow
 */
export interface OrderTimestamps {
  createdAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

/**
 * Order aggregate root.
 *
 * @remarks
 * - **Scope:** customer order management
 * - **Authority:** domain only; no persistence semantics
 * - **Invariants:** order totals match item totals, status transitions are valid
 * - **Security:** customer ownership, tenant responsibility isolation
 */
export interface OrderAggregate {
  id: OrderId;
  customerId: CustomerId;
  status: OrderStatus;
  items: OrderItem[];
  totals: OrderTotals;
  addresses: {
    shipping: OrderAddress;
    billing: OrderAddress;
  };
  timestamps: OrderTimestamps;
  metadata?: Record<string, unknown>;
}

/**
 * Order aggregate factory with business rule enforcement.
 *
 * @remarks
 * - **Threading/Async:** All methods are synchronous for domain logic
 * - **Side effects:** No external dependencies, pure domain logic
 * - **Tenancy:** Customer-owned with tenant item responsibility
 */
export class OrderAggregateFactory {
  /**
   * Creates a new order aggregate from cart.
   *
   * @param params - Order creation parameters
   * @returns New order aggregate
   * @throws Error - If business rules are violated
   *
   * @remarks
   * - Converts cart intent to order commitment
   * - Locks pricing at creation time
   * - Links to inventory reservations
   * - Uses ULID generator for proper ID generation
   */
  static create(params: {
    customerId: CustomerId;
    items: Array<{
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      inventoryReservationId?: string;
      quantity: OrderQuantity;
      unitPrice: CurrencyAmount;
      productName: string;
      variantName: string;
      variantAttributes?: Record<string, unknown>;
      pricingMetadata?: Record<string, unknown>;
    }>;
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    metadata?: Record<string, unknown>;
  }): OrderAggregate {
    if (!params.customerId) {
      throw new Error('Order must have a customer');
    }

    if (!params.items || params.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const now = new Date();
    const orderId = DomainIdGenerator.generateOrderId();

    // Create order items with computed totals
    const orderItems: OrderItem[] = params.items.map((item, index) => {
      const unitPriceNum = parseFloat(item.unitPrice);
      const totalPriceNum = unitPriceNum * item.quantity;
      const totalPrice = totalPriceNum.toFixed(2);

      return {
        id: DomainIdGenerator.generateOrderItemId(),
        orderId,
        tenantId: item.tenantId,
        catalogVariantId: item.catalogVariantId,
        inventoryReservationId: item.inventoryReservationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        productName: item.productName,
        variantName: item.variantName,
        variantAttributes: item.variantAttributes,
        pricingMetadata: item.pricingMetadata,
        createdAt: now,
      };
    });

    // Calculate order totals using cents for precision
    const subtotalCents = orderItems.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.totalPrice) * 100);
    }, 0);

    const subtotalAmount = (subtotalCents / 100).toFixed(2);

    // TODO: Calculate tax and shipping based on business rules
    const taxAmount = '0.00'; // Placeholder
    const shippingAmount = '0.00'; // Placeholder

    const totalCents = subtotalCents + Math.round(parseFloat(taxAmount) * 100) + Math.round(parseFloat(shippingAmount) * 100);
    const totalAmount = (totalCents / 100).toFixed(2);

    const totals: OrderTotals = {
      subtotalAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
    };

    const timestamps: OrderTimestamps = {
      createdAt: now,
    };

    return {
      id: orderId,
      customerId: params.customerId,
      status: new OrderStatus('PENDING', now),
      items: orderItems,
      totals,
      addresses: {
        shipping: params.shippingAddress,
        billing: params.billingAddress,
      },
      timestamps,
      metadata: params.metadata,
    };
  }

  /**
   * Confirms order with business validation.
   *
   * @param order - Order aggregate
   * @param initiatedBy - Who confirmed the order
   * @returns Updated order aggregate
   * @throws Error - If order cannot be confirmed
   *
   * @remarks
   * - Validates order is in confirmable state
   * - Updates status and timestamps
   * - Prevents duplicate confirmations
   */
  static confirm(order: OrderAggregate, initiatedBy: string): OrderAggregate {
    if (!order.status.canTransitionTo(new OrderStatus('CONFIRMED'))) {
      throw new Error(`Order ${order.id} cannot be confirmed from status: ${order.status.value}`);
    }

    const updatedStatus = order.status.transitionTo('CONFIRMED', initiatedBy);

    return {
      ...order,
      status: updatedStatus,
      timestamps: {
        ...order.timestamps,
        confirmedAt: new Date(),
      },
    };
  }

  /**
   * Ships order with tracking information.
   *
   * @param order - Order aggregate
   * @param initiatedBy - Who shipped the order
   * @returns Updated order aggregate
   * @throws Error - If order cannot be shipped
   *
   * @remarks
   * - Validates order is confirmed
   * - Updates status and timestamps
   * - Records shipping event
   */
  static ship(order: OrderAggregate, initiatedBy: string): OrderAggregate {
    if (!order.status.canTransitionTo(new OrderStatus('SHIPPED'))) {
      throw new Error(`Order ${order.id} cannot be shipped from status: ${order.status.value}`);
    }

    const updatedStatus = order.status.transitionTo('SHIPPED', initiatedBy);

    return {
      ...order,
      status: updatedStatus,
      timestamps: {
        ...order.timestamps,
        shippedAt: new Date(),
      },
    };
  }

  /**
   * Completes order successfully.
   *
   * @param order - Order aggregate
   * @param initiatedBy - Who completed the order
   * @returns Updated order aggregate
   * @throws Error - If order cannot be completed
   *
   * @remarks
   * - Validates order is shipped
   * - Updates status and timestamps
   * - Marks order as successfully delivered
   */
  static complete(order: OrderAggregate, initiatedBy: string): OrderAggregate {
    if (!order.status.canTransitionTo(new OrderStatus('COMPLETED'))) {
      throw new Error(`Order ${order.id} cannot be completed from status: ${order.status.value}`);
    }

    const updatedStatus = order.status.transitionTo('COMPLETED', initiatedBy);

    return {
      ...order,
      status: updatedStatus,
      timestamps: {
        ...order.timestamps,
        completedAt: new Date(),
      },
    };
  }

  /**
   * Cancels order with reason tracking.
   *
   * @param order - Order aggregate
   * @param reason - Cancellation reason
   * @param initiatedBy - Who cancelled the order
   * @returns Updated order aggregate
   * @throws Error - If order cannot be cancelled
   *
   * @remarks
   * - Validates order can be cancelled
   * - Updates status and timestamps
   * - Records cancellation reason for audit
   */
  static cancel(order: OrderAggregate, reason: string, initiatedBy: string): OrderAggregate {
    if (!order.status.canBeCancelled()) {
      throw new Error(`Order ${order.id} cannot be cancelled from status: ${order.status.value}`);
    }

    const updatedStatus = order.status.transitionTo('CANCELLED', initiatedBy);

    return {
      ...order,
      status: updatedStatus,
      timestamps: {
        ...order.timestamps,
        cancelledAt: new Date(),
      },
      metadata: {
        ...order.metadata,
        cancellationReason: reason,
        cancelledBy: initiatedBy,
        cancelledAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Marks order as failed with error details.
   *
   * @param order - Order aggregate
   * @param failureReason - Reason for failure
   * @param initiatedBy - Who marked order as failed
   * @returns Updated order aggregate
   * @throws Error - If order cannot be marked as failed
   *
   * @remarks
   * - Validates order can be marked as failed
   * - Updates status and timestamps
   * - Records failure details for troubleshooting
   */
  static markAsFailed(order: OrderAggregate, failureReason: string, initiatedBy: string): OrderAggregate {
    if (!order.status.canTransitionTo(new OrderStatus('FAILED'))) {
      throw new Error(`Order ${order.id} cannot be marked as failed from status: ${order.status.value}`);
    }

    const updatedStatus = order.status.transitionTo('FAILED', initiatedBy);

    return {
      ...order,
      status: updatedStatus,
      metadata: {
        ...order.metadata,
        failureReason,
        failedBy: initiatedBy,
        failedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Checks if order can be modified.
   *
   * @param order - Order aggregate
   * @returns True if order can be modified
   *
   * @remarks
   * - Used in business logic to prevent modifications
   * - Ensures data integrity for confirmed orders
   */
  static canBeModified(order: OrderAggregate): boolean {
    return !order.status.isTerminal() && order.status.value === 'PENDING';
  }

  /**
   * Gets tenant-scoped items from order.
   *
   * @param order - Order aggregate
   * @param tenantId - Tenant ID to filter by
   * @returns Items belonging to specified tenant
   *
   * @remarks
   * - Used for tenant-specific operations
   * - Enforces tenant isolation
   */
  static getTenantItems(order: OrderAggregate, tenantId: TenantId): OrderItem[] {
    return order.items.filter(item => item.tenantId === tenantId);
  }

  /**
   * Calculates tenant-specific totals.
   *
   * @param order - Order aggregate
   * @param tenantId - Tenant ID to calculate for
   * @returns Tenant-specific totals
   *
   * @remarks
   * - Used for tenant reporting and payments
   * - Maintains financial accuracy per tenant
   */
  static calculateTenantTotals(order: OrderAggregate, tenantId: TenantId): {
    itemCount: number;
    subtotalAmount: CurrencyAmount;
  } {
    const tenantItems = this.getTenantItems(order, tenantId);

    const itemCount = tenantItems.reduce((sum, item) => sum + item.quantity, 0);

    const subtotalCents = tenantItems.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.totalPrice) * 100);
    }, 0);

    const subtotalAmount = (subtotalCents / 100).toFixed(2);

    return {
      itemCount,
      subtotalAmount,
    };
  }
}
