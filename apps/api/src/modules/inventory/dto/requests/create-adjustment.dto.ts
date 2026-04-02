import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsUppercase,
  IsObject,
  IsUUID,
  Length,
  Matches,
  IsDateString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StockAdjustmentRequest } from '@spareparts/contracts';

/**
 * Adjustment details DTO with strict validation.
 */
class AdjustmentDetailsDto {
  @ApiProperty({
    description: 'Type of adjustment',
    enum: ['increase', 'decrease', 'adjustment'],
    example: 'increase',
  })
  @IsEnum(['increase', 'decrease', 'adjustment'], { message: 'Invalid adjustment type' })
  adjustmentType!: 'increase' | 'decrease' | 'adjustment';

  @ApiProperty({
    description: 'Quantity to adjust (must be positive)',
    example: 10,
    minimum: 1,
    maximum: 10000,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(10000, { message: 'Quantity cannot exceed 10000' })
  quantity!: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Stock count adjustment',
    minLength: 3,
    maxLength: 500,
  })
  @IsString({ message: 'Reason must be a string' })
  @Length(3, 500, { message: 'Reason must be between 3 and 500 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_.]+$/, { message: 'Reason contains invalid characters' })
  reason!: string;

  @ApiPropertyOptional({
    description: 'External reference identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsOptional()
  @IsString({ message: 'Reference ID must be a string' })
  @IsUUID('4', { message: 'Reference ID must be a valid UUID v4' })
  referenceId?: string;
}

/**
 * Metadata DTO with strict validation.
 */
class AdjustmentMetadataDto {
  @ApiProperty({
    description: 'User who initiated the adjustment',
    example: 'user_123',
  })
  @IsString({ message: 'Initiated by must be a string' })
  @Length(1, 100, { message: 'Initiated by must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Initiated by contains invalid characters' })
  initiatedBy!: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Physical stock count completed',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(1, 1000, { message: 'Notes must be between 1 and 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Timestamp for the adjustment',
    example: '2024-03-31T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Timestamp must be a valid ISO date string' })
  timestamp?: Date;
}

/**
 * DTO for stock adjustment requests with Zero-Trust validation.
 *
 * @remarks
 * - Strict validation prevents malicious data injection
 * - No unknown properties allowed
 * - All fields are validated for type and format
 * - Business rules enforced at validation layer
 */
export class CreateAdjustmentDto implements StockAdjustmentRequest {
  @ApiProperty({
    description: 'Tenant identifier (will be overridden by authenticated context)',
    example: 'tenant_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Tenant ID must be a string' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  @Length(3, 100, { message: 'Tenant ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Tenant ID contains invalid characters' })
  tenantId!: string;

  @ApiProperty({
    description: 'Catalog variant identifier',
    example: 'variant_123456789',
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Catalog variant ID must be a string' })
  @IsNotEmpty({ message: 'Catalog variant ID is required' })
  @Length(3, 100, { message: 'Catalog variant ID must be between 3 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Catalog variant ID contains invalid characters' })
  catalogVariantId!: string;

  @ApiProperty({
    description: 'Adjustment details',
    type: AdjustmentDetailsDto,
  })
  @IsObject({ message: 'Adjustment details must be an object' })
  @ValidateNested({ message: 'Adjustment details validation failed' })
  @Type(() => AdjustmentDetailsDto)
  adjustment!: AdjustmentDetailsDto;

  @ApiProperty({
    description: 'Metadata for the adjustment',
    type: AdjustmentMetadataDto,
  })
  @IsObject({ message: 'Metadata must be an object' })
  @ValidateNested({ message: 'Metadata validation failed' })
  @Type(() => AdjustmentMetadataDto)
  metadata!: AdjustmentMetadataDto;
}
