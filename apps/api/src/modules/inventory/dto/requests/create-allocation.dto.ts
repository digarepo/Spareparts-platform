import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateAllocationRequest } from '@spareparts/contracts';

/**
 * DTO for allocation creation requests.
 *
 * @remarks
 * - Validates incoming allocation data
 * - Enforces business rules for durable commitments
 * - Supports OpenAPI documentation generation
 */
export class CreateAllocationDto implements CreateAllocationRequest {
  @ApiProperty({
    description: 'Tenant identifier',
    example: 'tenant_123456789',
  })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({
    description: 'Catalog variant identifier',
    example: 'variant_123456789',
  })
  @IsString()
  @IsNotEmpty()
  catalogVariantId!: string;

  @ApiProperty({
    description: 'Quantity to allocate',
    example: 3,
    minimum: 1,
    maximum: 2147483647,
  })
  @IsNumber()
  @Min(1)
  @Max(2147483647)
  quantity!: number;

  @ApiProperty({
    description: 'Purpose of allocation',
    enum: ['order', 'fulfillment'],
    example: 'order',
  })
  @IsEnum(['order', 'fulfillment'])
  purpose!: 'order' | 'fulfillment';

  @ApiProperty({
    description: 'Reference identifier',
    example: 'order_123456789',
  })
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiProperty({
    description: 'Metadata for the allocation',
    type: 'object',
    example: {
      initiatedBy: 'user_123',
      notes: 'Order fulfillment allocation',
    },
    additionalProperties: false,
    properties: {
      initiatedBy: {
        type: 'string',
        description: 'User who initiated the allocation',
      },
      notes: {
        type: 'string',
        description: 'Additional notes',
        required: false,
      },
    },
  })
  metadata!: {
    initiatedBy: string;
    notes?: string;
  };
}
