import request from 'supertest';
import {app, pool} from '../index';

describe('Product CRUD', () => {
    afterAll(async () => {
        await pool.end();  // <-- ensures no open DB handles
    });

    it('should create a product', async () => {
        const response = await request(app)
            .post('/api/products')
            .send({
                product_id: 'test-prod-1',
                order_id: 'order-111',
                category: 'Electronics',
                name: 'Test Phone',
                description: 'A phone for testing',
                price: '500'
            });
        expect(response.status).toBe(201);
    });

    it('should retrieve the product', async () => {
        const response = await request(app).get('/api/products/test-prod-1');
        expect(response.status).toBe(200);
        expect(response.body.product_id).toBe('test-prod-1');
    });

    it('should update the product', async () => {
        const response = await request(app)
            .put('/api/products/test-prod-1')
            .send({
                order_id: 'order-111',
                category: 'Phones',
                name: 'Test Phone Updated',
                description: 'Updated phone desc',
                price: '600'
            });
        expect(response.status).toBe(200);

        // Verify changes
        const getResp = await request(app).get('/api/products/test-prod-1');
        expect(getResp.body.name).toBe('Test Phone Updated');
        expect(getResp.body.price).toBe('600');
    });

    it('should delete the product', async () => {
        // Delete the product
        const deleteResponse = await request(app).delete('/api/products/test-prod-1');
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe('Product deleted');

        // Verify the product no longer exists
        const getResp = await request(app).get('/api/products/test-prod-1');
        expect(getResp.status).toBe(404);
        expect(getResp.body.message).toBe('Product not found');
    });
});