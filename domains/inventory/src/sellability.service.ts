import type {
  SellabilityEvaluationRequest,
  SellabilityEvaluationResponse,
  BulkSellabilityEvaluationRequest,
  BulkSellabilityEvaluationResponse,
  SellabilityDecision,
  SellabilityReason,
  SellabilityRuleConfig,
  CatalogVariantId,
} from '@spareparts/contracts';
import { InventoryAggregate } from './inventory.aggregate';

/**
 * Inventory sellability domain service.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** sellability decision evaluation
 * - **Invariants:** sellability is a business decision, not quantity-based
 * - **Semantics:** sellability determines if customers can attempt purchase
 */
export class InventorySellabilityService {
  private static defaultConfig: SellabilityRuleConfig = {
    minimumAvailableQuantity: 1,
    lowStockThreshold: 5,
    maxOrderPercentage: 100,
    allowBackorders: false,
    ruleOverrides: [],
  };

  /**
   * Evaluates sellability for a single variant.
   *
   * @param params - Evaluation parameters
   * @returns Sellability decision and reasoning
   */
  static evaluateSellability(params: {
    request: SellabilityEvaluationRequest;
    inventory: InventoryAggregate;
    config?: SellabilityRuleConfig;
  }): SellabilityEvaluationResponse {
    const { request, inventory, config = this.defaultConfig } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (request.catalogVariantId !== inventory.catalogVariantId) {
      throw new Error('Catalog variant ID mismatch');
    }

    const decision = this.calculateSellabilityDecision(inventory, config);
    const canFulfillImmediately = this.canFulfillImmediately(inventory, config);

    return {
      decision: decision.decision,
      reason: decision.reason,
      inventoryState: inventory.quantities,
      context: {
        canFulfillImmediately,
        estimatedRestockDate: decision.estimatedRestockDate,
        minimumOrderQuantity: config.minimumAvailableQuantity,
        maximumOrderQuantity: this.calculateMaximumOrderQuantity(inventory, config),
      },
      evaluatedAt: new Date(),
      validUntil: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      warnings: decision.warnings,
    };
  }

  /**
   * Evaluates sellability for multiple variants.
   *
   * @param params - Bulk evaluation parameters
   * @returns Bulk sellability decisions
   */
  static evaluateBulkSellability(params: {
    request: BulkSellabilityEvaluationRequest;
    inventories: Map<string, InventoryAggregate>;
    config?: SellabilityRuleConfig;
  }): BulkSellabilityEvaluationResponse {
    const { request, inventories, config = this.defaultConfig } = params;
    const results = [];
    let sellableCount = 0;
    let notSellableCount = 0;
    let restrictedCount = 0;
    let outOfStockCount = 0;

    for (const catalogVariantId of request.catalogVariantIds) {
      const inventory = inventories.get(catalogVariantId);

      if (!inventory) {
        results.push({
          catalogVariantId,
          decision: 'unknown' as SellabilityDecision,
          reason: 'not_found' as SellabilityReason,
          inventoryState: {
            onHand: 0,
            reserved: 0,
            allocated: 0,
            available: 0,
          },
          canFulfillImmediately: false,
          warnings: ['Inventory not found'],
        });
        notSellableCount++;
        continue;
      }

      const evaluation = this.evaluateSellability({
        request: {
          tenantId: request.tenantId,
          catalogVariantId,
          context: request.context,
        },
        inventory,
        config,
      });

      results.push({
        catalogVariantId,
        decision: evaluation.decision,
        reason: evaluation.reason,
        inventoryState: evaluation.inventoryState,
        canFulfillImmediately: evaluation.context?.canFulfillImmediately || false,
        warnings: evaluation.warnings,
      });

      // Count statistics
      switch (evaluation.decision) {
        case 'sellable':
          sellableCount++;
          break;
        case 'not_sellable':
          notSellableCount++;
          if (evaluation.reason === 'out_of_stock') {
            outOfStockCount++;
          }
          break;
        case 'restricted':
          restrictedCount++;
          break;
      }
    }

    return {
      results,
      summary: {
        totalVariants: request.catalogVariantIds.length,
        sellableCount,
        notSellableCount,
        restrictedCount,
        outOfStockCount,
      },
      evaluatedAt: new Date(),
    };
  }

  /**
   * Calculates sellability decision.
   *
   * @param inventory - Inventory aggregate
   * @param config - Sellability configuration
   * @returns Sellability decision and reasoning
   */
  private static calculateSellabilityDecision(
    inventory: InventoryAggregate,
    config: SellabilityRuleConfig
  ): { decision: SellabilityDecision; reason: SellabilityReason; warnings?: string[]; estimatedRestockDate?: Date } {
    // Check for rule overrides first
    const override = config.ruleOverrides?.find(
      override => override.catalogVariantId === inventory.catalogVariantId
    );

    if (override) {
      if (override.expiresAt && new Date() > override.expiresAt) {
        // Override has expired, continue with normal evaluation
      } else {
        return {
          decision: override.decision,
          reason: override.reason,
        };
      }
    }

    // Check if inventory is active
    if (!inventory.status.isActive) {
      return {
        decision: 'not_sellable',
        reason: 'not_active',
      };
    }

    // Check explicit sellability status
    if (!inventory.status.isSellable) {
      return {
        decision: 'restricted',
        reason: 'business_rule',
      };
    }

    // Check inventory availability
    if (inventory.quantities.available < config.minimumAvailableQuantity) {
      if (inventory.quantities.available === 0) {
        return {
          decision: 'not_sellable',
          reason: 'out_of_stock',
        };
      } else {
        return {
          decision: 'restricted',
          reason: 'low_inventory',
          warnings: [`Only ${inventory.quantities.available} units available`],
        };
      }
    }

    // Check low stock threshold
    const warnings: string[] = [];
    if (config.lowStockThreshold && inventory.quantities.available <= config.lowStockThreshold) {
      warnings.push(`Low stock: only ${inventory.quantities.available} units available`);
    }

    return {
      decision: 'sellable',
      reason: 'sufficient_inventory',
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Determines if inventory can fulfill immediately.
   *
   * @param inventory - Inventory aggregate
   * @param config - Sellability configuration
   * @returns Whether immediate fulfillment is possible
   */
  private static canFulfillImmediately(inventory: InventoryAggregate, config: SellabilityRuleConfig): boolean {
    return inventory.quantities.available >= config.minimumAvailableQuantity &&
           inventory.status.isActive &&
           inventory.status.isSellable;
  }

  /**
   * Calculates maximum order quantity.
   *
   * @param inventory - Inventory aggregate
   * @param config - Sellability configuration
   * @returns Maximum order quantity
   */
  private static calculateMaximumOrderQuantity(inventory: InventoryAggregate, config: SellabilityRuleConfig): number {
    const maxByPercentage = Math.floor(inventory.quantities.onHand * (config.maxOrderPercentage / 100));
    const maxByAvailable = inventory.quantities.available;

    return Math.min(maxByPercentage, maxByAvailable);
  }

  /**
   * Validates sellability evaluation request.
   *
   * @param request - Evaluation request to validate
   * @throws Error - If request is invalid
   */
  static validateEvaluationRequest(request: SellabilityEvaluationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }

    if (!request.context?.requestedBy) {
      throw new Error('Requested by is required');
    }
  }

  /**
   * Validates bulk evaluation request.
   *
   * @param request - Bulk evaluation request to validate
   * @throws Error - If request is invalid
   */
  static validateBulkEvaluationRequest(request: BulkSellabilityEvaluationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.catalogVariantIds || request.catalogVariantIds.length === 0) {
      throw new Error('At least one catalog variant ID is required');
    }

    if (request.catalogVariantIds.length > 50) {
      throw new Error('Cannot exceed 50 variants per request');
    }

    if (!request.context?.requestedBy) {
      throw new Error('Requested by is required');
    }
  }

  /**
   * Updates sellability configuration.
   *
   * @param newConfig - New configuration
   * @returns Updated configuration
   */
  static updateConfiguration(newConfig: Partial<SellabilityRuleConfig>): SellabilityRuleConfig {
    return {
      ...this.defaultConfig,
      ...newConfig,
      ruleOverrides: newConfig.ruleOverrides || this.defaultConfig.ruleOverrides,
    };
  }

  /**
   * Adds rule override for specific variant.
   *
   * @param params - Override parameters
   * @returns Updated configuration
   */
  static addRuleOverride(params: {
    catalogVariantId: CatalogVariantId;
    decision: SellabilityDecision;
    reason: SellabilityReason;
    expiresAt?: Date;
  }): SellabilityRuleConfig {
    const override = {
      catalogVariantId: params.catalogVariantId,
      decision: params.decision,
      reason: params.reason,
      expiresAt: params.expiresAt,
    };

    return {
      ...this.defaultConfig,
      ruleOverrides: [
        ...(this.defaultConfig.ruleOverrides || []).filter(o => o.catalogVariantId !== params.catalogVariantId),
        override,
      ],
    };
  }

  /**
   * Removes rule override for specific variant.
   *
   * @param catalogVariantId - Catalog variant ID
   * @returns Updated configuration
   */
  static removeRuleOverride(catalogVariantId: CatalogVariantId): SellabilityRuleConfig {
    return {
      ...this.defaultConfig,
      ruleOverrides: (this.defaultConfig.ruleOverrides || []).filter(o => o.catalogVariantId !== catalogVariantId),
    };
  }
}
