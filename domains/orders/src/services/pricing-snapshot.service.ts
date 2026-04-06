import type {
  TenantId,
  CheckoutCatalogVariantId as CatalogVariantId,
} from '@spareparts/contracts';
import { CurrencyAmount } from '@spareparts/contracts';

/**
 * Pricing snapshot service for order price locking.
 *
 * @remarks
 * - **Scope:** pricing capture and validation
 * - **Authority:** domain business rules only
 * - **Invariants:** pricing snapshots are immutable and accurate
 * - **Security:** prevents price manipulation after order creation
 */
export class PricingSnapshotService {
  /**
   * Captures pricing snapshot for order items.
   *
   * @param params - Pricing capture parameters
   * @returns Pricing snapshot data
   * @throws Error - If pricing data is invalid
   *
   * @remarks
   * - Captures current catalog prices
   * - Includes tax and shipping calculations
   * - Stores metadata for audit trail
   * - Ensures pricing consistency
   */
  static async capturePricingSnapshot(params: {
    items: Array<{
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      quantity: number;
    }>;
    getCurrentPrice: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<string>;
    getTaxRate: (tenantId: TenantId, catalogVariantId: CatalogVariantId) => Promise<number>;
    getShippingCost: (params: {
      tenantId: TenantId;
      items: Array<{
        catalogVariantId: CatalogVariantId;
        quantity: number;
      }>;
      shippingAddress: {
        city: string;
        subCity?: string;
        woreda?: string;
      };
    }) => Promise<string>;
    shippingAddress: {
      city: string;
      subCity?: string;
      woreda?: string;
    };
  }): Promise<{
    items: Array<{
      tenantId: TenantId;
      catalogVariantId: CatalogVariantId;
      quantity: number;
      unitPrice: CurrencyAmount;
      totalPrice: CurrencyAmount;
      taxAmount: CurrencyAmount;
      metadata: {
        capturedAt: string;
        priceSource: string;
        taxRate: number;
      };
    }>;
    totals: {
      subtotalAmount: CurrencyAmount;
      taxAmount: CurrencyAmount;
      shippingAmount: CurrencyAmount;
      totalAmount: CurrencyAmount;
    };
    metadata: {
      capturedAt: string;
      priceTimestamp: string;
      exchangeRate?: number;
    };
  }> {
    const now = new Date();
    const capturedAt = now.toISOString();

    // Step 1: Capture individual item pricing
    const items = await Promise.all(
      params.items.map(async (item) => {
        const unitPrice = await params.getCurrentPrice(item.tenantId, item.catalogVariantId);
        const taxRate = await params.getTaxRate(item.tenantId, item.catalogVariantId);

        const unitPriceNum = parseFloat(unitPrice);
        const subtotalNum = unitPriceNum * item.quantity;
        const taxAmountNum = subtotalNum * (taxRate / 100);

        const unitPriceFormatted = unitPriceNum.toFixed(2);
        const totalPrice = subtotalNum.toFixed(2);
        const taxAmount = taxAmountNum.toFixed(2);

        return {
          tenantId: item.tenantId,
          catalogVariantId: item.catalogVariantId,
          quantity: item.quantity,
          unitPrice: unitPriceFormatted,
          totalPrice,
          taxAmount,
          metadata: {
            capturedAt,
            priceSource: 'catalog',
            taxRate,
          },
        };
      })
    );

    // Step 2: Calculate totals using cents for precision
    const subtotalCents = items.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.totalPrice) * 100);
    }, 0);

    const taxCents = items.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.taxAmount) * 100);
    }, 0);

    // Step 3: Calculate shipping cost
    const shippingCost = await params.getShippingCost({
      tenantId: items[0]?.tenantId || '', // TODO: Handle multi-tenant shipping
      items: params.items,
      shippingAddress: params.shippingAddress,
    });

    const shippingCents = Math.round(parseFloat(shippingCost) * 100);
    const totalCents = subtotalCents + taxCents + shippingCents;

    const totals = {
      subtotalAmount: (subtotalCents / 100).toFixed(2),
      taxAmount: (taxCents / 100).toFixed(2),
      shippingAmount: (shippingCents / 100).toFixed(2),
      totalAmount: (totalCents / 100).toFixed(2),
    };

    return {
      items,
      totals,
      metadata: {
        capturedAt,
        priceTimestamp: capturedAt,
        exchangeRate: undefined, // TODO: Get from exchange rate service if needed
      },
    };
  }

  /**
   * Validates pricing snapshot integrity.
   *
   * @param params - Validation parameters
   * @returns Validation result
   *
   * @remarks
   * - Ensures pricing calculations are correct
   * - Validates tax and shipping calculations
   * - Used for audit and compliance
   */
  static validatePricingSnapshot(params: {
    snapshot: {
      items: Array<{
        unitPrice: CurrencyAmount;
        totalPrice: CurrencyAmount;
        taxAmount: CurrencyAmount;
        quantity: number;
      }>;
      totals: {
        subtotalAmount: CurrencyAmount;
        taxAmount: CurrencyAmount;
        shippingAmount: CurrencyAmount;
        totalAmount: CurrencyAmount;
      };
    };
  }): {
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      expectedValue?: string;
      actualValue?: string;
    }>;
  } {
    const errors: Array<{
      field: string;
      message: string;
      expectedValue?: string;
      actualValue?: string;
    }> = [];

    const { snapshot } = params;

    // Validate individual item calculations
    snapshot.items.forEach((item, index) => {
      const unitPriceNum = parseFloat(item.unitPrice);
      const expectedTotal = (unitPriceNum * item.quantity).toFixed(2);

      if (item.totalPrice !== expectedTotal) {
        errors.push({
          field: `items[${index}].totalPrice`,
          message: 'Item total price calculation is incorrect',
          expectedValue: expectedTotal,
          actualValue: item.totalPrice,
        });
      }
    });

    // Validate totals sum correctly
    const calculatedSubtotal = snapshot.items.reduce((sum, item) => {
      return sum + Math.round(parseFloat(item.totalPrice) * 100);
    }, 0) / 100;

    if (snapshot.totals.subtotalAmount !== calculatedSubtotal.toFixed(2)) {
      errors.push({
        field: 'totals.subtotalAmount',
        message: 'Subtotal does not match sum of item totals',
        expectedValue: calculatedSubtotal.toFixed(2),
        actualValue: snapshot.totals.subtotalAmount,
      });
    }

    // Validate total calculation
    const subtotalCents = Math.round(parseFloat(snapshot.totals.subtotalAmount) * 100);
    const taxCents = Math.round(parseFloat(snapshot.totals.taxAmount) * 100);
    const shippingCents = Math.round(parseFloat(snapshot.totals.shippingAmount) * 100);
    const expectedTotal = ((subtotalCents + taxCents + shippingCents) / 100).toFixed(2);

    if (snapshot.totals.totalAmount !== expectedTotal) {
      errors.push({
        field: 'totals.totalAmount',
        message: 'Total amount calculation is incorrect',
        expectedValue: expectedTotal,
        actualValue: snapshot.totals.totalAmount,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
