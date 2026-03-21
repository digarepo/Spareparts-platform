import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Catalog API E2E Tests', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      // Act
      const response = await request(server)
        .get('/health')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Product Endpoints', () => {
    let createdProductId: string;
    const testProduct = {
      name: 'E2E Test Product',
      sku: 'E2E-TEST-001',
      description: 'Product created during E2E testing',
      metadata: {
        test: true,
        source: 'e2e-test',
      },
    };

    it('should create a product', async () => {
      // Act
      const response = await request(server)
        .post('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(testProduct)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testProduct.name);
      expect(response.body.sku).toBe(testProduct.sku);
      expect(response.body.status).toBe('draft');
      expect(response.body.slug).toBe('e2e-test-product');
      createdProductId = response.body.id;
    });

    it('should get the created product', async () => {
      // Act
      const response = await request(server)
        .get(`/catalog/products/${createdProductId}`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body.id).toBe(createdProductId);
      expect(response.body.name).toBe(testProduct.name);
      expect(response.body.sku).toBe(testProduct.sku);
    });

    it('should list products', async () => {
      // Act
      const response = await request(server)
        .get('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should publish the product', async () => {
      // Act
      const response = await request(server)
        .patch(`/catalog/products/${createdProductId}/publish`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body.status).toBe('published');
      expect(response.body.publishedAt).toBeTruthy();
    });

    it('should update the product', async () => {
      const updateData = {
        name: 'Updated E2E Test Product',
        description: 'Updated description',
      };

      // Act
      const response = await request(server)
        .patch(`/catalog/products/${createdProductId}`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });
  });

  describe('Taxonomy Endpoints', () => {
    let createdTaxonomyId: string;
    const testTaxonomy = {
      label: 'E2E Test Category',
      parentId: null,
      metadata: {
        test: true,
        source: 'e2e-test',
      },
    };

    it('should create a taxonomy', async () => {
      // Act
      const response = await request(server)
        .post('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(testTaxonomy)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.label).toBe(testTaxonomy.label);
      expect(response.body.parentId).toBe(testTaxonomy.parentId);
      createdTaxonomyId = response.body.id;
    });

    it('should get the created taxonomy', async () => {
      // Act
      const response = await request(server)
        .get(`/catalog/taxonomies/${createdTaxonomyId}`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body.id).toBe(createdTaxonomyId);
      expect(response.body.label).toBe(testTaxonomy.label);
    });

    it('should list taxonomies', async () => {
      // Act
      const response = await request(server)
        .get('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('taxonomies');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.taxonomies)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should update the taxonomy', async () => {
      const updateData = {
        label: 'Updated E2E Test Category',
        metadata: {
          updated: true,
        },
      };

      // Act
      const response = await request(server)
        .patch(`/catalog/taxonomies/${createdTaxonomyId}`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.label).toBe(updateData.label);
      expect(response.body.metadata).toEqual(updateData.metadata);
    });
  });

  describe('Classification Assignment Endpoints', () => {
    let createdProductId: string;
    let createdTaxonomyId: string;

    beforeAll(async () => {
      // Create a test product for classification tests
      const productResponse = await request(server)
        .post('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          name: 'Classification Test Product',
          sku: 'CLASS-TEST-001',
          description: 'Product for classification testing',
        });

      createdProductId = productResponse.body.id;

      // Create a test taxonomy for classification tests
      const taxonomyResponse = await request(server)
        .post('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          label: 'Classification Test Category',
          parentId: null,
        });

      createdTaxonomyId = taxonomyResponse.body.id;
    });

    it('should assign product to taxonomy', async () => {
      const assignmentData = {
        productId: createdProductId,
        taxonomyId: createdTaxonomyId,
      };

      // Act
      const response = await request(server)
        .post(`/catalog/products/${createdProductId}/classifications`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(assignmentData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(createdProductId);
      expect(response.body.taxonomyId).toBe(createdTaxonomyId);
      expect(response.body.assignedBy).toBe('test-user');
    });

    it('should list product classifications', async () => {
      // Act
      const response = await request(server)
        .get(`/catalog/products/${createdProductId}/classifications`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('assignments');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.assignments)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.assignments[0].productId).toBe(createdProductId);
    });

    it('should unassign product from taxonomy', async () => {
      // Act
      const response = await request(server)
        .delete(`/catalog/products/${createdProductId}/classifications/${createdTaxonomyId}`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Classification assignment removed successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent product', async () => {
      // Act & Assert
      await request(server)
        .get('/catalog/products/non-existent-id')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(404);
    });

    it('should return 404 for non-existent taxonomy', async () => {
      // Act & Assert
      await request(server)
        .get('/catalog/taxonomies/non-existent-id')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(404);
    });

    it('should return 400 for invalid request data', async () => {
      // Act & Assert
      await request(server)
        .post('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          name: '', // Invalid: empty name
          sku: 'TEST-001',
        })
        .expect(400);
    });

    it('should return 401 for missing tenant context', async () => {
      // Act & Assert
      await request(server)
        .get('/catalog/products')
        .expect(401);
    });

    it('should return 409 for duplicate SKU', async () => {
      const productData = {
        name: 'Duplicate SKU Test',
        sku: 'DUPLICATE-001',
        description: 'Test product for duplicate SKU',
      };

      // Create first product
      await request(server)
        .post('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send(productData)
        .expect(201);

      // Try to create second product with same SKU
      await request(server)
        .post('/catalog/products')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          ...productData,
          name: 'Another Product with Same SKU',
        })
        .expect(409);
    });
  });

  describe('Permission Tests', () => {
    it('should allow tenant operators to soft delete taxonomy', async () => {
      // Create a taxonomy first
      const createResponse = await request(server)
        .post('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          label: 'Soft Delete Test Category',
        });

      const taxonomyId = createResponse.body.id;

      // Act
      const response = await request(server)
        .delete(`/catalog/taxonomies/${taxonomyId}/soft`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.deletedAt).toBeTruthy();
    });

    it('should reject non-platform operators from hard delete', async () => {
      // Create a taxonomy first
      const createResponse = await request(server)
        .post('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          label: 'Hard Delete Test Category',
        });

      const taxonomyId = createResponse.body.id;

      // Act & Assert
      await request(server)
        .delete(`/catalog/taxonomies/${taxonomyId}/hard`)
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .expect(403);
    });

    it('should reject platform-owned taxonomy creation by non-platform operators', async () => {
      // Act & Assert
      await request(server)
        .post('/catalog/taxonomies')
        .set('X-Tenant-ID', 'test-tenant')
        .set('X-Actor-Kind', 'tenant')
        .set('X-Actor-User-ID', 'test-user')
        .set('X-Actor-Tenant-ID', 'test-tenant')
        .send({
          label: 'Platform Category',
          isPlatformOwned: true,
        })
        .expect(403);
    });
  });
});
