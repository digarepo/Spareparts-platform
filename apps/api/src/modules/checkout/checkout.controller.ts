import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Logger,
  Header,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { Scopes } from '../../auth/decorators/scopes.decorator';
import { CheckoutService } from './checkout.service';
import { CreateOrderCommand } from '../orders/dto/commands/create-order.command';
import { OrderResponseDto } from '../orders/dto/responses/order-response.dto';
import { AddressValidationPipe } from '../../shared/pipes/address-validation.pipe';
import { EthiopiaAddressDto } from '../../shared/dto/ethiopia-address.dto';
import type { AuthenticatedRequest, CheckoutRequestBody, ReservationRequestBody } from '../../types/request.types';

/**
 * Checkout controller with idempotent cart-to-order conversion.
 *
 * @remarks
 * - **Scope:** Explicit checkout endpoints with idempotency guarantees
 * - **Authority:** Customer checkout with explicit intent confirmation
 * - **Security:** Customer ownership verification, tenant isolation, scope enforcement
 * - **Standards:** RESTful design, idempotency headers, comprehensive validation
 *
 * Endpoints:
 * - POST /checkout/:cartId - Process checkout with idempotency
 * - GET /checkout/:cartId/status - Get checkout eligibility status
 * - POST /checkout/:cartId/reserve - Reserve inventory for checkout
 */
@ApiTags('checkout')
@Controller('checkout')
@UseGuards(AuthGuard, ScopesGuard)
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Process checkout for a specific cart with idempotency guarantees.
   *
   * @param cartId - Cart identifier to convert to order
   * @param checkoutData - Order creation data
   * @param request - HTTP request with user context
   * @param tenantId - Tenant context from middleware
   * @returns Promise<OrderResponseDto> Created order
   */
  @Post(':cartId')
  @Scopes('customer')
  @UsePipes(new AddressValidationPipe())
  @ApiOperation({
    summary: 'Process checkout',
    description: 'Convert cart to order with idempotency guarantees',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Cart identifier to checkout',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Optional idempotency key for retry safety',
    required: false,
    example: 'checkout-12345-unique-key',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Checkout processed successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid checkout data or cart not eligible',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cart already converted or checkout conflict',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cart not found or access denied',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async processCheckout(
    @Param('cartId') cartId: string,
    @Body() checkoutData: CreateOrderCommand,
    @Request() request: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Processing checkout for cart: ${cartId}`, {
      customerId: request.user.sub,
      tenantId,
      idempotencyKey: request.headers['idempotency-key'],
    });

    // Extract idempotency key from headers
    const idempotencyKey = request.headers['idempotency-key'] as string;

    // Generate operation-specific idempotency key if provided
    const operationKey = idempotencyKey
      ? this.checkoutService['idempotencyService'].generateKey(
          request.user.sub,
          cartId,
          'order_create'
        )
      : undefined;

    // Set cart ID in checkout data
    checkoutData.cartId = cartId;
    checkoutData.customerId = request.user.sub;
    checkoutData.tenantId = tenantId;

    const order = await this.checkoutService.processCheckout(
      cartId,
      request.user.sub,
      tenantId,
      checkoutData,
      operationKey,
    );

    this.logger.log(`Successfully processed checkout for cart: ${cartId}`, {
      orderId: order.id,
      customerId: request.user.sub,
    });

    return order;
  }

  /**
   * Get checkout eligibility status for a cart.
   *
   * @param cartId - Cart identifier
   * @param request - HTTP request with user context
   * @param tenantId - Tenant context from middleware
   * @returns Promise<CheckoutStatusDto> Checkout status information
   */
  @Get(':cartId/status')
  @Scopes('customer')
  @ApiOperation({
    summary: 'Get checkout status',
    description: 'Check if cart is eligible for checkout',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Cart identifier to check',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Checkout status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        cartId: { type: 'string', example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7' },
        status: {
          type: 'string',
          enum: ['eligible', 'converted', 'expired', 'not_found', 'access_denied'],
          example: 'eligible'
        },
        eligible: { type: 'boolean', example: true },
        reasons: {
          type: 'array',
          items: { type: 'string' },
          example: ['Cart is empty', 'Cart has expired']
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getCheckoutStatus(
    @Param('cartId') cartId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<{
    cartId: string;
    status: 'eligible' | 'converted' | 'expired' | 'not_found' | 'access_denied';
    eligible: boolean;
    reasons?: string[];
  }> {
    const tenantId = request.user.tenantId;
    this.logger.debug(`Getting checkout status for cart: ${cartId}`, {
      customerId: request.user.sub,
      tenantId,
    });

    const status = await this.checkoutService.getCheckoutStatus(
      cartId,
      request.user.sub,
      tenantId,
    );

    this.logger.debug(`Checkout status retrieved for cart: ${cartId}`, {
      status: status.status,
      eligible: status.eligible,
    });

    return status;
  }

  /**
   * Reserve inventory for checkout (pre-checkout validation).
   *
   * @param cartId - Cart identifier
   * @param reservationData - Reservation parameters
   * @param request - HTTP request with user context
   * @param tenantId - Tenant context from middleware
   * @returns Promise<InventoryReservationDto> Reservation details
   */
  @Post(':cartId/reserve')
  @Scopes('customer')
  @ApiOperation({
    summary: 'Reserve inventory for checkout',
    description: 'Reserve inventory items before processing checkout',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Cart identifier to reserve inventory for',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Inventory reserved successfully',
    schema: {
      type: 'object',
      properties: {
        reservationId: { type: 'string', example: 'res_1640995200000_abc123def' },
        cartId: { type: 'string', example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7' },
        expiresAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:15:00Z' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cartItemId: { type: 'string', example: '01J2QZK1X7Y8Z9A2B3C4D5E6F8' },
              variantId: { type: 'string', example: 'variant_123' },
              quantity: { type: 'integer', example: 2 },
              reserved: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cart not eligible for inventory reservation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Inventory not available for reservation',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async reserveInventory(
    @Param('cartId') cartId: string,
    @Body() reservationData: ReservationRequestBody,
    @Request() request: AuthenticatedRequest,
  ): Promise<{
    reservationId: string;
    cartId: string;
    expiresAt: Date;
    items: Array<{
      cartItemId: string;
      variantId: string;
      quantity: number;
      reserved: boolean;
    }>;
  }> {
    const tenantId = request.user.tenantId;
    this.logger.log(`Reserving inventory for checkout: ${cartId}`, {
      customerId: request.user.sub,
      tenantId,
      reservationDuration: reservationData?.reservationDuration,
    });

    const reservation = await this.checkoutService.reserveInventoryForCheckout(
      cartId,
      request.user.sub,
      tenantId,
      reservationData?.reservationDuration,
    );

    this.logger.log(`Inventory reserved for checkout: ${cartId}`, {
      reservationId: reservation.reservationId,
      expiresAt: reservation.expiresAt,
      itemCount: reservation.items.length,
    });

    return reservation;
  }
}
