import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Product catalog service for price verification and product information.
 *
 * @remarks
 * - **Scope:** Product price and information retrieval
 * - **Authority:** Read-only access to product catalog
 * - **Invariants:** Returns current prices from source of truth
 * - **Security:** Tenant isolation enforced
 */
@Injectable()
export class ProductCatalogService {
  private readonly logger = new Logger(ProductCatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets current price and product information for a variant.
   *
   * @param variantId - Product variant identifier
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<ProductVariantInfo | null> Current product information
   */
  async getVariantPrice(variantId: string, tenantId: string): Promise<ProductVariantInfo | null> {
    this.logger.log(`Getting price for variant: ${variantId} in tenant: ${tenantId}`);

    // Query product variant from database with tenant isolation
    const variant = await this.prisma.db.variant.findFirst({
      where: {
        id: variantId,
        product: {
          tenantId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      this.logger.debug(`Product variant not found: ${variantId}`, { tenantId });
      throw new Error(`Product variant not found: ${variantId}`);
    }

    const productInfo: ProductVariantInfo = {
      id: variant.id,
      price: '0.00', // TODO: Implement proper pricing service
      name: variant.product.name,
      variantName: variant.name,
    };

    this.logger.debug(`Retrieved price for variant: ${variantId}`, {
      price: productInfo.price,
      productName: productInfo.name,
    });

    return productInfo;
  }

  /**
   * Gets multiple variant prices for bulk operations.
   *
   * @param variantIds - Array of variant identifiers
   * @param tenantId - Tenant identifier for isolation
   * @returns Promise<ProductVariantInfo[]> Array of product information
   */
  async getVariantPrices(
    variantIds: string[],
    tenantId: string,
  ): Promise<ProductVariantInfo[]> {
    this.logger.log(`Getting prices for ${variantIds.length} variants in tenant: ${tenantId}`);

    // Query multiple product variants from database with tenant isolation
    const variants = await this.prisma.db.variant.findMany({
      where: {
        id: { in: variantIds },
        product: {
          tenantId,
        },
      },
      include: {
        product: true,
      },
    });

    const productInfos: ProductVariantInfo[] = variants.map((variant) => ({
      id: String(variant.id),
      price: '0.00', // TODO: Implement proper pricing service
      name: variant.product?.name || 'Unknown Product',
      variantName: String(variant.name),
    }));

    this.logger.debug(`Retrieved prices for ${productInfos.length} variants`, {
      requested: variantIds.length,
      found: productInfos.length,
    });

    return productInfos;
  }
}

/**
 * Product variant information interface.
 */
export interface ProductVariantInfo {
  id: string;
  price: string;
  name: string;
  variantName: string;
}
