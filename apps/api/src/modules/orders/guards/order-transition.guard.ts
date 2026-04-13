import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { OrderService } from '../services/order.service';
import { validateUlid } from '../../../shared/utils/ulid.validator';
import type { OrderTransitionRequestBody } from '../../../types/request.types';

/**
 * Order transition guard with governed state machine enforcement.
 *
 * @remarks
 * - **Scope:** Order transition authorization with governance enforcement
 * - **Authority:** Explicit scope verification for order state changes
 * - **Invariants:** Governed transitions, audit logging, fail-closed security
 * - **Security:** State machine validation, customer ownership, tenant isolation
 *
 * Features:
 * - Order status transition validation
 * - Customer ownership verification
 * - Scope-based authorization for transitions
 * - Comprehensive audit logging
 * - Production-grade error handling
 */
@Injectable()
export class OrderTransitionGuard implements CanActivate {
  private readonly logger = new Logger(OrderTransitionGuard.name);

  // Valid order status transitions
  private readonly validTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [], // Terminal state
    'cancelled': [], // Terminal state
  };

  // Customer-allowed transitions (more restrictive)
  private readonly customerAllowedTransitions: Record<string, string[]> = {
    'pending': ['cancelled'],
    'confirmed': ['cancelled'],
    'processing': [], // Customer cannot cancel once processing
    'shipped': [], // Customer cannot cancel once shipped
    'delivered': [], // Terminal state
    'cancelled': [], // Terminal state
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Determine if order transition request is authorized.
   *
   * @param context - Execution context with request details
   * @returns Promise<boolean> Whether transition is authorized
   * @throws {ForbiddenException} When authorization fails
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const orderId = request.params.id || request.params.orderId;

    // Log all order transition attempts for audit
    this.logger.log(`Order transition access attempt`, {
      method,
      url,
      orderId,
      customerId: user?.sub,
      tenantId: user?.tenantId,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString(),
    });

    try {
      // Verify user is authenticated
      if (!user || !user.sub) {
        this.logger.warn(`Order transition access denied: unauthenticated request`, {
          method,
          url,
          orderId,
        });

        throw new ForbiddenException('Authentication required for order transitions');
      }

      // Verify required scopes for order operations
      const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler()) || [];
      const userScopes = user.scopes || [];

      const hasOrderScope = requiredScopes.some(scope =>
        userScopes.includes(scope) ||
        (scope.startsWith('orders:') && userScopes.includes('orders:all'))
      );

      if (!hasOrderScope) {
        this.logger.warn(`Order transition access denied: insufficient scopes`, {
          method,
          url,
          orderId,
          customerId: user.sub,
          requiredScopes,
          userScopes,
        });

        throw new ForbiddenException('Insufficient scope for order operations');
      }

      // Verify tenant context is present in authenticated user
      if (!user?.tenantId) {
        this.logger.warn(`Order transition access denied: missing tenant context in user token`, {
          method,
          url,
          orderId,
          customerId: user.sub,
        });

        throw new ForbiddenException('Tenant context required for order operations');
      }

      // Validate order transition for PATCH/PUT requests
      if ((request.method === 'PATCH' || request.method === 'PUT') && orderId) {
        await this.validateOrderTransition(request, user.sub as string, user.tenantId as string);
      }

      this.logger.log(`Order transition access granted`, {
        method,
        url,
        orderId,
        customerId: user.sub,
        tenantId: user.tenantId,
      });

      return true;
    } catch (error) {
      // Log failed access attempt
      this.logger.error(`Order transition access denied`, {
        method,
        url,
        orderId,
        customerId: user?.sub,
        tenantId: user?.tenantId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      // Re-throw ForbiddenException
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Wrap other errors
      throw new ForbiddenException('Order transition authorization failed');
    }
  }

  /**
   * Validate order transition request.
   *
   * @param request - HTTP request
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<void>
   * @throws {ForbiddenException} When validation fails
   */
  private async validateOrderTransition(
    request: Request,
    customerId: string,
    tenantId: string,
  ): Promise<void> {
    const orderId = request.params.id || request.params.orderId;

    if (!orderId) {
      this.logger.warn(`Order transition access denied: missing order ID`, {
        customerId,
        tenantId,
      });

      throw new ForbiddenException('Order ID is required for transition operations');
    }

    // Validate order ID format using ULID validation
    try {
      validateUlid(orderId, 'orderId');
    } catch (error) {
      this.logger.warn(`Order transition access denied: invalid order ID format`, {
        orderId,
        customerId,
        tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ForbiddenException('Invalid order identifier format');
    }

    const body = request.body;

    // Validate request body
    if (!body || typeof body !== 'object') {
      this.logger.warn(`Order transition access denied: invalid request body`, {
        orderId,
        customerId,
        tenantId,
      });

      throw new ForbiddenException('Invalid order transition request data');
    }

    // Check if this is a status transition request
    if (body.status !== undefined) {
      await this.validateStatusTransition(request, orderId, body.status, customerId, tenantId);
    }

    // Check if this is a shipping information update
    if (body.shippingAddress || body.shippingInfo) {
      await this.validateShippingUpdate(request, orderId, customerId, tenantId);
    }

    this.logger.debug(`Order transition validation passed`, {
      orderId,
      customerId,
      tenantId,
    });
  }

  /**
   * Validate order status transition with database awareness.
   *
   * @param request - HTTP request
   * @param orderId - Order identifier
   * @param newStatus - New status to transition to
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<void>
   * @throws {ForbiddenException} When transition is invalid
   */
  private async validateStatusTransition(
    request: Request,
    orderId: string,
    newStatus: string,
    customerId: string,
    tenantId: string,
  ): Promise<void> {
    // Validate status format
    if (!newStatus || typeof newStatus !== 'string') {
      this.logger.warn(`Order transition access denied: invalid status format`, {
        orderId,
        customerId,
        tenantId,
        newStatus,
      });

      throw new ForbiddenException('Invalid order status format');
    }

    // Fetch current order from database to get actual status
    let currentOrder;
    try {
      currentOrder = await this.orderService.getOrder({
        orderId,
        customerId: request.user?.sub || customerId,
        tenantId,
      });
    } catch (error) {
      this.logger.warn(`Order transition access denied: order not found`, {
        orderId,
        customerId,
        tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ForbiddenException('Order not found or access denied');
    }

    const currentStatus = currentOrder.statusId;
    const userScopes = request.user?.scopes || [];
    const isCustomerRequest = !userScopes.includes('orders:admin') && !userScopes.includes('orders:tenant:admin');

    // Validate transition is allowed
    const allowedTransitions = isCustomerRequest
      ? this.customerAllowedTransitions
      : this.validTransitions;

    const validTransitionsFromCurrent = allowedTransitions[currentStatus] || [];

    if (!validTransitionsFromCurrent.includes(newStatus)) {
      this.logger.warn(`Order transition access denied: invalid status transition`, {
        orderId,
        customerId,
        tenantId,
        currentStatus,
        newStatus,
        isCustomerRequest,
        allowedTransitions: validTransitionsFromCurrent,
      });

      throw new ForbiddenException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${validTransitionsFromCurrent.join(', ')}`
      );
    }

    this.logger.debug(`Order status transition validated`, {
      orderId,
      customerId,
      tenantId,
      currentStatus,
      newStatus,
      isCustomerRequest,
    });
  }

  /**
   * Validate customer-initiated status transition.
   *
   * @param orderId - Order identifier
   * @param newStatus - New status
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @throws {ForbiddenException} When transition is not allowed for customers
   */
  private validateCustomerStatusTransition(
    orderId: string,
    newStatus: string,
    customerId: string,
    tenantId: string,
  ): void {
    // Customers can only cancel orders in certain states
    if (newStatus !== 'cancelled') {
      this.logger.warn(`Order transition access denied: customer cannot set status to ${newStatus}`, {
        orderId,
        customerId,
        tenantId,
        newStatus,
      });

      throw new ForbiddenException('Customers can only cancel orders');
    }

    this.logger.debug(`Customer status transition validation passed`, {
      orderId,
      customerId,
      tenantId,
      newStatus,
    });
  }

  /**
   * Validate staff/admin-initiated status transition.
   *
   * @param orderId - Order identifier
   * @param newStatus - New status
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @throws {ForbiddenException} When transition is invalid
   */
  private validateStaffStatusTransition(
    orderId: string,
    newStatus: string,
    customerId: string,
    tenantId: string,
  ): void {
    // Validate that the status is a valid order status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      this.logger.warn(`Order transition access denied: invalid status ${newStatus}`, {
        orderId,
        customerId,
        tenantId,
        newStatus,
        validStatuses,
      });

      throw new ForbiddenException(`Invalid order status: ${newStatus}`);
    }

    this.logger.debug(`Staff status transition validation passed`, {
      orderId,
      customerId,
      tenantId,
      newStatus,
    });
  }

  /**
   * Validate shipping information update.
   *
   * @param request - HTTP request
   * @param orderId - Order identifier
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<void>
   * @throws {ForbiddenException} When shipping update is not allowed
   */
  private async validateShippingUpdate(
    request: Request,
    orderId: string,
    customerId: string,
    tenantId: string,
  ): Promise<void> {
    const userScopes = request.user?.scopes || [];
    const isCustomerRequest = !userScopes.includes('orders:admin') && !userScopes.includes('orders:tenant:admin');

    if (isCustomerRequest) {
      this.logger.warn(`Order transition access denied: customer cannot update shipping information`, {
        orderId,
        customerId,
        tenantId,
      });

      throw new ForbiddenException('Customers cannot update shipping information');
    }

    // Validate shipping information format
    const body = request.body;
    if (body.shippingAddress) {
      this.validateAddressFormat(body.shippingAddress, 'shipping', orderId, customerId, tenantId);
    }

    this.logger.debug(`Shipping update validation passed`, {
      orderId,
      customerId,
      tenantId,
    });
  }

  /**
   * Validate address format for shipping updates.
   *
   * @param address - Address object to validate
   * @param type - Address type
   * @param orderId - Order identifier for logging
   * @param customerId - Customer identifier for logging
   * @param tenantId - Tenant identifier for logging
   * @throws {ForbiddenException} When address format is invalid
   */
  private validateAddressFormat(
    address: Record<string, unknown>,
    type: string,
    orderId: string,
    customerId: string,
    tenantId: string,
  ): void {
    if (!address || typeof address !== 'object') {
      this.logger.warn(`Order transition access denied: invalid ${type} address format`, {
        orderId,
        customerId,
        tenantId,
        addressType: type,
      });

      throw new ForbiddenException(`Invalid ${type} address format`);
    }

    // Required address fields
    const requiredFields = ['street', 'city', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);

    if (missingFields.length > 0) {
      this.logger.warn(`Order transition access denied: missing ${type} address fields`, {
        orderId,
        customerId,
        tenantId,
        addressType: type,
        missingFields,
      });

      throw new ForbiddenException(`Missing required ${type} address fields: ${missingFields.join(', ')}`);
    }

    this.logger.debug(`Address format validation passed`, {
      orderId,
      customerId,
      tenantId,
      addressType: type,
    });
  }
}
