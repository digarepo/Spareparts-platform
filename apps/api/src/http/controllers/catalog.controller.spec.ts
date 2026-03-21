import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from '../../catalog/catalog.service';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { RequestContext, ProductCreateRequest, TaxonomyCreateRequest, ClassificationAssignRequest } from '@spareparts/contracts';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: CatalogService;
  let mockContext: RequestContext;

  beforeEach(async () => {
    // Mock service
    service = {
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      getProduct: vi.fn(),
      listProducts: vi.fn(),
      publishProduct: vi.fn(),
      unpublishProduct: vi.fn(),
      createVariant: vi.fn(),
      updateVariant: vi.fn(),
      getVariant: vi.fn(),
      listVariants: vi.fn(),
      deleteVariant: vi.fn(),
      softDeleteVariant: vi.fn(),
      hardDeleteVariant: vi.fn(),
      createTaxonomy: vi.fn(),
      updateTaxonomy: vi.fn(),
      getTaxonomy: vi.fn(),
      listTaxonomies: vi.fn(),
      assignProductToTaxonomy: vi.fn(),
      unassignProductFromTaxonomy: vi.fn(),
      listProductClassifications: vi.fn(),
      bulkAssignProductsToTaxonomy: vi.fn(),
      softDeleteTaxonomy: vi.fn(),
      hardDeleteTaxonomy: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);

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
          tenantId: 'test-tenant-id',
        };

        vi.spyOn(service, 'createProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.createProduct(productRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.createProduct).toHaveBeenCalledWith(productRequest, mockContext);
      });

      it('should handle ConflictException from service', async () => {
        // Arrange
        const productRequest: ProductCreateRequest = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          status: 'draft',
        };

        vi.spyOn(service, 'createProduct').mockRejectedValue(new ConflictException('Slug already exists'));

        // Act & Assert
        await expect(controller.createProduct(productRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });
    });

    describe('GET /catalog/products/:id', () => {
      it('should get a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const expectedProduct = {
          id: productId,
          name: 'Test Product',
          status: 'draft' as const,
          slug: 'test-product',
          tenantId: 'test-tenant-id',
        };

        vi.spyOn(service, 'getProduct').mockResolvedValue(expectedProduct);

        // Act
        const result = await controller.getProduct(productId, mockContext);

        // Assert
        expect(result).toEqual(expectedProduct);
        expect(service.getProduct).toHaveBeenCalledWith(productId, mockContext);
      });

      it('should handle NotFoundException from service', async () => {
        // Arrange
        const productId = 'non-existent-product-id';

        vi.spyOn(service, 'getProduct').mockRejectedValue(new NotFoundException('Product not found'));

        // Act & Assert
        await expect(controller.getProduct(productId, mockContext))
          .rejects.toThrow(NotFoundException);
      });
    });

    describe('PATCH /catalog/products/:id/publish', () => {
      it('should publish a product successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const expectedProduct = {
          id: productId,
          name: 'Test Product',
          status: 'published' as const,
          slug: 'test-product',
          tenantId: 'test-tenant-id',
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

  describe('Taxonomy Endpoints', () => {
    describe('POST /catalog/taxonomies', () => {
      it('should create taxonomy successfully', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Test Category',
          parentId: null,
          metadata: {},
        };

        const expectedTaxonomy = {
          id: 'test-taxonomy-id',
          label: 'Test Category',
          parentId: null,
          metadata: {},
          tenantId: 'test-tenant-id',
        };

        vi.spyOn(service, 'createTaxonomy').mockResolvedValue(expectedTaxonomy);

        // Act
        const result = await controller.createTaxonomy(taxonomyRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedTaxonomy);
        expect(service.createTaxonomy).toHaveBeenCalledWith(taxonomyRequest, mockContext);
      });

      it('should handle ForbiddenException for platform-owned taxonomy', async () => {
        // Arrange
        const taxonomyRequest: TaxonomyCreateRequest = {
          label: 'Platform Category',
          parentId: null,
          isPlatformOwned: true,
        };

        vi.spyOn(service, 'createTaxonomy').mockRejectedValue(new ForbiddenException('Platform operators only'));

        // Act & Assert
        await expect(controller.createTaxonomy(taxonomyRequest, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });

    describe('DELETE /catalog/taxonomies/:id/soft', () => {
      it('should soft delete taxonomy successfully', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const expectedTaxonomy = {
          id: taxonomyId,
          label: 'Test Category',
          parentId: null,
          metadata: {},
          deletedAt: new Date(),
        };

        vi.spyOn(service, 'softDeleteTaxonomy').mockResolvedValue(expectedTaxonomy);

        // Act
        const result = await controller.softDeleteTaxonomy(taxonomyId, mockContext);

        // Assert
        expect(result).toEqual(expectedTaxonomy);
        expect(service.softDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, mockContext);
      });
    });

    describe('DELETE /catalog/taxonomies/:id/hard', () => {
      it('should hard delete taxonomy successfully for platform operator', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';
        const platformContext = {
          ...mockContext,
          actor: {
            kind: 'platform' as const,
            scope: 'platform' as const,
            userId: 'platform-operator-id',
          },
        };

        vi.spyOn(service, 'hardDeleteTaxonomy').mockResolvedValue();

        // Act
        const result = await controller.hardDeleteTaxonomy(taxonomyId, platformContext);

        // Assert
        expect(result).toEqual({ message: 'Taxonomy node hard deleted successfully' });
        expect(service.hardDeleteTaxonomy).toHaveBeenCalledWith(taxonomyId, platformContext);
      });

      it('should handle ForbiddenException for non-platform operators', async () => {
        // Arrange
        const taxonomyId = 'test-taxonomy-id';

        // Act & Assert
        await expect(controller.hardDeleteTaxonomy(taxonomyId, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Classification Assignment Endpoints', () => {
    describe('POST /catalog/products/:productId/classifications', () => {
      it('should assign product to taxonomy successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignmentRequest: ClassificationAssignRequest = {
          productId,
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
        const result = await controller.assignProductToTaxonomy(productId, assignmentRequest, mockContext);

        // Assert
        expect(result).toEqual(expectedAssignment);
        expect(service.assignProductToTaxonomy).toHaveBeenCalledWith(productId, assignmentRequest, mockContext);
      });

      it('should handle ConflictException for existing assignment', async () => {
        // Arrange
        const productId = 'test-product-id';
        const assignmentRequest: ClassificationAssignRequest = {
          productId,
          taxonomyId: 'test-taxonomy-id',
        };

        vi.spyOn(service, 'assignProductToTaxonomy').mockRejectedValue(new ConflictException('Assignment already exists'));

        // Act & Assert
        await expect(controller.assignProductToTaxonomy(productId, assignmentRequest, mockContext))
          .rejects.toThrow(ConflictException);
      });
    });

    describe('DELETE /catalog/products/:productId/classifications/:taxonomyId', () => {
      it('should unassign product from taxonomy successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const taxonomyId = 'test-taxonomy-id';

        vi.spyOn(service, 'unassignProductFromTaxonomy').mockResolvedValue();

        // Act
        const result = await controller.unassignProductFromTaxonomy(productId, taxonomyId, mockContext);

        // Assert
        expect(result).toEqual({ message: 'Classification assignment removed successfully' });
        expect(service.unassignProductFromTaxonomy).toHaveBeenCalledWith(productId, taxonomyId, mockContext);
      });

      it('should handle NotFoundException for non-existent assignment', async () => {
        // Arrange
        const productId = 'test-product-id';
        const taxonomyId = 'test-taxonomy-id';

        vi.spyOn(service, 'unassignProductFromTaxonomy').mockRejectedValue(new NotFoundException('Assignment not found'));

        // Act & Assert
        await expect(controller.unassignProductFromTaxonomy(productId, taxonomyId, mockContext))
          .rejects.toThrow(NotFoundException);
      });
    });

    describe('GET /catalog/products/:productId/classifications', () => {
      it('should list product classifications successfully', async () => {
        // Arrange
        const productId = 'test-product-id';
        const expectedClassifications = {
          assignments: [
            {
              id: 'assignment-id',
              productId,
              taxonomyId: 'test-taxonomy-id',
              tenantId: 'test-tenant-id',
              assignedAt: new Date(),
              assignedBy: 'test-user-id',
            },
          ],
          total: 1,
        };

        vi.spyOn(service, 'listProductClassifications').mockResolvedValue(expectedClassifications);

        // Act
        const result = await controller.listProductClassifications(productId, mockContext);

        // Assert
        expect(result).toEqual(expectedClassifications);
        expect(service.listProductClassifications).toHaveBeenCalledWith(productId, mockContext);
      });
    });

    describe('POST /catalog/classifications/bulk', () => {
      it('should bulk assign products to taxonomies successfully', async () => {
        // Arrange
        const bulkRequest = {
          assignments: [
            {
              productId: 'product-1',
              taxonomyId: 'taxonomy-1',
            },
            {
              productId: 'product-2',
              taxonomyId: 'taxonomy-2',
            },
          ],
        };

        const expectedResults = {
          results: [
            {
              request: bulkRequest.assignments[0],
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
              request: bulkRequest.assignments[1],
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

  describe('Variant Endpoints', () => {
    describe('DELETE /catalog/variants/:id/soft', () => {
      it('should soft delete variant successfully', async () => {
        // Arrange
        const variantId = 'test-variant-id';
        const expectedVariant = {
          id: variantId,
          sku: 'TEST-VARIANT-001',
          deletedAt: new Date(),
        };

        vi.spyOn(service, 'softDeleteVariant').mockResolvedValue(expectedVariant);

        // Act
        const result = await controller.softDeleteVariant(variantId, mockContext);

        // Assert
        expect(result).toEqual(expectedVariant);
        expect(service.softDeleteVariant).toHaveBeenCalledWith(variantId, mockContext);
      });
    });

    describe('DELETE /catalog/variants/:id/hard', () => {
      it('should hard delete variant successfully for platform operator', async () => {
        // Arrange
        const variantId = 'test-variant-id';
        const platformContext = {
          ...mockContext,
          actor: {
            kind: 'platform' as const,
            scope: 'platform' as const,
            userId: 'platform-operator-id',
          },
        };

        vi.spyOn(service, 'hardDeleteVariant').mockResolvedValue();

        // Act
        const result = await controller.hardDeleteVariant(variantId, platformContext);

        // Assert
        expect(result).toEqual({ message: 'Variant hard deleted successfully' });
        expect(service.hardDeleteVariant).toHaveBeenCalledWith(variantId, platformContext);
      });

      it('should handle ForbiddenException for non-platform operators', async () => {
        // Arrange
        const variantId = 'test-variant-id';

        // Act & Assert
        await expect(controller.hardDeleteVariant(variantId, mockContext))
          .rejects.toThrow(ForbiddenException);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const productRequest: ProductCreateRequest = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        status: 'draft',
      };

      vi.spyOn(service, 'createProduct').mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(controller.createProduct(productRequest, mockContext))
        .rejects.toThrow('Failed to create product due to internal error');
    });

    it('should pass through known exceptions', async () => {
      // Arrange
      const productRequest: ProductCreateRequest = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        status: 'draft',
      };

      vi.spyOn(service, 'createProduct').mockRejectedValue(new BadRequestException('Invalid input'));

      // Act & Assert
      await expect(controller.createProduct(productRequest, mockContext))
        .rejects.toThrow(BadRequestException);
    });
  });
});
