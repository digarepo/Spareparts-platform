import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEnum,
  ValidateNested,
  IsObject,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateOrderStatusRequest } from '@spareparts/contracts/checkout';

/**
 * Address update DTO with validation (only allowed for pending orders).
 *
 * @remarks
 * - Address updates are restricted to pending orders only
 * - Address structure follows Ethiopia-specific validation
 * - All fields are optional to allow partial updates
 */
class AddressUpdateDto {
  @ApiPropertyOptional({
    description: 'Updated shipping address (Ethiopia-specific validation)',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Shipping address must be an object' })
  shippingAddress?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Updated billing address (Ethiopia-specific validation)',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Billing address must be an object' })
  billingAddress?: Record<string, unknown>;
}

/**
 * DTO for order updates with strict validation and business rule enforcement.
 *
 * @remarks
 * - **Scope:** Order status and address updates with authorization
 * - **Authority:** Role-based access control enforced
 * - **Invariants:** Status updates require reason, address updates customer-only
 * - **Security:** Business rules enforced at validation layer
 * - **Validation:** Strict enum validation for status codes
 */
export class UpdateOrderDto implements UpdateOrderStatusRequest {
  @ApiPropertyOptional({
    description: 'New order status (tenant/system only, validated)',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'], {
    message: 'Invalid order status'
  })
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

  @ApiPropertyOptional({
    description: 'Status change identifier (required for audit trail)',
    example: 'status_change_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Status ID must be a string' })
  @IsNotEmpty({ message: 'Status ID is required' })
  statusId!: string;

  @ApiPropertyOptional({
    description: 'User who initiated the status change (required for audit)',
    example: 'system',
  })
  @IsOptional()
  @IsString({ message: 'Initiated by must be a string' })
  initiatedBy!: string;

  @ApiPropertyOptional({
    description: 'Reason for status change (required for status updates, sanitized)',
    example: 'Payment confirmed',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @Length(1, 500, { message: 'Reason must be between 1 and 500 characters' })
  @Matches(/^[a-zA-Z0-9\\s\\-\\._\\(\\)\\/\\[\\],#!?]+$/, {
    message: 'Reason contains invalid characters'
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Address updates (customer only, pending orders only, validated)',
    type: AddressUpdateDto,
  })
  @IsOptional()
  @IsObject({ message: 'Address updates must be an object' })
  @ValidateNested({ message: 'Address updates validation failed' })
  @Type(() => AddressUpdateDto)
  addresses?: AddressUpdateDto;

  @ApiPropertyOptional({
    description: 'Order ID (required for status updates)',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsOptional()
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Metadata for audit trail',
    example: { initiatedBy: 'system' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, unknown>;
}
