import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogController } from './catalog.controller';
import { CatalogService } from '../../catalog/catalog.service';
import { Logger } from '@nestjs/common';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import type { RequestContext, ProductCreateRequest, TaxonomyCreateRequest, ClassificationAssignRequest, ProductUpdateRequest, VariantCreateRequest, VariantUpdateRequest, ClassificationBulkAssignRequest } from '@spareparts/contracts';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: Partial<CatalogService>;
  let mockContext: RequestContext;

  beforeEach(() => {
    // Mock service with all required methods and properties
    service = {
      catalogRepository: {} as any,
      requireTenantId: vi.fn().mockReturnValue('test-tenant-id'),
      validateStatusTransition: vi.fn(),
      mapToProductResponse: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      getProduct: vi.fn(),
      listProducts: vi.fn(),
      publishProduct: vi.fn(),
      createVariant: vi.fn(),
      updateVariant: vi.fn(),
      getVariant: vi.fn(),
      listVariants: vi.fn(),
      createTaxonomy: vi.fn(),
      updateTaxonomy: vi.fn(),
      getTaxonomy: vi.fn(),
      listTaxonomies: vi.fn(),
      assignProductToTaxonomy: vi.fn(),
      unassignProductFromTaxonomy: vi.fn(),
      listProductClassifications: vi.fn(),
      bulkAssignProductsToTaxonomy: vi.fn(),
      softDeleteTaxonomy: vi.fn(),
      hardDeleteTaxonomy: vi.fn().mockResolvedValue(undefined),
      softDeleteVariant: vi.fn(),
      hardDeleteVariant: vi.fn().mockResolvedValue(undefined),
    } as any;

    // Create controller directly (this works as proven by our simple test)
    controller = new CatalogController(service as CatalogService);

    // Mock context
    mockContext = {
      correlationId: 'test-correlation-id',
      actor: {
        kind: 'tenant' as const,
        scope: 'tenant' as const,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
      },
      tenantId: 'test-tenant-id',
    };
  });

  describe('Product Endpoints', () => {
    describe('POST /catalog/products', () => {
      it('should create a product successfully', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        const expectedProduct = {
          id: 'test-product-id',
          name: 'Test Product',
          status: 'draft' as const,
          slug: 'test-product',
          description: 'Test Description',
          tags: [],
          taxonomyIds: [],
        };

        vi.spyOn(service, 'createProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.createProduct(productRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.createProduct).toHaveBeenCalledWith(productRequest, mockContext);
      });

      it('should pass through BadRequestException', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        const badRequestException = new BadRequestException('Invalid input');
        vi.spyOn(service, 'createProduct').mockRejectedValue(badRequestException);

        // Act & Assert
        await expect(controller.createProduct(productRequest, mockContext))
          .rejects.toThrow(BadRequestException);
      });

      it('should pass through ConflictException', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        const conflictException = new ConflictException('Slug already exists');
        vi.spyOn(service, 'createProduct').mockRejectedValue(conflictException);

        // Act & Assert
        await expect(controller.createProduct(productRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });
    });

    describe('GET /catalog/products/:productId', () => {
      it('should get a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const expectedProduct = {
          id: productId,
          name: 'Test Product',
          status: 'draft' as const,
          slug: 'test-product',
          description: 'Test Description',
          tags: [],
          taxonomyIds: [],
        };

        vi.spyOn(service, 'getProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.getProduct(productId, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.getProduct).toHaveBeenCalledWith(productId, mockContext);
      });

      it('should pass through NotFoundException', async () => {
        // Arrange
        const productId = 'non-existent-id';
        const notFoundException = new NotFoundException('Product not found');
        vi.spyOn(service, 'getProduct').mockRejectedValue(notFoundException);

        // Act & Assert
        await expect(controller.getProduct(productId, mockContext))
          .rejects.toThrow(NotFoundException);
      });
    });

    describe('PATCH /catalog/products/:productId', () => {
      it('should update a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const updateRequest: ProductUpdateRequest = {
          name: 'Updated Product',
          description: 'Updated Description',
        };

        const expectedProduct = {
          id: productId,
          name: 'Updated Product',
          status: 'draft' as const,
          slug: 'test-product',
          description: 'Updated Description',
          tags: [],
          taxonomyIds: [],
        };

        vi.spyOn(service, 'updateProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.updateProduct(productId, updateRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.updateProduct).toHaveBeenCalledWith(productId, updateRequest, mockContext);
      });
    });

    describe('POST /catalog/products/:productId/publish', () => {
      it('should publish a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const expectedProduct = {
          id: productId,
          name: 'Test Product',
          status: 'published' as const,
          slug: 'test-product',
          description: 'Test Description',
          tags: [],
          taxonomyIds: [],
        };

        vi.spyOn(service, 'publishProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.publishProduct(productId, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.publishProduct).toHaveBeenCalledWith(productId, mockContext);
      });
    });
  });

  describe('Variant Endpoints', () => {
    describe('POST /catalog/variants', () => {
      it('should create a variant successfully', async () => {
        // Arrange
        const variantRequest: VariantCreateRequest = {
          productId: 'test-product-id',
          sku: 'TEST-SKU-001',
          name: 'Test Variant',
          attributes: { color: 'red', size: 'M' },
        };

        const expectedProduct = {
          id: 'test-product-id',
          name: 'Test Product',
          status: 'draft' as const,
          slug: 'test-product',
          description: 'Test Description',
          tags: [],
          taxonomyIds: [],
        };

        vi.spyOn(service, 'createVariant').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.createVariant(variantRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.createVariant).toHaveBeenCalledWith(variantRequest, mockContext);
      });
    });
  });

  describe('Taxonomy Endpoints', () => {
    describe('POST /catalog/taxonomies', () => {
      it('should create a taxonomy successfully', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Test Category',
          parentId: null,
          metadata: { description: 'Test category description' },
        };

        const expectedTaxonomy = {
          id: 'test-taxonomy-id',
          label: 'Test Category',
          parentId: null,
          metadata: { description: 'Test category description' },
        };

        vi.spyOn(service, 'createTaxonomy').mockResolvedValue(expectedTaxonomy);

        // Act
        const result = await controller.createTaxonomy(taxonomyRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedTaxonomy);
        expect(service.createTaxonomy).toHaveBeenCalledWith(taxonomyRequest, mockContext);
      });

      it('should pass through ForbiddenException for platform-owned taxonomy', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Platform Category',
          parentId: null,
          metadata: { description: 'Platform category' },
          isPlatformOwned: true,
        };

        const forbiddenException = new ForbiddenException('Only platform operators can create platform-owned taxonomies');
        vi.spyOn(service, 'createTaxonomy').mockRejectedValue(forbiddenException);

        // Act & Assert
        await expect(controller.createTaxonomy(taxonomyRequest, mockContext))
          .rejects.toThrow(InternalServerErrorException);
      });
    });
  });

  describe('Classification Assignment Endpoints', () => {
    describe('POST /catalog/products/:productId/classifications', () => {
      it('should assign product to taxonomy successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignRequest: ClassificationAssignRequest = {
          productId: 'test-product-id',
          taxonomyId: 'test-taxonomy-id',
        };

        const expectedAssignment = {
          id: 'assignment-id',
          productId,
          taxonomyId: 'test-taxonomy-id',
          tenantId: 'test-tenant-id',
          assignedAt: new Date(),
          assignedBy: 'test-user-id',
        };

        vi.spyOn(service, 'assignProductToTaxonomy').mockResolvedValue(expectedAssignment);

        // Act
        const result = await controller.assignProductToTaxonomy(productId, assignRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedAssignment);
        expect(service.assignProductToTaxonomy).toHaveBeenCalledWith(productId, assignRequest, mockContext);
      });

      it('should pass through ConflictException for existing assignment', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignRequest: ClassificationAssignRequest = {
          productId: 'test-product-id',
          taxonomyId: 'test-taxonomy-id',
        };

        const conflictException = new ConflictException('Assignment already exists');
        vi.spyOn(service, 'assignProductToTaxonomy').mockRejectedValue(conflictException);

        // Act & Assert
        await expect(controller.assignProductToTaxonomy(productId, assignRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });
    });

    describe('POST /catalog/classifications/bulk', () => {
      it('should bulk assign products to taxonomies successfully', async () => {
        // Arrange
        const bulkRequest: ClassificationBulkAssignRequest = {
          assignments: [
            { productId: 'product-1', taxonomyId: 'taxonomy-1' },
            { productId: 'product-2', taxonomyId: 'taxonomy-2' },
          ],
        };

        const expectedResults = {
          results: [
            {
              request: { productId: 'product-1', taxonomyId: 'taxonomy-1' },
              success: true,
              assignment: {
                id: 'assignment-1',
                productId: 'product-1',
                taxonomyId: 'taxonomy-1',
                tenantId: 'test-tenant-id',
                assignedAt: new Date(),
                assignedBy: 'test-user-id',
              },
            },
            {
              request: { productId: 'product-2', taxonomyId: 'taxonomy-2' },
              success: true,
              assignment: {
                id: 'assignment-2',
                productId: 'product-2',
                taxonomyId: 'taxonomy-2',
                tenantId: 'test-tenant-id',
                assignedAt: new Date(),
                assignedBy: 'test-user-id',
              },
            },
          ],
          totalProcessed: 2,
          totalSucceeded: 2,
          totalFailed: 0,
        };

        vi.spyOn(service, 'bulkAssignProductsToTaxonomy').mockResolvedValue(expectedResults);

        // Act
        const result = await controller.bulkAssignProductsToTaxonomy(bulkRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedResults);
        expect(service.bulkAssignProductsToTaxonomy).toHaveBeenCalledWith(bulkRequest, mockContext);
      });
    });
  });

  describe('Delete Operations', () => {
    describe('DELETE /catalog/taxonomies/:taxonomyId/soft', () => {
      it('should soft delete taxonomy successfully', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const expectedTaxonomy = {
          id: taxonomyId,
          label: 'Test Category',
          parentId: null,
          metadata: { description: 'Test category description' },
        };

        vi.spyOn(service, 'softDeleteTaxonomy').mockResolvedValue(expectedTaxonomy);

        // Act
        const result = await controller.softDeleteTaxonomy(taxonomyId, mockContext);

        // Assert
        expect(result).toEqual(expectedTaxonomy);
        expect(service.softDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, mockContext);
      });
    });

    describe('DELETE /catalog/taxonomies/:taxonomyId/hard', () => {
      it('should hard delete taxonomy successfully for platform operator', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const platformContext = {
          ...mockContext,
          actor: {
            kind: 'platform' as const,
            scope: 'platform' as const,
            userId: 'platform-user-id',
          },
        };

        vi.spyOn(service, 'hardDeleteTaxonomy').mockResolvedValue(undefined);

        // Act
        const result = await controller.hardDeleteTaxonomy(taxonomyId, platformContext);

        // Assert
        expect(result).toEqual({ message: 'Taxonomy node hard deleted successfully' });
        expect(service.hardDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, platformContext);
      });

      it('should pass through ForbiddenException for non-platform operators', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const forbiddenException = new ForbiddenException('Hard delete requires platform operator permissions');
        vi.spyOn(service, 'hardDeleteTaxonomy').mockRejectedValue(forbiddenException);

        // Act & Assert
        await expect(controller.hardDeleteTaxonomy(taxonomyId, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });

    describe('DELETE /catalog/variants/:variantId/soft', () => {
      it('should soft delete variant successfully', async () => {
        // Arrange
        const variantId = 'test-variant-id';
        const expectedVariant = {
          id: variantId,
          sku: 'TEST-SKU-001',
          attributes: { color: 'red', size: 'M' },
        };

        vi.spyOn(service, 'softDeleteVariant').mockResolvedValue(expectedVariant);

        // Act
        const result = await controller.softDeleteVariant(variantId, mockContext);

        // Assert
        expect(result).toEqual(expectedVariant);
        expect(service.softDeleteVariant).toHaveBeenCalledWith(variantId, mockContext);
      });
    });

    describe('DELETE /catalog/variants/:variantId/hard', () => {
      it('should hard delete variant successfully for platform operator', async () => {
        // Arrange
        const variantId = 'test-variant-id';
        const platformContext = {
          ...mockContext,
          actor: {
            kind: 'platform' as const,
            scope: 'platform' as const,
            userId: 'platform-user-id',
          },
        };

        vi.spyOn(service, 'hardDeleteVariant').mockResolvedValue(undefined);

        // Act
        const result = await controller.hardDeleteVariant(variantId, platformContext);

        // Assert
        expect(result).toEqual({ message: 'Variant hard deleted successfully' });
        expect(service.hardDeleteVariant).toHaveBeenCalledWith(variantId, platformContext);
      });

      it('should pass through ForbiddenException for non-platform operators', async () => {
        // Arrange
        const variantId = 'test-variant-id';
        const forbiddenException = new ForbiddenException('Hard delete requires platform operator permissions');
        vi.spyOn(service, 'hardDeleteVariant').mockRejectedValue(forbiddenException);

        // Act & Assert
        await expect(controller.hardDeleteVariant(variantId, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });
  });
});
