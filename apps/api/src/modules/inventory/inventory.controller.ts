import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockAdjustmentService } from './services/commands/stock-adjustment.service';
import { ReservationService } from './services/commands/reservation.service';
import type { CreateReservationDto } from './dto/requests/create-reservation.dto';
import type { CreateAdjustmentDto } from './dto/requests/create-adjustment.dto';
import type { CreateReservationResponse } from '@spareparts/contracts';
import type { StockAdjustmentResponse } from '@spareparts/contracts';
import type { RequestContext } from '@spareparts/contracts';
import { getRequestContext } from '../../infrastructure/request-context';
import { AuthGuard } from '../../auth/guards/auth.guard';

/**
 * Inventory controller with Zero-Trust security and atomic integrity.
 *
 * @remarks
 * - Enforces strict tenant isolation with no fallbacks
 * - Explicit data mapping (no spread operators)
 * - Relies on global exception filters
 * - Clean imports - no unused dependencies
 */
@ApiTags('inventory')
@Controller('inventory')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(
    private readonly stockAdjustmentService: StockAdjustmentService,
    private readonly reservationService: ReservationService,
  ) {}

  /**
   * Adjusts inventory quantities with atomic operations.
   *
   * @param request - Stock adjustment request
   * @returns Stock adjustment response
   * @throws UnauthorizedException - If tenant context is missing
   * @throws ConflictException - If business rules are violated
   */
  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust inventory quantities',
    description: 'Atomically adjusts inventory with proper domain validation and audit trail'
  })
  async adjustStock(@Body() request: CreateAdjustmentDto): Promise<StockAdjustmentResponse> {
    // Extract tenant context from authenticated token (ZERO TRUST - no fallbacks)
    const context: RequestContext = getRequestContext();
    
    if (!context.tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }

    // Explicit mapping - NO SPREAD OPERATORS for security
    const secureRequest = {
      tenantId: context.tenantId, // FORCED from authenticated context
      catalogVariantId: request.catalogVariantId,
      adjustment: {
        adjustmentType: request.adjustment.adjustmentType,
        quantity: request.adjustment.quantity,
        reason: request.adjustment.reason,
        referenceId: request.adjustment.referenceId,
      },
      metadata: request.metadata,
    };

    this.logger.log(
      `Stock adjustment requested: tenant=${context.tenantId}, variant=${secureRequest.catalogVariantId}, ` +
      `type=${secureRequest.adjustment.adjustmentType}, quantity=${secureRequest.adjustment.quantity}`
    );

    // Process adjustment through service layer - NO TRY/CATCH (global exception filter handles it)
    const result = await this.stockAdjustmentService.adjustStock(secureRequest, context);

    this.logger.log(
      `Stock adjustment completed: tenant=${context.tenantId}, variant=${secureRequest.catalogVariantId}, ` +
      `movementId=${result.movementId}`
    );

    return result;
  }

  /**
   * Creates inventory reservation with atomic availability check.
   *
   * @param request - Reservation creation request
   * @returns Reservation creation response
   * @throws UnauthorizedException - If tenant context is missing
   * @throws ConflictException - If insufficient stock available
   */
  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create inventory reservation',
    description: 'Atomically reserves inventory with availability validation and expiration handling'
  })
  async createReservation(@Body() request: CreateReservationDto): Promise<CreateReservationResponse> {
    // Extract tenant context from authenticated token (ZERO TRUST - no fallbacks)
    const context: RequestContext = getRequestContext();
    
    if (!context.tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }

    // Explicit mapping - NO SPREAD OPERATORS for security
    const secureRequest = {
      tenantId: context.tenantId, // FORCED from authenticated context
      catalogVariantId: request.catalogVariantId,
      quantity: request.quantity,
      purpose: request.purpose,
      expiresAt: request.expiresAt,
      referenceId: request.referenceId,
      metadata: request.metadata,
    };

    this.logger.log(
      `Reservation requested: tenant=${context.tenantId}, variant=${secureRequest.catalogVariantId}, ` +
      `quantity=${secureRequest.quantity}, purpose=${secureRequest.purpose}`
    );

    // Process reservation through service layer - NO TRY/CATCH (global exception filter handles it)
    const result = await this.reservationService.createReservation(secureRequest, context);

    this.logger.log(
      `Reservation completed: tenant=${context.tenantId}, variant=${secureRequest.catalogVariantId}, ` +
      `reservationId=${result.reservation.id}`
    );

    return result;
  }

  /**
   * Releases an existing reservation with atomic operations.
   *
   * @param request - Reservation release request
   * @returns Reservation release response
   * @throws UnauthorizedException - If tenant context is missing
   * @throws ConflictException - If reservation not found
   */
  @Post('release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Release inventory reservation',
    description: 'Atomically releases reservation and updates available quantities'
  })
  async releaseReservation(@Body() request: {
    reservationId: string;
    catalogVariantId: string;
    reason?: string;
  }) {
    // Extract tenant context from authenticated token (ZERO TRUST - no fallbacks)
    const context: RequestContext = getRequestContext();
    
    if (!context.tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }

    // Explicit mapping - NO SPREAD OPERATORS for security
    const secureRequest = {
      reservationId: request.reservationId,
      tenantId: context.tenantId, // FORCED from authenticated context
      catalogVariantId: request.catalogVariantId,
      reason: request.reason || 'Manual release',
    };

    this.logger.log(
      `Reservation release requested: tenant=${context.tenantId}, reservationId=${secureRequest.reservationId}`
    );

    // Process release through service layer - NO TRY/CATCH (global exception filter handles it)
    const result = await this.reservationService.releaseReservation(secureRequest, context);

    this.logger.log(
      `Reservation release completed: tenant=${context.tenantId}, reservationId=${secureRequest.reservationId}`
    );

    return result;
  }
}
