/**
 * Visualization routes: shows combined data of Orders and their related Products
 */
import {Router} from 'express';
import {asyncHandler} from '../middleware/asyncHandler';
import {pool} from '../index';

/**
 * @swagger
 * tags:
 *   name: Visualization
 *   description: Fetch combined data (orders joined with products)
 */

export const visualizationRouter = Router();

/**
 * @swagger
 * /api/visualization/join:
 *   get:
 *     tags: [Visualization]
 *     summary: Get orders and their related products in a single joined structure
 *     responses:
 *       200:
 *         description: Returns an array of orders, each with an array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order_id:
 *                     type: string
 *                   address:
 *                     type: string
 *                   date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product_id:
 *                           type: string
 *                         order_id:
 *                           type: string
 *                         category:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         price:
 *                           type: string
 */
visualizationRouter.get(
    '/join',
    asyncHandler(async (req, res) => {
        // We'll do a LEFT JOIN on orders->products
        // then aggregate products for each order with JSON_AGG
        // Example: SELECT o.*, JSON_AGG(p.*) AS products
        //          FROM orders o LEFT JOIN products p ON o.order_id = p.order_id
        //          GROUP BY o.order_id;

        const query = `
            SELECT o.order_id,
                   o.address,
                   o.date,
                   o.status,
                   COALESCE(JSON_AGG(
                            JSON_BUILD_OBJECT(
                                    'product_id', p.product_id,
                                    'order_id', p.order_id,
                                    'category', p.category,
                                    'name', p.name,
                                    'description', p.description,
                                    'price', p.price
                            )
                                    ) FILTER (WHERE p.product_id IS NOT NULL), '[]') AS products
            FROM orders o
                     LEFT JOIN products p ON o.order_id = p.order_id
            GROUP BY o.order_id
            ORDER BY o.order_id;
        `;

        const {rows} = await pool.query(query);

        // rows will be an array of { order_id, address, date, status, products: [...] }
        return res.status(200).json(rows);
    })
);