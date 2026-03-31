import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsNotEmpty, 
  Min, 
  Max, 
  IsDateString, 
  IsObject,
  IsUUID,
  Length,
  Matches,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateReservationRequest } from '@spareparts/contracts';

/**
 * Reservation metadata DTO with strict validation.
 */
class ReservationMetadataDto {
  @ApiProperty({
    description: 'User who initiated the reservation',
    example: 'user_123',
  })
  @IsString({ message: 'Initiated by must be a string' })
  @Length(1, 100, { message: 'Initiated by must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Initiated by contains invalid characters' })
  initiatedBy!: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Cart reservation for checkout',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(1, 1000, { message: 'Notes must be between 1 and 1000 characters' })
  notes?: string;
}

/**
 * DTO for reservation creation requests with Zero-Trust validation.
 *
 * @remarks
 * - Strict validation prevents malicious data injection
 * - No unknown properties allowed
 * - All fields are validated for type and format
 * - Business rules enforced at validation layer
 */
export class CreateReservationDto implements CreateReservationRequest {
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
    description: 'Quantity to reserve',
    example: 5,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(1000, { message: 'Quantity cannot exceed 1000' })
  quantity!: number;

  @ApiProperty({
    description: 'Purpose of reservation',
    enum: ['cart', 'order', 'manual', 'system'],
    example: 'cart',
  })
  @IsEnum(['cart', 'order', 'manual', 'system'], { message: 'Invalid reservation purpose' })
  purpose!: 'cart' | 'order' | 'manual' | 'system';

  @ApiPropertyOptional({
    description: 'Expiration timestamp (must be in the future)',
    example: '2024-04-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid ISO date string' })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'External reference identifier',
    example: '01J2QZK1X7Y8Z9A2B3C4D5E6F7',
  })
  @IsOptional()
  @IsString({ message: 'Reference ID must be a string' })
  @IsUUID('4', { message: 'Reference ID must be a valid UUID v4' })
  referenceId?: string;

  @ApiProperty({
    description: 'Metadata for the reservation',
    type: ReservationMetadataDto,
  })
  @IsObject({ message: 'Metadata must be an object' })
  @ValidateNested({ message: 'Metadata validation failed' })
  @Type(() => ReservationMetadataDto)
  metadata!: ReservationMetadataDto;
}
