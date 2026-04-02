import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { InventoryListRequest } from '@spareparts/contracts';

/**
 * DTO for inventory list requests.
 *
 * @remarks
 * - Validates inventory list query parameters
 * - Supports filtering and pagination
 * - OpenAPI documentation generation
 */
export class ListInventoryDto implements InventoryListRequest {
  @ApiProperty({
    description: 'Tenant identifier',
    example: 'tenant_123456789',
  })
  @IsString()
  tenantId!: string;

  @ApiPropertyOptional({
    description: 'Catalog variant IDs to filter',
    example: ['variant_123', 'variant_456'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  catalogVariantIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by sellable status',
    example: true,
  })
  @IsOptional()
  isSellable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter low stock items only',
    example: false,
  })
  @IsOptional()
  lowStockOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'brake',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['catalogVariantId', 'onHand', 'available', 'updatedAt'],
    example: 'updatedAt',
  })
  @IsEnum(['catalogVariantId', 'onHand', 'available', 'updatedAt'])
  sortBy!: 'catalogVariantId' | 'onHand' | 'available' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  sortOrder!: 'asc' | 'desc';

  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  pagination!: {
    page: number;
    limit: number;
  };
}
