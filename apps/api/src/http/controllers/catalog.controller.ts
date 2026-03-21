import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse,
  ProductListResponse,
  CatalogListQuery,
  ProductStatus,
  VariantCreateRequest,
  VariantUpdateRequest,
  TaxonomyCreateRequest,
  TaxonomyUpdateRequest,
  TaxonomyResponse,
  TaxonomyListResponse,
  ClassificationAssignRequest,
  ClassificationUnassignRequest,
  ClassificationAssignmentResponse,
  ClassificationListResponse,
  ClassificationBulkAssignRequest,
  ClassificationBulkAssignResponse,
} from '@spareparts/contracts';
import { CatalogService } from '../../catalog/catalog.service';
import { TenantContext } from '@spareparts/contracts';
import type { RequestContext } from '@spareparts/contracts';

/**
 * Catalog endpoints for product and variant management.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** contracts + database via CatalogService
 * - **Invariants:** all operations require tenant context and are RLS-enforced
 */
@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);

  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Creates a new product within the current tenant.
   *
   * @param request - Validated product creation payload
   * @param ctx - Tenant context for isolation
   * @returns The created product representation
   *
   * @throws ConflictException - When product slug already exists in tenant
   * @throws BadRequestException - When request validation fails
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Product is created with 'draft' status by default
   * - Slug uniqueness is enforced per tenant
   * - Audit trail is created automatically
   */
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product within the current tenant context. Products start in draft status.'
  })
  @ApiBody({ type: 'ProductCreateRequest' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: 'ProductResponse'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload'
  })
  @ApiResponse({
    status: 409,
    description: 'Product slug already exists in tenant'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  public async createProduct(
    @Body() request: ProductCreateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Creating product: ${request.slug} for tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.createProduct(request, ctx);

      this.logger.log(
        `Product created successfully: ${product.id} for tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${request.slug} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create product due to internal error',
      );
    }
  }

  /**
   * Updates an existing product within the current tenant.
   *
   * @param productId - ULID of the product to update
   * @param request - Validated product update payload
   * @param ctx - Tenant context for isolation
   * @returns The updated product representation
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws ConflictException - When new slug conflicts with existing product
   * @throws BadRequestException - When request validation or status transition fails
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Only provided fields are updated (partial update)
   * - Status transitions are validated against business rules
   * - Slug changes affect SEO URLs and must remain unique
   * - All changes are recorded in audit trail
   */
  @Patch('products/:productId')
  @ApiOperation({
    summary: 'Update an existing product',
    description: 'Partially updates a product. Only provided fields are updated. Status transitions are validated.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiBody({ type: 'ProductUpdateRequest' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
    type: 'ProductResponse'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload or status transition'
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not accessible'
  })
  @ApiResponse({
    status: 409,
    description: 'Product slug already exists in tenant'
  })
  public async updateProduct(
    @Param('productId') productId: string,
    @Body() request: ProductUpdateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Updating product: ${productId} for tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.updateProduct(
        productId,
        request,
        ctx,
      );

      this.logger.log(
        `Product updated successfully: ${productId} for tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to update product: ${productId} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update product due to internal error',
      );
    }
  }

  /**
   * Lists products scoped to the current tenant with filtering and pagination.
   *
   * @param query - Validated catalog listing query parameters
   * @param ctx - Tenant context for isolation
   * @returns Paginated list of products matching criteria
   *
   * @throws BadRequestException - When query parameters are invalid
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Defaults to published products, page 0, 20 items
   * - Supports filtering by status, taxonomy, and search terms
   * - Results are tenant-scoped and RLS-enforced
   * - Pagination uses zero-based page indexing
   */
  @Get('products')
  @ApiOperation({
    summary: 'List products with filtering and pagination',
    description: 'Returns paginated list of products. Defaults to published products. Supports status, taxonomy, and search filters.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (zero-based)',
    example: 0
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (1-100)',
    example: 20
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Product status filter',
    example: 'published'
  })
  @ApiQuery({
    name: 'taxonomyId',
    required: false,
    description: 'Filter by taxonomy category',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Free-text search term',
    example: 'spare part'
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: 'ProductListResponse'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters'
  })
  public async listProducts(
    @Query() query: CatalogListQuery,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductListResponse> {
    this.logger.log(
      `Listing products for tenant: ${ctx.tenantId} with filters: ${JSON.stringify(query)}`,
    );

    try {
      const result = await this.catalogService.listProducts(query, ctx);

      this.logger.log(
        `Listed ${result.products.length} products for tenant: ${ctx.tenantId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to list products for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to list products due to internal error',
      );
    }
  }

  /**
   * Publishes a product, making it visible publicly.
   *
   * @param productId - ULID of the product to publish
   * @param ctx - Tenant context for isolation
   * @returns The updated product with published status
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws BadRequestException - When product cannot be published (missing required data)
   * @throws ConflictException - When product is already published
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Explicit publish action (not automatic via PATCH)
   * - Validates product has required data for publication
   * - Sets publishedAt timestamp
   * - Records publication event in audit trail
   */
  @Post('products/:productId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a product',
    description: 'Explicitly publishes a product making it publicly visible. Validates required data and sets published timestamp.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully published',
    type: 'ProductResponse'
  })
  @ApiResponse({
    status: 400,
    description: 'Product cannot be published (missing required data)'
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not accessible'
  })
  @ApiResponse({
    status: 409,
    description: 'Product is already published'
  })
  public async publishProduct(
    @Param('productId') productId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Publishing product: ${productId} for tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.publishProduct(productId, ctx);

      this.logger.log(
        `Product published successfully: ${productId} for tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to publish product: ${productId} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to publish product due to internal error',
      );
    }
  }

  /**
   * Retrieves a single product by ID within the current tenant.
   *
   * @param productId - ULID of the product to retrieve
   * @param ctx - Tenant context for isolation
   * @returns The product representation
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Returns product regardless of status (tenant-scoped access)
   * - Includes variants and current inventory levels
   */
  @Get('products/:productId')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Retrieves a single product with variants and inventory. Access is limited to tenant scope.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: 'ProductResponse'
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not accessible'
  })
  public async getProduct(
    @Param('productId') productId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Retrieving product: ${productId} for tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.getProduct(productId, ctx);

      this.logger.log(
        `Product retrieved successfully: ${productId} for tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve product: ${productId} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve product due to internal error',
      );
    }
  }

  /**
   * Creates a new variant under a product.
   *
   * @param request - Validated variant creation payload
   * @param ctx - Tenant context for isolation
   * @returns The created variant representation
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws ConflictException - When SKU already exists in tenant
   * @throws BadRequestException - When request validation fails
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - SKU must be unique per tenant
   * - Variant is associated with existing product
   * - Audit trail is created automatically
   */
  @Post('variants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new variant',
    description: 'Creates a new variant under a specified product. SKU must be unique per tenant.'
  })
  @ApiBody({ type: 'VariantCreateRequest' })
  @ApiResponse({
    status: 201,
    description: 'Variant successfully created',
    type: 'ProductResponse' // Returns updated product with variants
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload'
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not accessible'
  })
  @ApiResponse({
    status: 409,
    description: 'SKU already exists in tenant'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  public async createVariant(
    @Body() request: VariantCreateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Creating variant: ${request.sku} for product: ${request.productId} in tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.createVariant(request, ctx);

      this.logger.log(
        `Variant created successfully: ${request.sku} for product: ${request.productId} in tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create variant: ${request.sku} for product: ${request.productId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create variant due to internal error',
      );
    }
  }

  /**
   * Updates an existing variant within the current tenant.
   *
   * @param variantId - ULID of the variant to update
   * @param request - Validated variant update payload
   * @param ctx - Tenant context for isolation
   * @returns The updated variant representation
   *
   * @throws NotFoundException - When variant not found or not in tenant
   * @throws ConflictException - When new SKU conflicts with existing variant
   * @throws BadRequestException - When request validation fails
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Only provided fields are updated (partial update)
   * - SKU changes must remain unique per tenant
   * - Product association cannot be changed
   */
  @Patch('variants/:variantId')
  @ApiOperation({
    summary: 'Update an existing variant',
    description: 'Partially updates a variant. Only provided fields are updated. SKU changes must remain unique per tenant.'
  })
  @ApiParam({
    name: 'variantId',
    description: 'Variant ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiBody({ type: 'VariantUpdateRequest' })
  @ApiResponse({
    status: 200,
    description: 'Variant successfully updated',
    type: 'ProductResponse' // Returns updated product with variants
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload'
  })
  @ApiResponse({
    status: 404,
    description: 'Variant not found or not accessible'
  })
  @ApiResponse({
    status: 409,
    description: 'SKU already exists in tenant'
  })
  public async updateVariant(
    @Param('variantId') variantId: string,
    @Body() request: VariantUpdateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Updating variant: ${variantId} in tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.updateVariant(
        variantId,
        request,
        ctx,
      );

      this.logger.log(
        `Variant updated successfully: ${variantId} in tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to update variant: ${variantId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update variant due to internal error',
      );
    }
  }

  /**
   * Retrieves a single variant by ID within the current tenant.
   *
   * @param variantId - ULID of the variant to retrieve
   * @param ctx - Tenant context for isolation
   * @returns The variant representation
   *
   * @throws NotFoundException - When variant not found or not in tenant
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Returns variant with associated product information
   * - Includes pricing and inventory information if available
   */
  @Get('variants/:variantId')
  @ApiOperation({
    summary: 'Get a variant by ID',
    description: 'Retrieves a single variant with product information. Access is limited to tenant scope.'
  })
  @ApiParam({
    name: 'variantId',
    description: 'Variant ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiResponse({
    status: 200,
    description: 'Variant retrieved successfully',
    type: 'ProductResponse' // Returns product with the specific variant
  })
  @ApiResponse({
    status: 404,
    description: 'Variant not found or not accessible'
  })
  public async getVariant(
    @Param('variantId') variantId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Retrieving variant: ${variantId} for tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.getVariant(variantId, ctx);

      this.logger.log(
        `Variant retrieved successfully: ${variantId} for tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve variant: ${variantId} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve variant due to internal error',
      );
    }
  }

  /**
   * Lists variants for a specific product within the current tenant.
   *
   * @param productId - ULID of the product to list variants for
   * @param ctx - Tenant context for isolation
   * @returns List of variants for the specified product
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws InternalServerErrorException - When database operation fails
   *
   * @remarks
   * - Returns all variants for the specified product
   * - Includes pricing and inventory information if available
   * - Results are tenant-scoped and RLS-enforced
   */
  @Get('products/:productId/variants')
  @ApiOperation({
    summary: 'List variants for a product',
    description: 'Returns all variants for a specified product. Access is limited to tenant scope.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ULID identifier',
    example: '01HXYKJ2R5E4X2Y3Z4A5B6C7D'
  })
  @ApiResponse({
    status: 200,
    description: 'Variants retrieved successfully',
    type: 'ProductResponse' // Returns product with all variants
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not accessible'
  })
  public async listVariants(
    @Param('productId') productId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.log(
      `Listing variants for product: ${productId} in tenant: ${ctx.tenantId}`,
    );

    try {
      const product = await this.catalogService.listVariants(productId, ctx);

      this.logger.log(
        `Listed variants for product: ${productId} in tenant: ${ctx.tenantId}`,
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to list variants for product: ${productId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to list variants due to internal error',
      );
    }
  }

  /**
   * Creates a new taxonomy node within the tenant.
   *
   * @param request - Validated taxonomy creation payload
   * @param ctx - Tenant context for isolation
   * @returns The created taxonomy node
   *
   * @throws ConflictException - When label conflicts with sibling in parent
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Supports hierarchical structure via optional parentId
   * - Labels must be unique within parent scope
   * - Metadata is extensible for navigation facets
   */
  @Post('taxonomies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create taxonomy node' })
  @ApiBody({ type: 'TaxonomyCreateRequest' })
  @ApiResponse({ status: 201, description: 'Taxonomy node created successfully', type: 'TaxonomyResponse' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Label already exists in parent scope' })
  public async createTaxonomy(
    @Body() request: TaxonomyCreateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.log(
      `Creating taxonomy: ${request.label} in tenant: ${ctx.tenantId}`,
    );
    try {
      const taxonomy = await this.catalogService.createTaxonomy(request, ctx);
      this.logger.log(
        `Taxonomy created successfully: ${taxonomy.id} in tenant: ${ctx.tenantId}`,
      );
      return taxonomy;
    } catch (error) {
      this.logger.error(
        `Failed to create taxonomy: ${request.label} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create taxonomy due to internal error',
      );
    }
  }

  /**
   * Updates an existing taxonomy node within the current tenant.
   *
   * @param taxonomyId - ULID of the taxonomy node to update
   * @param request - Validated taxonomy update payload
   * @param ctx - Tenant context for isolation
   * @returns The updated taxonomy node
   *
   * @throws NotFoundException - When taxonomy not found or not in tenant
   * @throws ConflictException - When new label conflicts with sibling
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Only provided fields are updated (partial update)
   * - Parent changes validated to prevent cycles
   * - Label changes validated for uniqueness within new parent scope
   */
  @Patch('taxonomies/:taxonomyId')
  @ApiOperation({ summary: 'Update taxonomy node' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy node ID' })
  @ApiBody({ type: 'TaxonomyUpdateRequest' })
  @ApiResponse({ status: 200, description: 'Taxonomy node updated successfully', type: 'TaxonomyResponse' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Taxonomy node not found' })
  @ApiResponse({ status: 409, description: 'Label already exists in parent scope' })
  public async updateTaxonomy(
    @Param('taxonomyId') taxonomyId: string,
    @Body() request: TaxonomyUpdateRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.log(
      `Updating taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );
    try {
      const taxonomy = await this.catalogService.updateTaxonomy(
        taxonomyId,
        request,
        ctx,
      );
      this.logger.log(
        `Taxonomy updated successfully: ${taxonomyId} in tenant: ${ctx.tenantId}`,
      );
      return taxonomy;
    } catch (error) {
      this.logger.error(
        `Failed to update taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update taxonomy due to internal error',
      );
    }
  }

  /**
   * Retrieves a single taxonomy node by ID within the current tenant.
   *
   * @param taxonomyId - ULID of the taxonomy node to retrieve
   * @param ctx - Tenant context for isolation
   * @returns The taxonomy node
   *
   * @throws NotFoundException - When taxonomy not found or not in tenant
   *
   * @remarks
   * - Returns node with complete hierarchy information
   * - Includes metadata for navigation and faceting
   */
  @Get('taxonomies/:taxonomyId')
  @ApiOperation({ summary: 'Get taxonomy node by ID' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy node ID' })
  @ApiResponse({ status: 200, description: 'Taxonomy node retrieved successfully', type: 'TaxonomyResponse' })
  @ApiResponse({ status: 404, description: 'Taxonomy node not found' })
  public async getTaxonomy(
    @Param('taxonomyId') taxonomyId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.log(
      `Retrieving taxonomy: ${taxonomyId} for tenant: ${ctx.tenantId}`,
    );
    try {
      const taxonomy = await this.catalogService.getTaxonomy(taxonomyId, ctx);
      this.logger.log(
        `Taxonomy retrieved successfully: ${taxonomyId} for tenant: ${ctx.tenantId}`,
      );
      return taxonomy;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve taxonomy: ${taxonomyId} for tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve taxonomy due to internal error',
      );
    }
  }

  /**
   * Lists all taxonomy nodes within the current tenant.
   *
   * @param ctx - Tenant context for isolation
   * @returns List of taxonomy nodes for the tenant
   *
   * @remarks
   * - Returns flat list of all nodes for tenant
   * - Client-side responsible for tree construction
   * - Results are tenant-scoped and RLS-enforced
   */
  @Get('taxonomies')
  @ApiOperation({ summary: 'List all taxonomy nodes' })
  @ApiResponse({ status: 200, description: 'Taxonomy nodes retrieved successfully', type: 'TaxonomyListResponse' })
  public async listTaxonomies(
    @TenantContext() ctx: RequestContext,
  ): Promise<TaxonomyListResponse> {
    this.logger.log(
      `Listing taxonomies for tenant: ${ctx.tenantId}`,
    );
    try {
      const taxonomies = await this.catalogService.listTaxonomies(ctx);
      this.logger.log(
        `Listed ${taxonomies.total} taxonomies for tenant: ${ctx.tenantId}`,
      );
      return taxonomies;
    } catch (error) {
      this.logger.error(
        `Failed to list taxonomies for tenant: ${ctx.tenantId}`,
        error,
      );

      throw new InternalServerErrorException(
        'Failed to list taxonomies due to internal error',
      );
    }
  }

  /**
   * Assigns a product to a taxonomy node for classification.
   *
   * @param request - Validated classification assignment payload
   * @param ctx - Tenant context for isolation
   * @returns The created assignment relationship
   *
   * @throws NotFoundException - When product or taxonomy not found
   * @throws ConflictException - When assignment already exists
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Supports multi-category classification
   * - Assignment is explicit and auditable
   * - Historical audit trail preserved
   */
  @Post('products/:productId/classifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign product to taxonomy node' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiBody({ type: 'ClassificationAssignRequest' })
  @ApiResponse({ status: 201, description: 'Classification assignment created successfully', type: 'ClassificationAssignmentResponse' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Product or taxonomy not found' })
  @ApiResponse({ status: 409, description: 'Assignment already exists' })
  public async assignProductToTaxonomy(
    @Param('productId') productId: string,
    @Body() request: ClassificationAssignRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ClassificationAssignmentResponse> {
    this.logger.log(
      `Assigning product ${productId} to taxonomy ${request.taxonomyId} in tenant: ${ctx.tenantId}`,
    );
    try {
      const assignment = await this.catalogService.assignProductToTaxonomy(productId, request, ctx);
      this.logger.log(
        `Classification assignment created: ${assignment.id} in tenant: ${ctx.tenantId}`,
      );
      return assignment;
    } catch (error) {
      this.logger.error(
        `Failed to assign product ${productId} to taxonomy ${request.taxonomyId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create classification assignment due to internal error',
      );
    }
  }

  /**
   * Unassigns a product from a taxonomy node.
   *
   * @param productId - Product ID to unassign
   * @param taxonomyId - Taxonomy node ID to unassign from
   * @param ctx - Tenant context for isolation
   * @returns Confirmation of successful unassignment
   *
   * @throws NotFoundException - When assignment not found
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Historical audit trail preserved
   * - Cannot undo assignments affecting historical orders
   */
  @Delete('products/:productId/classifications/:taxonomyId')
  @ApiOperation({ summary: 'Unassign product from taxonomy node' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy node ID' })
  @ApiResponse({ status: 200, description: 'Classification assignment removed successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  public async unassignProductFromTaxonomy(
    @Param('productId') productId: string,
    @Param('taxonomyId') taxonomyId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Unassigning product ${productId} from taxonomy ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );
    try {
      await this.catalogService.unassignProductFromTaxonomy(productId, taxonomyId, ctx);
      this.logger.log(
        `Classification assignment removed: product ${productId} from taxonomy ${taxonomyId} in tenant: ${ctx.tenantId}`,
      );
      return { message: 'Classification assignment removed successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to unassign product ${productId} from taxonomy ${taxonomyId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to remove classification assignment due to internal error',
      );
    }
  }

  /**
   * Lists all taxonomy assignments for a product.
   *
   * @param productId - Product ID to list classifications for
   * @param ctx - Tenant context for isolation
   * @returns List of classification assignments with taxonomy details
   *
   * @throws NotFoundException - When product not found
   *
   * @remarks
   * - Returns all taxonomy assignments for navigation
   * - Includes taxonomy node details for client-side tree construction
   */
  @Get('products/:productId/classifications')
  @ApiOperation({ summary: 'List product classifications' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product classifications retrieved successfully', type: 'ClassificationListResponse' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  public async listProductClassifications(
    @Param('productId') productId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<ClassificationListResponse> {
    this.logger.log(
      `Listing classifications for product ${productId} in tenant: ${ctx.tenantId}`,
    );
    try {
      const classifications = await this.catalogService.listProductClassifications(productId, ctx);
      this.logger.log(
        `Listed ${classifications.total} classifications for product ${productId} in tenant: ${ctx.tenantId}`,
      );
      return classifications;
    } catch (error) {
      this.logger.error(
        `Failed to list classifications for product ${productId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to list product classifications due to internal error',
      );
    }
  }

  /**
   * Bulk assigns multiple products to taxonomy nodes.
   *
   * @param request - Validated bulk classification assignment payload
   * @param ctx - Tenant context for isolation
   * @returns Results of bulk assignment operation
   *
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - All operations in single request are atomic
   * - Enables partial success handling
   * - Used for bulk import or reclassification operations
   */
  @Post('classifications/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk assign products to taxonomy nodes' })
  @ApiBody({ type: 'ClassificationBulkAssignRequest' })
  @ApiResponse({ status: 201, description: 'Bulk classification assignments processed', type: 'ClassificationBulkAssignResponse' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  public async bulkAssignProductsToTaxonomy(
    @Body() request: ClassificationBulkAssignRequest,
    @TenantContext() ctx: RequestContext,
  ): Promise<ClassificationBulkAssignResponse> {
    this.logger.log(
      `Bulk assigning ${request.assignments.length} classifications in tenant: ${ctx.tenantId}`,
    );
    try {
      const results = await this.catalogService.bulkAssignProductsToTaxonomy(request, ctx);
      this.logger.log(
        `Bulk assignment completed: ${results.totalSucceeded}/${results.totalProcessed} successful in tenant: ${ctx.tenantId}`,
      );
      return results;
    } catch (error) {
      this.logger.error(
        `Failed to bulk assign classifications in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to process bulk classification assignments due to internal error',
      );
    }
  }

  /**
   * Soft deletes a taxonomy node (marks as deleted but preserves data).
   *
   * @param taxonomyId - Taxonomy node ID to soft delete
   * @param ctx - Tenant context for isolation
   * @returns The soft-deleted taxonomy node
   *
   * @throws NotFoundException - When taxonomy not found
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Preserves historical audit trail
   * - Prevents new assignments to deleted taxonomy
   * - Existing assignments remain for historical orders
   * - Requires tenant operator permissions
   */
  @Delete('taxonomies/:taxonomyId/soft')
  @ApiOperation({ summary: 'Soft delete taxonomy node' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy node ID' })
  @ApiResponse({ status: 200, description: 'Taxonomy node soft deleted successfully', type: 'TaxonomyResponse' })
  @ApiResponse({ status: 404, description: 'Taxonomy node not found' })
  public async softDeleteTaxonomy(
    @Param('taxonomyId') taxonomyId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.log(
      `Soft deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );
    try {
      const taxonomy = await this.catalogService.softDeleteTaxonomy(taxonomyId, ctx);
      this.logger.log(
        `Taxonomy soft deleted successfully: ${taxonomyId} in tenant: ${ctx.tenantId}`,
      );
      return taxonomy;
    } catch (error) {
      this.logger.error(
        `Failed to soft delete taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to soft delete taxonomy due to internal error',
      );
    }
  }

  /**
   * Hard deletes a taxonomy node (permanently removes data).
   *
   * @param taxonomyId - Taxonomy node ID to hard delete
   * @param ctx - Tenant context for isolation
   * @returns Confirmation of hard deletion
   *
   * @throws NotFoundException - When taxonomy not found
   * @throws ForbiddenException - When actor lacks platform permissions
   *
   * @remarks
   * - Requires elevated permissions (platform operators only)
   * - Removes all associated data including assignments
   * - Cannot be undone
   * - Use with extreme caution
   */
  @Delete('taxonomies/:taxonomyId/hard')
  @ApiOperation({ summary: 'Hard delete taxonomy node' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy node ID' })
  @ApiResponse({ status: 200, description: 'Taxonomy node hard deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions for hard delete' })
  @ApiResponse({ status: 404, description: 'Taxonomy node not found' })
  public async hardDeleteTaxonomy(
    @Param('taxonomyId') taxonomyId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Hard deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
    );
    try {
      // Check for platform permissions
      if (ctx.actor.kind !== 'platform') {
        throw new ForbiddenException('Hard delete requires platform operator permissions');
      }

      await this.catalogService.hardDeleteTaxonomy(taxonomyId, ctx);
      this.logger.log(
        `Taxonomy hard deleted successfully: ${taxonomyId} in tenant: ${ctx.tenantId}`,
      );
      return { message: 'Taxonomy node hard deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to hard delete taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to hard delete taxonomy due to internal error',
      );
    }
  }

  /**
   * Soft deletes a variant (marks as deleted but preserves data).
   *
   * @param variantId - Variant ID to soft delete
   * @param ctx - Tenant context for isolation
   * @returns The soft-deleted variant
   *
   * @throws NotFoundException - When variant not found
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Preserves historical order data
   * - Prevents new orders with deleted variant
   * - Inventory tracking preserved
   * - Requires tenant operator permissions
   */
  @Delete('variants/:variantId/soft')
  @ApiOperation({ summary: 'Soft delete variant' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  public async softDeleteVariant(
    @Param('variantId') variantId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<any> {
    this.logger.log(
      `Soft deleting variant: ${variantId} in tenant: ${ctx.tenantId}`,
    );
    try {
      const variant = await this.catalogService.softDeleteVariant(variantId, ctx);
      this.logger.log(
        `Variant soft deleted successfully: ${variantId} in tenant: ${ctx.tenantId}`,
      );
      return variant;
    } catch (error) {
      this.logger.error(
        `Failed to soft delete variant: ${variantId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to soft delete variant due to internal error',
      );
    }
  }

  /**
   * Hard deletes a variant (permanently removes data).
   *
   * @param variantId - Variant ID to hard delete
   * @param ctx - Tenant context for isolation
   * @returns Confirmation of hard deletion
   *
   * @throws NotFoundException - When variant not found
   * @throws ForbiddenException - When actor lacks platform permissions
   *
   * @remarks
   * - Requires elevated permissions (platform operators only)
   * - Removes all associated data including inventory
   * - Cannot be undone
   * - Use with extreme caution
   */
  @Delete('variants/:variantId/hard')
  @ApiOperation({ summary: 'Hard delete variant' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant hard deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions for hard delete' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  public async hardDeleteVariant(
    @Param('variantId') variantId: string,
    @TenantContext() ctx: RequestContext,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Hard deleting variant: ${variantId} in tenant: ${ctx.tenantId}`,
    );
    try {
      // Check for platform permissions
      if (ctx.actor.kind !== 'platform') {
        throw new ForbiddenException('Hard delete requires platform operator permissions');
      }

      await this.catalogService.hardDeleteVariant(variantId, ctx);
      this.logger.log(
        `Variant hard deleted successfully: ${variantId} in tenant: ${ctx.tenantId}`,
      );
      return { message: 'Variant hard deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to hard delete variant: ${variantId} in tenant: ${ctx.tenantId}`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to hard delete variant due to internal error',
      );
    }
  }
}
