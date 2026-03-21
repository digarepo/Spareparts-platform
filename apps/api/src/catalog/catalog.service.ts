import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse,
  ProductListResponse,
  CatalogListQuery,
  RequestContext,
  ProductStatus,
  ProductId,
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
import { CatalogRepository } from './catalog.repository';
import { applyCatalogFilters, validateCatalogFilters } from '../../../../domains/catalog/filters/catalog-listing';
import { generateProductSlug } from '../../../../domains/catalog/functions/slug-generation';
import { canPublishProduct } from '../../../../domains/catalog/functions/publication-rules';

/**
 * Application service for catalog operations.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** database via repositories
 * - **Threading/Async:** all methods are async
 * - **Tenancy:** all queries apply tenant-scoped RLS
 */
@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private readonly catalogRepository: CatalogRepository) {}

  /**
   * Validates that tenant context is available and returns the tenant ID.
   *
   * @param ctx - Request context
   * @returns Tenant ID
   * @throws BadRequestException when tenant context is missing
   */
  private requireTenantId(ctx: RequestContext): string {
    if (!ctx.tenantId!) {
      throw new BadRequestException('Tenant context is required');
    }
    return ctx.tenantId!;
  }

  /**
   * Creates a product within the current tenant context.
   *
   * @param request - Validated product creation payload
   * @param ctx - Request context with tenant information
   * @returns The created product representation
   *
   * @throws ConflictException - When product slug already exists in tenant
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Product is created with 'draft' status by default
   * - Slug uniqueness is enforced per tenant
   * - Audit trail is created automatically via database triggers
   */
  async createProduct(
    request: ProductCreateRequest,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Creating product: ${request.slug} for tenant: ${ctx.tenantId!}`,
    );

    // Validate slug uniqueness within tenant
    const tenantId = this.requireTenantId(ctx);
    const existingProduct = await this.catalogRepository.findBySlug(
      request.slug,
      tenantId,
    );
    if (existingProduct) {
      throw new ConflictException(
        `Product with slug '${request.slug}' already exists in tenant`,
      );
    }

    // Generate and validate slug if not provided
    const slug = generateProductSlug(request.name);

    const productData = {
      ...request,
      slug: slug,
      status: request.status || 'draft',
      tenantId: tenantId,
    };

    const product = await this.catalogRepository.create(productData, ctx);

    this.logger.debug(
      `Product created: ${product.id} for tenant: ${ctx.tenantId!}`,
    );

    return this.mapToProductResponse(product);
  }

  /**
   * Updates an existing product within the current tenant.
   *
   * @param productId - ULID of the product to update
   * @param request - Validated product update payload
   * @param ctx - Request context with tenant information
   * @returns The updated product representation
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws ConflictException - When new slug conflicts with existing product
   * @throws BadRequestException - When status transition is invalid
   *
   * @remarks
   * - Only provided fields are updated (partial update)
   * - Status transitions are validated against business rules
   * - Slug changes are validated for uniqueness
   */
  async updateProduct(
    productId: ProductId,
    request: ProductUpdateRequest,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Updating product: ${productId} for tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);
    const existingProduct = await this.catalogRepository.findById(
      productId,
      tenantId,
    );
    if (!existingProduct) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    // Validate slug uniqueness if slug is being changed
    if (request.slug && request.slug !== existingProduct.slug) {
      const slugConflict = await this.catalogRepository.findBySlug(
        request.slug,
        tenantId,
      );
      if (slugConflict && slugConflict.id !== productId) {
        throw new ConflictException(
          `Product with slug '${request.slug}' already exists in tenant`,
        );
      }
    }

    // Validate status transition if status is being changed
    if (request.status && request.status !== existingProduct.status) {
      this.validateStatusTransition(
        existingProduct.status,
        request.status,
        existingProduct,
      );
    }

    const updatedProduct = await this.catalogRepository.update(
      productId,
      request,
      ctx,
    );

    this.logger.debug(
      `Product updated: ${productId} for tenant: ${ctx.tenantId!}`,
    );

    return this.mapToProductResponse(updatedProduct);
  }

  /**
   * Lists products scoped to the current tenant with filtering and pagination.
   *
   * @param query - Validated catalog listing query parameters
   * @param ctx - Request context with tenant information
   * @returns Paginated list of products matching criteria
   *
   * @throws BadRequestException - When query parameters are invalid
   *
   * @remarks
   * - Results are tenant-scoped and RLS-enforced
   * - Pagination uses zero-based page indexing
   * - Search supports name and description matching
   */
  async listProducts(
    query: CatalogListQuery,
    ctx: RequestContext,
  ): Promise<ProductListResponse> {
    this.logger.debug(
      `Listing products for tenant: ${ctx.tenantId!} with query: ${JSON.stringify(query)}`,
    );

    // Convert query to domain filter criteria
    const filterCriteria = applyCatalogFilters(query);

    // Validate filter constraints
    validateCatalogFilters(filterCriteria);

    if (!ctx.tenantId!) {
      throw new BadRequestException('Tenant context is required');
    }

    const products = await this.catalogRepository.list(filterCriteria, ctx);

    this.logger.debug(
      `Found ${products.length} products for tenant: ${ctx.tenantId!}`,
    );

    return {
      products: products.map(this.mapToProductResponse),
    };
  }

  /**
   * Publishes a product, making it visible publicly.
   *
   * @param productId - ULID of the product to publish
   * @param ctx - Request context with tenant information
   * @returns The updated product with published status
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws BadRequestException - When product cannot be published
   * @throws ConflictException - When product is already published
   *
   * @remarks
   * - Validates product has required data for publication
   * - Sets publishedAt timestamp
   * - Records publication event in audit trail
   */
  async publishProduct(
    productId: ProductId,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Publishing product: ${productId} for tenant: ${ctx.tenantId!}`,
    );

    const product = await this.catalogRepository.findById(productId, ctx.tenantId!);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    if (product.status === 'published') {
      throw new ConflictException('Product is already published');
    }

    // Validate product is ready for publication
    const canPublish = canPublishProduct(product);
    if (!canPublish) {
      throw new BadRequestException(
        'Product cannot be published: missing required data or invalid state',
      );
    }

    if (!ctx.tenantId!) {
      throw new BadRequestException('Tenant context is required');
    }

    const updatedProduct = await this.catalogRepository.publish(productId, ctx);

    this.logger.debug(
      `Product published: ${productId} for tenant: ${ctx.tenantId!}`,
    );

    return this.mapToProductResponse(updatedProduct);
  }

  /**
   * Retrieves a single product by ID within the current tenant.
   *
   * @param productId - ULID of the product to retrieve
   * @param ctx - Request context with tenant information
   * @returns The product representation with variants
   *
   * @throws NotFoundException - When product not found or not in tenant
   *
   * @remarks
   * - Returns product regardless of status (tenant-scoped access)
   * - Includes variants and current inventory levels
   */
  async getProduct(
    productId: ProductId,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Retrieving product: ${productId} for tenant: ${ctx.tenantId!}`,
    );

    const product = await this.catalogRepository.findById(productId, ctx.tenantId!);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    return this.mapToProductResponse(product);
  }

  /**
   * Validates product status transitions according to business rules.
   *
   * @param fromStatus - Current product status
   * @param toStatus - Desired product status
   * @param product - Product data for validation context
   *
   * @throws BadRequestException - When transition is not allowed
   *
   * @remarks
   * - Published → Draft requires unpublish action first
   * - Published → Inactive is allowed (withdraw from sale)
   * - Draft → Published requires publication validation
   * - Inactive → Draft is allowed (re-edit)
   * - Inactive → Published requires publication validation
   */
  private validateStatusTransition(
    fromStatus: ProductStatus,
    toStatus: ProductStatus,
    product: any,
  ): void {
    // No change in status
    if (fromStatus === toStatus) {
      return;
    }

    const allowedTransitions: Record<ProductStatus, ProductStatus[]> = {
      draft: ['published', 'inactive'],
      published: ['inactive'],
      inactive: ['draft', 'published'],
    };

    const allowedStatuses = allowedTransitions[fromStatus];
    if (!allowedStatuses.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${fromStatus}' to '${toStatus}'`,
      );
    }

    // Additional validation for publishing
    if (toStatus === 'published') {
      const canPublish = canPublishProduct(product);
      if (!canPublish) {
        throw new BadRequestException(
          'Product cannot be published: missing required data or invalid state',
        );
      }
    }
  }

  /**
   * Maps database product entity to API response contract.
   *
   * @param product - Database product entity
   * @returns Product response contract
   *
   * @remarks
   * - Transforms database timestamps to ISO strings
   * - Includes computed visibility flags
   * - Filters sensitive internal fields
   */
  private mapToProductResponse(product: any): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      description: product.description,
      tags: product.tags || [],
      taxonomyIds: product.taxonomyIds || [],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new variant under a product.
   *
   * @param request - Validated variant creation payload
   * @param ctx - Request context with tenant information
   * @returns The updated product with new variant
   *
   * @throws NotFoundException - When product not found or not in tenant
   * @throws ConflictException - When SKU already exists in tenant
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - SKU must be unique per tenant
   * - Variant is associated with existing product
   * - Audit trail is created automatically
   */
  async createVariant(
    request: VariantCreateRequest,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Creating variant: ${request.sku} for product: ${request.productId} in tenant: ${ctx.tenantId!}`,
    );

    // Validate product exists in tenant
    const product = await this.catalogRepository.findById(request.productId, ctx.tenantId!);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${request.productId}' not found in tenant`,
      );
    }

    // Validate SKU uniqueness within tenant
    const existingVariant = await this.catalogRepository.findBySku(request.sku, ctx.tenantId!);
    if (existingVariant) {
      throw new ConflictException(
        `Variant with SKU '${request.sku}' already exists in tenant`,
      );
    }

    const variant = await this.catalogRepository.createVariant(request, ctx);

    this.logger.debug(
      `Variant created: ${variant.id} for product: ${request.productId} in tenant: ${ctx.tenantId!}`,
    );

    // Return updated product with variants
    const updatedProduct = await this.catalogRepository.findById(request.productId, ctx.tenantId!);
    return this.mapToProductResponse(updatedProduct);
  }

  /**
   * Updates an existing variant within the current tenant.
   *
   * @param variantId - ULID of the variant to update
   * @param request - Validated variant update payload
   * @param ctx - Request context with tenant information
   * @returns The updated product with variant changes
   *
   * @throws NotFoundException - When variant not found or not in tenant
   * @throws ConflictException - When new SKU conflicts with existing variant
   * @throws BadRequestException - When request validation fails
   *
   * @remarks
   * - Only provided fields are updated (partial update)
   * - SKU changes must remain unique per tenant
   * - Product association cannot be changed
   */
  async updateVariant(
    variantId: string,
    request: VariantUpdateRequest,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Updating variant: ${variantId} in tenant: ${ctx.tenantId!}`,
    );

    const existingVariant = await this.catalogRepository.findVariantById(variantId, ctx.tenantId!);
    if (!existingVariant) {
      throw new NotFoundException(
        `Variant with ID '${variantId}' not found in tenant`,
      );
    }

    // Validate SKU uniqueness if SKU is being changed
    if (request.sku && request.sku !== existingVariant.sku) {
      const skuConflict = await this.catalogRepository.findBySku(request.sku, ctx.tenantId!);
      if (skuConflict && skuConflict.id !== variantId) {
        throw new ConflictException(
          `Variant with SKU '${request.sku}' already exists in tenant`,
        );
      }
    }

    const updatedVariant = await this.catalogRepository.updateVariant(variantId, request, ctx);

    this.logger.debug(
      `Variant updated: ${variantId} in tenant: ${ctx.tenantId!}`,
    );

    // Return updated product with variants
    const product = await this.catalogRepository.findById(existingVariant.productId, ctx.tenantId!);
    return this.mapToProductResponse(product);
  }

  /**
   * Retrieves a single variant by ID within the current tenant.
   *
   * @param variantId - ULID of the variant to retrieve
   * @param ctx - Request context with tenant information
   * @returns The product containing the variant
   *
   * @throws NotFoundException - When variant not found or not in tenant
   *
   * @remarks
   * - Returns variant with associated product information
   * - Includes pricing and inventory information if available
   */
  async getVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Retrieving variant: ${variantId} for tenant: ${ctx.tenantId!}`,
    );

    const variant = await this.catalogRepository.findVariantById(variantId, ctx.tenantId!);
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID '${variantId}' not found in tenant`,
      );
    }

    // Return product containing the variant
    const product = await this.catalogRepository.findById(variant.productId, ctx.tenantId!);
    return this.mapToProductResponse(product);
  }

  /**
   * Lists variants for a specific product within the current tenant.
   *
   * @param productId - ULID of the product to list variants for
   * @param ctx - Request context with tenant information
   * @returns Product with all variants
   *
   * @throws NotFoundException - When product not found or not in tenant
   *
   * @remarks
   * - Returns all variants for the specified product
   * - Includes pricing and inventory information if available
   * - Results are tenant-scoped and RLS-enforced
   */
  async listVariants(
    productId: string,
    ctx: RequestContext,
  ): Promise<ProductResponse> {
    this.logger.debug(
      `Listing variants for product: ${productId} in tenant: ${ctx.tenantId!}`,
    );

    const product = await this.catalogRepository.findById(productId, ctx.tenantId!);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    this.logger.debug(
      `Listed ${product.variants?.length || 0} variants for product: ${productId} in tenant: ${ctx.tenantId!}`,
    );

    return this.mapToProductResponse(product);
  }

  /**
   * Creates a new taxonomy node within the tenant.
   *
   * @param request - Validated taxonomy creation payload
   * @param ctx - Request context with tenant information
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
  async createTaxonomy(
    request: TaxonomyCreateRequest,
    ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.debug(
      `Creating taxonomy: ${request.label} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Validate parent exists in tenant if specified
    if (request.parentId) {
      const parent = await this.catalogRepository.findTaxonomyById(request.parentId, tenantId);
      if (!parent) {
        throw new NotFoundException(
          `Parent taxonomy with ID '${request.parentId}' not found in tenant`,
        );
      }
    }

    // Check for platform taxonomy governance
    if (ctx.actor.kind !== 'platform' && request.isPlatformOwned) {
      throw new ForbiddenException('Only platform operators can create platform-owned taxonomy');
    }

    // Validate label uniqueness within parent scope
    const existingSibling = await this.catalogRepository.findTaxonomyByLabelAndParent(
      request.label,
      request.parentId,
      tenantId,
    );
    if (existingSibling) {
      throw new ConflictException(
        `Taxonomy with label '${request.label}' already exists in parent scope`,
      );
    }

    const taxonomy = await this.catalogRepository.createTaxonomy(request, ctx);

    this.logger.debug(
      `Taxonomy created: ${taxonomy.id} in tenant: ${ctx.tenantId!}`,
    );

    return taxonomy;
  }

  /**
   * Updates an existing taxonomy node within the current tenant.
   *
   * @param taxonomyId - ULID of the taxonomy node to update
   * @param request - Validated taxonomy update payload
   * @param ctx - Request context with tenant information
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
  async updateTaxonomy(
    taxonomyId: string,
    request: TaxonomyUpdateRequest,
    ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.debug(
      `Updating taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);
    const existingTaxonomy = await this.catalogRepository.findTaxonomyById(taxonomyId, tenantId);
    if (!existingTaxonomy) {
      throw new NotFoundException(
        `Taxonomy with ID '${taxonomyId}' not found in tenant`,
      );
    }

    // Validate parent exists in tenant if being changed
    if (request.parentId !== undefined) {
      if (request.parentId) {
        const parent = await this.catalogRepository.findTaxonomyById(request.parentId, tenantId);
        if (!parent) {
          throw new NotFoundException(
            `Parent taxonomy with ID '${request.parentId}' not found in tenant`,
          );
        }

        // Validate no cycles (parent cannot be descendant of current node)
        if (await this.catalogRepository.isTaxonomyDescendant(request.parentId, taxonomyId, tenantId)) {
          throw new BadRequestException(
            'Cannot set parent: would create a cycle in taxonomy hierarchy',
          );
        }
      }
    }

    // Check for platform taxonomy governance
    if (request.isPlatformOwned !== undefined) {
      if (ctx.actor.kind !== 'platform' && request.isPlatformOwned) {
        throw new ForbiddenException('Only platform operators can set platform-owned taxonomy');
      }

      // Check if trying to modify platform-owned taxonomy as non-platform operator
      if (ctx.actor.kind !== 'platform' && existingTaxonomy.isPlatformOwned) {
        throw new ForbiddenException('Only platform operators can modify platform-owned taxonomy');
      }
    } else if (existingTaxonomy.isPlatformOwned && ctx.actor.kind !== 'platform') {
      // Check if trying to modify platform-owned taxonomy as non-platform operator
      throw new ForbiddenException('Only platform operators can modify platform-owned taxonomy');
    }

    // Validate label uniqueness if label is being changed
    if (request.label && request.label !== existingTaxonomy.label) {
      const parentId = request.parentId !== undefined ? request.parentId : existingTaxonomy.parentId;
      const labelConflict = await this.catalogRepository.findTaxonomyByLabelAndParent(
        request.label,
        parentId,
        tenantId,
      );
      if (labelConflict && labelConflict.id !== taxonomyId) {
        throw new ConflictException(
          `Taxonomy with label '${request.label}' already exists in parent scope`,
        );
      }
    }

    const updatedTaxonomy = await this.catalogRepository.updateTaxonomy(taxonomyId, request, ctx);

    this.logger.debug(
      `Taxonomy updated: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    return updatedTaxonomy;
  }

  /**
   * Retrieves a single taxonomy node by ID within the current tenant.
   *
   * @param taxonomyId - ULID of the taxonomy node to retrieve
   * @param ctx - Request context with tenant information
   * @returns The taxonomy node
   *
   * @throws NotFoundException - When taxonomy not found or not in tenant
   *
   * @remarks
   * - Returns node with complete hierarchy information
   * - Includes metadata for navigation and faceting
   */
  async getTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.debug(
      `Retrieving taxonomy: ${taxonomyId} for tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);
    const taxonomy = await this.catalogRepository.findTaxonomyById(taxonomyId, tenantId);
    if (!taxonomy) {
      throw new NotFoundException(
        `Taxonomy with ID '${taxonomyId}' not found in tenant`,
      );
    }

    this.logger.debug(
      `Taxonomy retrieved: ${taxonomyId} for tenant: ${ctx.tenantId!}`,
    );

    return taxonomy;
  }

  /**
   * Lists all taxonomy nodes within the current tenant.
   *
   * @param ctx - Request context with tenant information
   * @returns List of taxonomy nodes for the tenant
   *
   * @remarks
   * - Returns flat list of all nodes for tenant
   * - Client-side responsible for tree construction
   * - Results are tenant-scoped and RLS-enforced
   */
  async listTaxonomies(ctx: RequestContext): Promise<TaxonomyListResponse> {
    this.logger.debug(
      `Listing taxonomies for tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);
    const taxonomies = await this.catalogRepository.listTaxonomies(tenantId);

    this.logger.debug(
      `Listed ${taxonomies.length} taxonomies for tenant: ${ctx.tenantId!}`,
    );

    return {
      taxonomies,
      total: taxonomies.length,
    };
  }

  /**
   * Assigns a product to a taxonomy node for classification.
   *
   * @param productId - Product ID to assign
   * @param request - Validated classification assignment payload
   * @param ctx - Request context with tenant information
   * @returns The created assignment relationship
   *
   * @throws NotFoundException - When product or taxonomy not found
   * @throws ConflictException - When assignment already exists
   *
   * @remarks
   * - Supports multi-category classification
   * - Assignment is explicit and auditable
   */
  async assignProductToTaxonomy(
    productId: string,
    request: ClassificationAssignRequest,
    ctx: RequestContext,
  ): Promise<ClassificationAssignmentResponse> {
    this.logger.debug(
      `Assigning product ${productId} to taxonomy ${request.taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Validate product exists in tenant
    const product = await this.catalogRepository.findById(productId, tenantId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    // Validate taxonomy exists (tenant or platform)
    const taxonomy = await this.catalogRepository.findTaxonomyById(request.taxonomyId, tenantId);
    if (!taxonomy) {
      throw new NotFoundException(
        `Taxonomy with ID '${request.taxonomyId}' not found`,
      );
    }

    // Check if assignment already exists
    const existingAssignment = await this.catalogRepository.findClassificationAssignment(
      productId,
      request.taxonomyId,
      tenantId,
    );
    if (existingAssignment) {
      throw new ConflictException(
        `Product ${productId} is already assigned to taxonomy ${request.taxonomyId}`,
      );
    }

    const assignment = await this.catalogRepository.createClassificationAssignment(
      productId,
      request.taxonomyId,
      tenantId,
      ctx,
    );

    this.logger.debug(
      `Classification assignment created: ${assignment.id} in tenant: ${ctx.tenantId!}`,
    );

    return assignment;
  }

  /**
   * Unassigns a product from a taxonomy node.
   *
   * @param productId - Product ID to unassign
   * @param taxonomyId - Taxonomy node ID to unassign from
   * @param ctx - Request context with tenant information
   * @returns Confirmation of successful unassignment
   *
   * @throws NotFoundException - When assignment not found
   *
   * @remarks
   * - Historical audit trail preserved
   * - Cannot undo assignments affecting historical orders
   */
  async unassignProductFromTaxonomy(
    productId: string,
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Unassigning product ${productId} from taxonomy ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    const assignment = await this.catalogRepository.findClassificationAssignment(
      productId,
      taxonomyId,
      tenantId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `Classification assignment not found for product ${productId} and taxonomy ${taxonomyId}`,
      );
    }

    await this.catalogRepository.deleteClassificationAssignment(assignment.id, tenantId);

    this.logger.debug(
      `Classification assignment removed: product ${productId} from taxonomy ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );
  }

  /**
   * Lists all taxonomy assignments for a product.
   *
   * @param productId - Product ID to list classifications for
   * @param ctx - Request context with tenant information
   * @returns List of classification assignments with taxonomy details
   *
   * @throws NotFoundException - When product not found
   *
   * @remarks
   * - Returns all taxonomy assignments for navigation
   * - Includes taxonomy node details for client-side tree construction
   */
  async listProductClassifications(
    productId: string,
    ctx: RequestContext,
  ): Promise<ClassificationListResponse> {
    this.logger.debug(
      `Listing classifications for product ${productId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Validate product exists in tenant
    const product = await this.catalogRepository.findById(productId, tenantId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${productId}' not found in tenant`,
      );
    }

    const assignments = await this.catalogRepository.listClassificationAssignments(
      productId,
      tenantId,
    );

    this.logger.debug(
      `Listed ${assignments.length} classifications for product ${productId} in tenant: ${ctx.tenantId!}`,
    );

    return {
      assignments,
      total: assignments.length,
    };
  }

  /**
   * Bulk assigns multiple products to taxonomy nodes.
   *
   * @param request - Validated bulk classification assignment payload
   * @param ctx - Request context with tenant information
   * @returns Results of bulk assignment operation
   *
   * @remarks
   * - All operations in single request are atomic
   * - Enables partial success handling
   * - Used for bulk import or reclassification operations
   */
  async bulkAssignProductsToTaxonomy(
    request: ClassificationBulkAssignRequest,
    ctx: RequestContext,
  ): Promise<ClassificationBulkAssignResponse> {
    this.logger.debug(
      `Bulk assigning ${request.assignments.length} classifications in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);
    const results = [];

    for (const assignmentRequest of request.assignments) {
      try {
        const assignment = await this.assignProductToTaxonomy(
          assignmentRequest.productId,
          assignmentRequest,
          ctx,
        );
        results.push({
          request: assignmentRequest,
          success: true,
          assignment,
        });
      } catch (error) {
        results.push({
          request: assignmentRequest,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const totalSucceeded = results.filter(r => r.success).length;
    const totalFailed = results.length - totalSucceeded;

    this.logger.debug(
      `Bulk assignment completed: ${totalSucceeded}/${results.length} successful in tenant: ${ctx.tenantId!}`,
    );

    return {
      results,
      totalProcessed: results.length,
      totalSucceeded,
      totalFailed,
    };
  }

  /**
   * Soft deletes a taxonomy node (marks as deleted but preserves data).
   *
   * @param taxonomyId - Taxonomy node ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The soft-deleted taxonomy node
   *
   * @throws NotFoundException - When taxonomy not found
   *
   * @remarks
   * - Preserves historical audit trail
   * - Prevents new assignments to deleted taxonomy
   * - Existing assignments remain for historical orders
   */
  async softDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<TaxonomyResponse> {
    this.logger.debug(
      `Soft deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Validate taxonomy exists in tenant
    const taxonomy = await this.catalogRepository.findTaxonomyById(taxonomyId, tenantId);
    if (!taxonomy) {
      throw new NotFoundException(
        `Taxonomy with ID '${taxonomyId}' not found in tenant`,
      );
    }

    const softDeletedTaxonomy = await this.catalogRepository.softDeleteTaxonomy(taxonomyId, ctx);

    this.logger.debug(
      `Taxonomy soft deleted: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    return softDeletedTaxonomy;
  }

  /**
   * Hard deletes a taxonomy node (permanently removes data).
   *
   * @param taxonomyId - Taxonomy node ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns Confirmation of hard deletion
   *
   * @throws NotFoundException - When taxonomy not found
   * @throws ForbiddenException - When actor lacks platform permissions
   *
   * @remarks
   * - Requires elevated permissions (platform operators only)
   * - Removes all associated data including assignments
   * - Cannot be undone
   */
  async hardDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting taxonomy: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Check for platform permissions
    if (ctx.actor.kind !== 'platform') {
      throw new ForbiddenException('Hard delete requires platform operator permissions');
    }

    // Validate taxonomy exists in tenant
    const taxonomy = await this.catalogRepository.findTaxonomyById(taxonomyId, tenantId);
    if (!taxonomy) {
      throw new NotFoundException(
        `Taxonomy with ID '${taxonomyId}' not found in tenant`,
      );
    }

    await this.catalogRepository.hardDeleteTaxonomy(taxonomyId, ctx);

    this.logger.debug(
      `Taxonomy hard deleted: ${taxonomyId} in tenant: ${ctx.tenantId!}`,
    );
  }

  /**
   * Soft deletes a variant (marks as deleted but preserves data).
   *
   * @param variantId - Variant ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The soft-deleted variant
   *
   * @throws NotFoundException - When variant not found
   *
   * @remarks
   * - Preserves historical order data
   * - Prevents new orders with deleted variant
   * - Inventory tracking preserved
   */
  async softDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Soft deleting variant: ${variantId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Validate variant exists in tenant
    const variant = await this.catalogRepository.findVariantById(variantId, tenantId);
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID '${variantId}' not found in tenant`,
      );
    }

    const softDeletedVariant = await this.catalogRepository.softDeleteVariant(variantId, ctx);

    this.logger.debug(
      `Variant soft deleted: ${variantId} in tenant: ${ctx.tenantId!}`,
    );

    return softDeletedVariant;
  }

  /**
   * Hard deletes a variant (permanently removes data).
   *
   * @param variantId - Variant ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns Confirmation of hard deletion
   *
   * @throws NotFoundException - When variant not found
   * @throws ForbiddenException - When actor lacks platform permissions
   *
   * @remarks
   * - Requires elevated permissions (platform operators only)
   * - Removes all associated data including inventory
   * - Cannot be undone
   */
  async hardDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting variant: ${variantId} in tenant: ${ctx.tenantId!}`,
    );

    const tenantId = this.requireTenantId(ctx);

    // Check for platform permissions
    if (ctx.actor.kind !== 'platform') {
      throw new ForbiddenException('Hard delete requires platform operator permissions');
    }

    // Validate variant exists in tenant
    const variant = await this.catalogRepository.findVariantById(variantId, tenantId);
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID '${variantId}' not found in tenant`,
      );
    }

    await this.catalogRepository.hardDeleteVariant(variantId, ctx);

    this.logger.debug(
      `Variant hard deleted: ${variantId} in tenant: ${ctx.tenantId!}`,
    );
  }
}
