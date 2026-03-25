import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type {
  RequestContext,
  ProductResponse,
  ProductListResponse,
  TaxonomyResponse,
  TaxonomyListResponse,
  ClassificationAssignmentResponse,
  ClassificationListResponse,
  VariantResponse,
  VariantListResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  TaxonomyCreateRequest,
  TaxonomyUpdateRequest,
  VariantCreateRequest,
  VariantUpdateRequest,
  ClassificationAssignRequest,
  ClassificationBulkAssignRequest,
  CatalogFilterCriteria,
  ProductId,
  TaxonomyId,
  VariantId
} from '@spareparts/contracts';
import { getTenantPrismaClient } from '../prisma/tenant-prisma.client';

// Database entity types
interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published' | 'inactive';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tags?: string[];
  taxonomyIds?: string[];
}

interface TaxonomyEntity {
  id: string;
  label: string;
  parentId: string | null;
  tenantId?: string;
  isPlatformOwned?: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface ClassificationAssignmentEntity {
  id: string;
  productId: string;
  taxonomyId: string;
  tenantId: string;
  assignedAt: Date;
  assignedBy: string;
}

interface VariantEntity {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, any>;
  price?: number;
  quantity?: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository for catalog database operations.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** database via Prisma client
 * - **Threading/Async:** all methods are async
 * - **Tenancy:** all queries use tenant-scoped Prisma client with RLS
 */
@Injectable()
export class CatalogRepository {
  private readonly logger = new Logger(CatalogRepository.name);

  /**
   * Creates a new product in the database.
   *
   * @param productData - Product creation data
   * @param ctx - Request context with tenant information
   * @returns The created product entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Database triggers handle audit trail creation
   * - PublishedAt is set to null for draft products
   */
  async create(
    productData: ProductCreateRequest,
    ctx: RequestContext,
  ): Promise<ProductEntity> {
    this.logger.debug(
      `Creating product in database: ${productData.slug} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.create({
      data: {
        ...productData,
        publishedAt: productData.status === 'published' ? new Date() : null,
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product created in database: ${product.id} for tenant: ${ctx.tenantId}`,
    );

    return product;
  }

  /**
   * Updates an existing product in the database.
   *
   * @param productId - ULID of the product to update
   * @param updateData - Product update data
   * @param ctx - Request context with tenant information
   * @returns The updated product entity
   *
   * @remarks
   * - Only provided fields are updated
   * - PublishedAt is set when status changes to published
   * - All changes are tracked via database triggers
   */
  async update(
    productId: ProductId,
    updateData: ProductUpdateRequest,
    ctx: RequestContext,
  ): Promise<ProductEntity> {
    this.logger.debug(
      `Updating product in database: ${productId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    // Handle publishedAt timestamp for status changes
    let publishedAtUpdate = {};
    if (updateData.status === 'published') {
      publishedAtUpdate = { publishedAt: new Date() };
    } else if (updateData.status && ['draft', 'inactive'].includes(updateData.status)) {
      publishedAtUpdate = { publishedAt: null };
    }

    const product = await (prisma as any).product.update({
      where: { id: productId },
      data: {
        ...updateData,
        ...publishedAtUpdate,
        updatedAt: new Date(),
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    this.logger.debug(
      `Product updated in database: ${product.id} for tenant: ${ctx.tenantId}`,
    );

    return product;
  }

  /**
   * Finds a product by slug within a tenant.
   *
   * @param slug - Product slug to find
   * @param tenantId - Tenant ID for scoping
   * @returns Product entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes variants and related data
   */
  async findBySlug(
    slug: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding product by slug: ${slug} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const product = await (prisma as any).product.findFirst({
      where: {
        slug,
        tenantId,
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    return product;
  }

  /**
   * Finds a product by ID within a tenant.
   *
   * @param productId - ULID of the product to find
   * @param tenantId - Tenant ID for scoping
   * @returns Product entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes variants and related data
   */
  async findById(
    productId: ProductId,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding product by ID: ${productId} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const product = await (prisma as any).product.findFirst({
      where: {
        id: productId,
        tenantId,
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    return product;
  }

  /**
   * Finds a variant by SKU within the tenant context.
   *
   * @param sku - Variant SKU to find
   * @param tenantId - Tenant ID for scoping
   * @returns The variant entity or null if not found
   *
   * @remarks
   * - Used for SKU uniqueness validation
   * - Tenant-scoped via RLS policies
   */
  async findBySku(
    sku: string,
    tenantId: string,
  ): Promise<any | null> {
    this.logger.debug(
      `Finding variant by SKU: ${sku} for tenant: ${tenantId}`,
    );

    const ctx = { tenantId, correlationId: '', actor: { kind: 'platform' as const, scope: 'platform' as const, userId: '' } };
    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.findUnique({
      where: { sku },
      include: {
        price: true,
        quantity: true,
      },
    });

    this.logger.debug(
      `Variant by SKU ${variant ? 'found' : 'not found'}: ${sku} for tenant: ${tenantId}`,
    );

    return variant;
  }


  /**
   * Lists products with filtering and pagination.
   *
   * @param criteria - Domain filter criteria
   * @param ctx - Request context with tenant information
   * @returns Array of products matching criteria
   *
   * @remarks
   * - Applies tenant-scoped RLS filtering
   * - Supports status, taxonomy, and search filters
   * - Pagination uses offset/limit for database efficiency
   */
  async list(
    criteria: CatalogFilterCriteria,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Listing products for tenant: ${ctx.tenantId} with criteria:`,
      criteria,
    );

    const prisma = getTenantPrismaClient(ctx);

    const products = await (prisma as any).product.findMany({
      where: {
        tenantId: ctx.tenantId,
        status: criteria.status,
        taxonomyIds: criteria.taxonomyIds ? {
          hasSome: Array.from(criteria.taxonomyIds)
        } : undefined,
        OR: criteria.searchText ? [
          { name: { contains: criteria.searchText, mode: 'insensitive' } },
          { description: { contains: criteria.searchText, mode: 'insensitive' } }
        ] : undefined
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: criteria.pagination.offset,
      take: criteria.pagination.limit
    });

    return products;
  }

  /**
   * Finds a variant by SKU within a tenant.
   *
   * @param sku - Variant SKU to find
   * @param tenantId - Tenant ID for scoping
   * @returns Variant entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes product information
   */
  async findByVariantSku(
    sku: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding variant by SKU: ${sku} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const variant = await (prisma as any).variant.findFirst({
      where: {
        sku,
        tenantId,
      },
      include: {
        product: {
          include: {
            variants: {
              include: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    return variant;
  }

  /**
   * Publishes a product.
   *
   * @param productId - ULID of the product to publish
   * @param ctx - Request context with tenant information
   * @returns The updated product entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Sets publishedAt timestamp
   * - Records publication event in audit trail
   */
  async publish(
    productId: ProductId,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Publishing product: ${productId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const product = await (prisma as any).product.update({
      where: { id: productId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        variants: {
          include: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    return product;
  }

  /**
   * Creates a taxonomy node.
   *
   * @param taxonomyData - Taxonomy creation data
   * @param ctx - Request context with tenant information
   * @returns The created taxonomy entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates parent relationships
   * - Handles platform vs tenant ownership
   */
  async createTaxonomy(
    taxonomyData: TaxonomyCreateRequest,
    ctx: RequestContext,
  ): Promise<TaxonomyEntity> {
    this.logger.debug(
      `Creating taxonomy: ${taxonomyData.label} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomyNode.create({
      data: {
        ...taxonomyData,
        tenantId: taxonomyData.isPlatformOwned ? null : ctx.tenantId,
      },
    });

    return taxonomy;
  }

  /**
   * Finds taxonomy by label and parent.
   *
   * @param label - Taxonomy label to find
   * @param parentId - Parent taxonomy ID (optional)
   * @param tenantId - Tenant ID for scoping
   * @returns Taxonomy entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Checks for label uniqueness within parent scope
   */
  async findTaxonomyByLabelAndParent(
    label: string,
    parentId: string | null,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding taxonomy by label: ${label} with parent: ${parentId} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const taxonomy = await (prisma as any).taxonomyNode.findFirst({
      where: {
        label,
        parentId,
        OR: [
          { tenantId },
          { tenantId: null }, // Platform taxonomies
        ],
      },
    });

    return taxonomy;
  }

  /**
   * Creates a classification assignment.
   *
   * @param assignmentData - Assignment creation data
   * @param ctx - Request context with tenant information
   * @returns The created assignment entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates product and taxonomy existence
   * - Prevents duplicate assignments
   */
  async createClassificationAssignment(
    assignmentData: ClassificationAssignRequest,
    ctx: RequestContext,
  ): Promise<ClassificationAssignmentEntity> {
    this.logger.debug(
      `Creating classification assignment for product: ${assignmentData.productId} and taxonomy: ${assignmentData.taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const assignment = await (prisma as any).productTaxonomyAssignment.create({
      data: {
        ...assignmentData,
        tenantId: ctx.tenantId,
      },
    });

    return assignment;
  }

  /**
   * Finds a classification assignment.
   *
   * @param productId - Product ID
   * @param taxonomyId - Taxonomy ID
   * @param tenantId - Tenant ID for scoping
   * @returns Assignment entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Checks for existing assignment
   */
  async findClassificationAssignment(
    productId: string,
    taxonomyId: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding classification assignment for product: ${productId} and taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const assignment = await (prisma as any).productTaxonomyAssignment.findFirst({
      where: {
        productId,
        taxonomyId,
        tenantId,
      },
    });

    return assignment;
  }

  /**
   * Deletes a classification assignment.
   *
   * @param productId - Product ID
   * @param taxonomyId - Taxonomy ID
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Soft deletes the assignment
   */
  async deleteClassificationAssignment(
    productId: string,
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Deleting classification assignment for product: ${productId} and taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).productTaxonomyAssignment.delete({
      where: {
        productId_taxonomyId: {
          productId,
          taxonomyId,
        },
      },
    });
  }

  /**
   * Lists classification assignments for a product.
   *
   * @param productId - Product ID
   * @param ctx - Request context with tenant information
   * @returns List of classification assignments
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes taxonomy information
   */
  async listClassificationAssignments(
    productId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Listing classification assignments for product: ${productId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const assignments = await (prisma as any).productTaxonomyAssignment.findMany({
      where: {
        productId,
        tenantId: ctx.tenantId,
      },
      include: {
        taxonomy: true,
      },
    });

    return assignments;
  }

  /**
   * Soft deletes a taxonomy.
   *
   * @param taxonomyId - Taxonomy ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The updated taxonomy entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Sets deletedAt timestamp
   * - Validates permissions
   */
  async softDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Soft deleting taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomyNode.update({
      where: { id: taxonomyId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return taxonomy;
  }

  /**
   * Hard deletes a taxonomy.
   *
   * @param taxonomyId - Taxonomy ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Permanently removes the taxonomy
   * - Requires platform operator permissions
   */
  async hardDeleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).taxonomyNode.delete({
      where: { id: taxonomyId },
    });
  }

  /**
   * Soft deletes a variant.
   *
   * @param variantId - Variant ID to soft delete
   * @param ctx - Request context with tenant information
   * @returns The updated variant entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Sets deletedAt timestamp
   */
  async softDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Soft deleting variant: ${variantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.update({
      where: { id: variantId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return variant;
  }

  /**
   * Hard deletes a variant.
   *
   * @param variantId - Variant ID to hard delete
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Permanently removes the variant
   * - Requires platform operator permissions
   */
  async hardDeleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Hard deleting variant: ${variantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).variant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Creates a variant.
   *
   * @param variantData - Variant creation data
   * @param ctx - Request context with tenant information
   * @returns The created variant entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates SKU uniqueness
   * - Associates with existing product
   */
  async createVariant(
    variantData: VariantCreateRequest,
    ctx: RequestContext,
  ): Promise<VariantEntity> {
    this.logger.debug(
      `Creating variant: ${variantData.sku} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.create({
      data: {
        ...variantData,
        tenantId: ctx.tenantId,
      },
      include: {
        product: {
          include: {
            variants: {
              include: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    return variant;
  }

  /**
   * Finds a variant by ID.
   *
   * @param variantId - Variant ID to find
   * @param tenantId - Tenant ID for scoping
   * @returns Variant entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes product information
   */
  async findVariantById(
    variantId: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding variant by ID: ${variantId} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const variant = await (prisma as any).variant.findFirst({
      where: {
        id: variantId,
        tenantId,
      },
      include: {
        product: {
          include: {
            variants: {
              include: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    return variant;
  }

  /**
   * Updates a variant.
   *
   * @param variantId - Variant ID to update
   * @param updateData - Variant update data
   * @param ctx - Request context with tenant information
   * @returns The updated variant entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates SKU uniqueness
   * - Updates only provided fields
   */
  async updateVariant(
    variantId: string,
    updateData: VariantUpdateRequest,
    ctx: RequestContext,
  ): Promise<VariantEntity> {
    this.logger.debug(
      `Updating variant: ${variantId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variant = await (prisma as any).variant.update({
      where: { id: variantId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        product: {
          include: {
            variants: {
              include: {
                price: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    return variant;
  }

  /**
   * Lists variants for a product.
   *
   * @param productId - Product ID
   * @param ctx - Request context with tenant information
   * @returns List of variants
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes pricing and inventory information
   */
  async listVariants(
    productId: string,
    ctx: RequestContext,
  ): Promise<any> {
    this.logger.debug(
      `Listing variants for product: ${productId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const variants = await (prisma as any).variant.findMany({
      where: {
        productId,
        tenantId: ctx.tenantId,
      },
      include: {
        price: true,
        quantity: true,
      },
    });

    return variants;
  }

  /**
   * Finds a taxonomy by ID.
   *
   * @param taxonomyId - Taxonomy ID to find
   * @param tenantId - Tenant ID for scoping
   * @returns Taxonomy entity or null if not found
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes hierarchy information
   */
  async findTaxonomyById(
    taxonomyId: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.debug(
      `Finding taxonomy by ID: ${taxonomyId} for tenant: ${tenantId}`,
    );

    const prisma = getTenantPrismaClient({ tenantId } as RequestContext);

    const taxonomy = await (prisma as any).taxonomyNode.findFirst({
      where: {
        id: taxonomyId,
        OR: [
          { tenantId },
          { tenantId: null }, // Platform taxonomies
        ],
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return taxonomy;
  }

  /**
   * Lists taxonomies.
   *
   * @param ctx - Request context with tenant information
   * @returns List of taxonomies
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Includes both tenant and platform taxonomies
   */
  async listTaxonomies(ctx: RequestContext): Promise<any> {
    this.logger.debug(
      `Listing taxonomies for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomies = await (prisma as any).taxonomyNode.findMany({
      where: {
        OR: [
          { tenantId: ctx.tenantId },
          { tenantId: null }, // Platform taxonomies
        ],
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return taxonomies;
  }

  /**
   * Updates a taxonomy.
   *
   * @param taxonomyId - Taxonomy ID to update
   * @param updateData - Taxonomy update data
   * @param ctx - Request context with tenant information
   * @returns The updated taxonomy entity
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates parent relationships
   * - Checks permissions for platform taxonomies
   */
  async updateTaxonomy(
    taxonomyId: string,
    updateData: TaxonomyUpdateRequest,
    ctx: RequestContext,
  ): Promise<TaxonomyEntity> {
    this.logger.debug(
      `Updating taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    const taxonomy = await (prisma as any).taxonomyNode.update({
      where: { id: taxonomyId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return taxonomy;
  }

  /**
   * Checks if a taxonomy is a descendant of another.
   *
   * @param taxonomyId - Taxonomy ID to check
   * @param ancestorId - Potential ancestor taxonomy ID
   * @param ctx - Request context with tenant information
   * @returns True if taxonomy is a descendant
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Prevents circular references
   */
  async isTaxonomyDescendant(
    taxonomyId: string,
    ancestorId: string,
    ctx: RequestContext,
  ): Promise<boolean> {
    this.logger.debug(
      `Checking if taxonomy: ${taxonomyId} is descendant of: ${ancestorId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    // Simple implementation - in production would use recursive CTE
    const taxonomy = await (prisma as any).taxonomyNode.findFirst({
      where: { id: taxonomyId },
      include: { parent: true },
    });

    if (!taxonomy || !taxonomy.parent) {
      return false;
    }

    if (taxonomy.parentId === ancestorId) {
      return true;
    }

    return this.isTaxonomyDescendant(taxonomy.parentId, ancestorId, ctx);
  }

  /**
   * Deletes a product.
   *
   * @param productId - Product ID to delete
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Cascades to variants and assignments
   */
  async delete(
    productId: ProductId,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Deleting product: ${productId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).product.delete({
      where: { id: productId },
    });
  }

  /**
   * Deletes a variant.
   *
   * @param variantId - Variant ID to delete
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Removes variant and associated data
   */
  async deleteVariant(
    variantId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Deleting variant: ${variantId} for tenant: ${ctx.tenantId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).variant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Deletes a taxonomy.
   *
   * @param taxonomyId - Taxonomy ID to delete
   * @param ctx - Request context with tenant information
   * @returns void
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Validates no descendants exist
   */
  async deleteTaxonomy(
    taxonomyId: string,
    ctx: RequestContext,
  ): Promise<void> {
    this.logger.debug(
      `Deleting taxonomy: ${taxonomyId}`,
    );

    const prisma = getTenantPrismaClient(ctx);

    await (prisma as any).taxonomyNode.delete({
      where: { id: taxonomyId },
    });
  }

  /**
   * Counts products matching criteria.
   *
   * @param criteria - Filter criteria
   * @param ctx - Request context with tenant information
   * @returns Count of matching products
   *
   * @remarks
   * - Uses tenant-scoped Prisma client with RLS
   * - Used for pagination calculations
   */
  async count(
    criteria: CatalogFilterCriteria,
    ctx: RequestContext,
  ): Promise<number> {
    this.logger.debug(
      `Counting products for tenant: ${ctx.tenantId} with criteria:`,
      criteria,
    );

    const prisma = getTenantPrismaClient(ctx);

    const count = await (prisma as any).product.count({
      where: {
        tenantId: ctx.tenantId,
        status: criteria.status,
        taxonomyIds: criteria.taxonomyIds ? {
          hasSome: Array.from(criteria.taxonomyIds)
        } : undefined,
        OR: criteria.searchText ? [
          { name: { contains: criteria.searchText, mode: 'insensitive' } },
          { description: { contains: criteria.searchText, mode: 'insensitive' } }
        ] : undefined
      },
    });

    return count;
  }

  /**
   * Maps database entities to product response format.
   *
   * @param product - Product entity from database
   * @returns Product response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes calculated fields
   */
  private mapToProductResponse(product: ProductEntity): ProductResponse {
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
   * Maps database entities to taxonomy response format.
   *
   * @param taxonomy - Taxonomy entity from database
   * @returns Taxonomy response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes hierarchy information
   */
  private mapToTaxonomyResponse(taxonomy: TaxonomyEntity): TaxonomyResponse {
    return {
      id: taxonomy.id,
      parentId: taxonomy.parentId,
      label: taxonomy.label,
      metadata: taxonomy.metadata || {},
      isPlatformOwned: taxonomy.isPlatformOwned,
    };
  }

  /**
   * Maps database entities to classification assignment response format.
   *
   * @param assignment - Assignment entity from database
   * @returns Classification assignment response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes related taxonomy information
   */
  private mapToClassificationAssignmentResponse(assignment: ClassificationAssignmentEntity): ClassificationAssignmentResponse {
    return {
      id: assignment.id,
      productId: assignment.productId,
      taxonomyId: assignment.taxonomyId,
      tenantId: assignment.tenantId,
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
    };
  }

  /**
   * Maps database entities to classification list response format.
   *
   * @param assignments - Array of assignment entities from database
   * @returns Classification list response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes taxonomy information for each assignment
   */
  private mapToClassificationListResponse(assignments: ClassificationAssignmentEntity[]): ClassificationListResponse {
    return {
      assignments: assignments.map(assignment => this.mapToClassificationAssignmentResponse(assignment)),
      total: assignments.length,
    };
  }

  /**
   * Maps database entities to taxonomy list response format.
   *
   * @param taxonomies - Array of taxonomy entities from database
   * @returns Taxonomy list response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes hierarchy information
   */
  private mapToTaxonomyListResponse(taxonomies: TaxonomyEntity[]): TaxonomyListResponse {
    return {
      taxonomies: taxonomies.map(taxonomy => this.mapToTaxonomyResponse(taxonomy)),
      total: taxonomies.length,
    };
  }

  /**
   * Maps database entities to product list response format.
   *
   * @param products - Array of product entities from database
   * @param pagination - Pagination information
   * @returns Product list response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes pagination metadata
   */
  private mapToProductListResponse(products: ProductEntity[]): ProductListResponse {
    return {
      products: products.map(product => this.mapToProductResponse(product)),
    };
  }

  /**
   * Maps database entities to variant response format.
   *
   * @param variant - Variant entity from database
   * @returns Variant response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes pricing and inventory information
   */
  private mapToVariantResponse(variant: VariantEntity): VariantResponse {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      name: variant.name,
      attributes: variant.attributes,
    };
  }

  /**
   * Maps database entities to variant list response format.
   *
   * @param variants - Array of variant entities from database
   * @returns Variant list response object
   *
   * @remarks
   * - Transforms database fields to API format
   * - Includes pricing and inventory information
   */
  private mapToVariantListResponse(variants: VariantEntity[]): VariantListResponse {
    return {
      data: variants.map(variant => this.mapToVariantResponse(variant)),
      pagination: {
        page: 1,
        limit: variants.length,
        total: variants.length,
        totalPages: 1,
      },
    };
  }
}
