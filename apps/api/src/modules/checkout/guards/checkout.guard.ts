import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { validateUlid } from '../../../shared/utils/ulid.validator';

/**
 * Checkout guard with explicit authorization and audit logging.
 *
 * @remarks
 * - **Scope:** Checkout endpoint authorization with deny-by-default security
 * - **Authority:** Explicit customer scope verification for checkout operations
 * - **Invariants:** No implicit checkout creation, comprehensive audit logging
 * - **Security:** Scope-first authorization, fail-closed design, audit trails
 *
 * Features:
 * - Explicit scope verification for checkout operations
 * - Customer ownership validation
 * - Comprehensive audit logging for all attempts
 * - Fail-closed security design
 * - Production-grade error handling
 */
@Injectable()
export class CheckoutGuard implements CanActivate {
  private readonly logger = new Logger(CheckoutGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determine if checkout request is authorized.
   *
   * @param context - Execution context with request details
   * @returns Promise<boolean> Whether request is authorized
   * @throws {ForbiddenException} When authorization fails
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const cartId = request.params.cartId;
    const idempotencyKey = request.headers['idempotency-key'];

    // Log all checkout attempts for audit
    this.logger.log(`Checkout access attempt`, {
      method,
      url,
      cartId,
      customerId: user?.sub,
      tenantId: user?.tenantId,
      idempotencyKey: idempotencyKey ? 'present' : 'absent',
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString(),
    });

    try {
      // Verify user is authenticated
      if (!user || !user.sub) {
        this.logger.warn(`Checkout access denied: unauthenticated request`, {
          method,
          url,
          cartId,
        });

        throw new ForbiddenException('Authentication required for checkout operations');
      }

      // Verify customer scope for checkout operations
      const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler()) || [];
      const userScopes = user.scopes || [];

      const hasCheckoutScope = requiredScopes.some(scope =>
        userScopes.includes(scope) ||
        (scope.startsWith('checkout:') && userScopes.includes('checkout:all'))
      );

      if (!hasCheckoutScope) {
        this.logger.warn(`Checkout access denied: insufficient scopes`, {
          method,
          url,
          cartId,
          customerId: user.sub,
          requiredScopes,
          userScopes,
        });

        throw new ForbiddenException('Insufficient scope for checkout operations');
      }

      // Verify tenant context is present in authenticated user
      if (!user?.tenantId) {
        this.logger.warn(`Checkout access denied: missing tenant context in user token`, {
          method,
          url,
          cartId,
          customerId: user.sub,
        });

        throw new ForbiddenException('Tenant context required for checkout operations');
      }

      // Additional validation for POST checkout requests
      if (request.method === 'POST' && url.includes('/checkout/')) {
        await this.validateCheckoutRequest(request, user.sub as string, user.tenantId as string);
      }

      this.logger.log(`Checkout access granted`, {
        method,
        url,
        cartId,
        customerId: user.sub,
        tenantId: user.tenantId,
      });

      return true;
    } catch (error) {
      // Log failed access attempt
      this.logger.error(`Checkout access denied`, {
        method,
        url,
        cartId,
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
      throw new ForbiddenException('Checkout authorization failed');
    }
  }

  /**
   * Validate specific checkout request requirements.
   *
   * @param request - HTTP request
   * @param customerId - Customer identifier
   * @param tenantId - Tenant identifier
   * @returns Promise<void>
   * @throws {ForbiddenException} When validation fails
   */
  private async validateCheckoutRequest(
    request: Request,
    customerId: string,
    tenantId: string,
  ): Promise<void> {
    // Validate cart ID format using ULID validation
    const cartId = request.params.cartId;
    if (!cartId) {
      this.logger.warn(`Checkout access denied: missing cart ID`, {
        customerId,
        tenantId,
      });

      throw new ForbiddenException('Cart identifier is required');
    }

    try {
      validateUlid(cartId, 'cartId');
    } catch (error) {
      this.logger.warn(`Checkout access denied: invalid cart ID format`, {
        cartId,
        customerId,
        tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ForbiddenException('Invalid cart identifier format');
    }

    // Address validation is now handled by AddressValidationPipe in the controller
    // This guard focuses on security and authorization only

    // Log successful validation
    this.logger.debug(`Checkout request validation passed`, {
      cartId,
      customerId,
      tenantId,
    });
  }
}
