import {pool} from '../index';

describe('Database Basic Tests', () => {
    afterAll(async () => {
        await pool.end();  // <-- ensures no open DB handles
    });
    it('should use the correct port', () => {
        const port = process.env.DB_PORT || '5432';
        expect(port).toBe('5432'); // or compare to a known value
    });

    it('should connect to the database', async () => {
        const client = await pool.connect();
        expect(client).toBeDefined();
        client.release();
    });

    it('should have the orders and products tables', async () => {
        const ordersCheck = await pool.query(`
      SELECT to_regclass('public.orders') as exists
    `);
        expect(ordersCheck.rows[0].exists).toBe('orders');

        const productsCheck = await pool.query(`
      SELECT to_regclass('public.products') as exists
    `);
        expect(productsCheck.rows[0].exists).toBe('products');
    });

    it('should allow basic SQL operations', async () => {
        // e.g., insert a simple row into orders (temporary usage)
        await pool.query(`
            INSERT INTO orders (order_id, address, date, status)
            VALUES ('test-123', '123 Test St', '2024-01-01', 'NEW')
            ON CONFLICT (order_id) DO NOTHING
        `);

        const {rows} = await pool.query(`
            SELECT *
            FROM orders
            WHERE order_id = 'test-123'
        `);
        expect(rows.length).toBe(1);

        // Cleanup
        await pool.query(`
            DELETE
            FROM orders
            WHERE order_id = 'test-123'
        `);
    });
});