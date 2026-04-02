import type {
  CreateReservationRequest,
  CreateReservationResponse,
  ReleaseReservationRequest,
  ReleaseReservationResponse,
  InventoryReservationId,
  CatalogVariantId,
  InventoryTenantId,
  InventoryQuantityBreakdown
} from '@spareparts/contracts';
import { InventoryAggregate, InventoryQuantityCalculator } from './inventory.aggregate';

/**
 * Inventory reservation domain service.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** reservation lifecycle management
 * - **Invariants:** reservations are temporary and reversible
 * - **Semantics:** reservations reduce availability but not on-hand quantity
 */
export class InventoryReservationService {
  /**
   * Creates a new inventory reservation.
   *
   * @param params - Reservation creation parameters
   * @returns Reservation creation result
   * @throws Error - If reservation cannot be created
   */
  static createReservation(params: {
    request: CreateReservationRequest;
    inventory: InventoryAggregate;
  }): CreateReservationResponse {
    const { request, inventory } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (request.catalogVariantId !== inventory.catalogVariantId) {
      throw new Error('Catalog variant ID mismatch');
    }

    if (!InventoryQuantityCalculator.canReserve(inventory.quantities, request.quantity)) {
      throw new Error('Insufficient available quantity for reservation');
    }

    const updatedQuantities = InventoryQuantityCalculator.applyReservation(
      inventory.quantities,
      request.quantity
    );

    const reservationId: InventoryReservationId = `res_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const expiresAt = request.expiresAt || new Date(Date.now() + 60 * 60 * 1000);

    return {
      success: true,
      reservation: {
        id: reservationId,
        catalogVariantId: request.catalogVariantId,
        quantity: request.quantity,
        purpose: request.purpose,
        expiresAt,
        createdAt: new Date(),
        referenceId: request.referenceId,
      },
      quantities: updatedQuantities,
    };
  }

  /**
   * Releases an existing inventory reservation.
   *
   * @param params - Reservation release parameters
   * @returns Reservation release result
   * @throws Error - If reservation cannot be released
   */
  static releaseReservation(params: {
    request: ReleaseReservationRequest;
    inventory: InventoryAggregate;
    currentReservationQuantity: number;
  }): ReleaseReservationResponse {
    const { request, inventory, currentReservationQuantity } = params;

    if (request.tenantId !== inventory.tenantId) {
      throw new Error('Tenant scope mismatch');
    }

    if (request.metadata.reason === 'converted') {
      if (currentReservationQuantity <= 0) {
        throw new Error('No reservation quantity to release');
      }
    } else {
      if (currentReservationQuantity <= 0) {
        throw new Error('No reservation quantity to release');
      }
    }

    const updatedQuantities = InventoryQuantityCalculator.releaseReservation(
      inventory.quantities,
      currentReservationQuantity
    );

    return {
      success: true,
      reservation: {
        id: request.reservationId,
        catalogVariantId: inventory.catalogVariantId,
        quantity: currentReservationQuantity,
        releasedAt: new Date(),
      },
      quantities: updatedQuantities,
    };
  }

  /**
   * Converts a reservation to an allocation.
   *
   * @param params - Conversion parameters
   * @returns Updated inventory quantities
   * @throws Error - If conversion cannot be performed
   */
  static convertReservationToAllocation(params: {
    inventory: InventoryAggregate;
    reservationQuantity: number;
  }): InventoryQuantityBreakdown {
    const { inventory, reservationQuantity } = params;

    const releasedQuantities = InventoryQuantityCalculator.releaseReservation(
      inventory.quantities,
      reservationQuantity
    );

    const allocatedQuantities = InventoryQuantityCalculator.applyAllocation(
      releasedQuantities,
      reservationQuantity
    );

    return allocatedQuantities;
  }

  /**
   * Checks if a reservation has expired.
   *
   * @param expiresAt - Expiration timestamp
   * @returns Whether reservation has expired
   */
  static isReservationExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Calculates time until reservation expiration.
   *
   * @param expiresAt - Expiration timestamp
   * @returns Time until expiration in milliseconds (negative if expired)
   */
  static getTimeUntilExpiration(expiresAt: Date): number {
    return expiresAt.getTime() - Date.now();
  }

  /**
   * Validates reservation request parameters.
   *
   * @param request - Reservation request to validate
   * @throws Error - If request is invalid
   */
  static validateReservationRequest(request: CreateReservationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.catalogVariantId) {
      throw new Error('Catalog variant ID is required');
    }

    if (request.quantity <= 0) {
      throw new Error('Reservation quantity must be positive');
    }

    if (!request.purpose) {
      throw new Error('Reservation purpose is required');
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (request.expiresAt && request.expiresAt <= new Date()) {
      throw new Error('Expiration time must be in the future');
    }

    if (request.referenceId && typeof request.referenceId !== 'string') {
      throw new Error('Reference ID must be a string');
    }
  }

  /**
   * Validates reservation release request parameters.
   *
   * @param request - Reservation release request to validate
   * @throws Error - If request is invalid
   */
  static validateReleaseRequest(request: ReleaseReservationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.reservationId) {
      throw new Error('Reservation ID is required');
    }

    if (!request.metadata?.initiatedBy) {
      throw new Error('Initiated by is required');
    }

    if (!request.metadata?.reason) {
      throw new Error('Release reason is required');
    }
  }
}

/**
 * Reservation lifecycle state machine.
 *
 * @remarks
 * - Manages reservation state transitions
 * - Enforces valid state changes
 * - Provides reservation lifecycle semantics
 */
export class ReservationStateMachine {
  /**
   * Validates reservation state transition.
   *
   * @param fromState - Current state
   * @param toState - Target state
   * @returns Whether transition is valid
   */
  static isValidTransition(fromState: string, toState: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'active': ['released', 'expired', 'converted'],
      'released': [],
      'expired': [],
      'converted': [],
    };

    return validTransitions[fromState]?.includes(toState) || false;
  }

  /**
   * Gets next valid states for current state.
   *
   * @param currentState - Current reservation state
   * @returns Array of valid next states
   */
  static getNextValidStates(currentState: string): string[] {
    const validTransitions: Record<string, string[]> = {
      'active': ['released', 'expired', 'converted'],
      'released': [],
      'expired': [],
      'converted': [],
    };

    return validTransitions[currentState] || [];
  }

  /**
   * Determines reservation state based on timestamps.
   *
   * @param createdAt - Creation timestamp
   * @param releasedAt - Release timestamp (optional)
   * @param expiresAt - Expiration timestamp (optional)
   * @returns Current reservation state
   */
  static determineState(
    createdAt: Date,
    releasedAt?: Date,
    expiresAt?: Date
  ): 'active' | 'released' | 'expired' {
    if (releasedAt) {
      return 'released';
    }

    if (expiresAt && new Date() > expiresAt) {
      return 'expired';
    }

    return 'active';
  }
}
