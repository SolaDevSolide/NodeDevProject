import {Request, Router} from 'express';
import {asyncHandler} from '../middleware/asyncHandler';
import {pool} from '../index';
import {ProductRow} from '../types';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: CRUD for products
 */

export const productRouter = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products (with optional limit & sort)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by product_id ascending or descending
 *     responses:
 *       200:
 *         description: List of products
 */
productRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const {limit, sort} = req.query;
        let queryStr = 'SELECT * FROM products';
        const params: any[] = [];

        // Sorting
        if (sort === 'asc' || sort === 'desc') {
            queryStr += ` ORDER BY product_id ${sort}`;
        }

        // Limit
        if (limit) {
            const l = parseInt(String(limit), 10);
            if (!isNaN(l) && l > 0) {
                queryStr += ' LIMIT $1';
                params.push(l);
            }
        }

        const {rows} = await pool.query(queryStr, params);
        return res.json(rows);
    })
);

/**
 * @swagger
 * /api/products/{product_id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by ID
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The product
 *       404:
 *         description: Not found
 */
productRouter.get(
    '/:product_id',
    asyncHandler(async (req: Request<{ product_id: string }>, res) => {
        const {product_id} = req.params;
        const {rows} = await pool.query(
            'SELECT * FROM products WHERE product_id = $1',
            [product_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({message: 'Product not found'});
        }
        return res.json(rows[0]);
    })
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
productRouter.post(
    '/',
    asyncHandler(async (req: Request<{}, {}, ProductRow>, res) => {
        const {product_id, order_id, category, name, description, price} =
            req.body;

        await pool.query(
            `
                INSERT INTO products (product_id, order_id, category, name, description, price)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [product_id, order_id, category, name, description, price]
        );

        return res.status(201).json({message: 'Product created'});
    })
);

/**
 * @swagger
 * /api/products/{product_id}:
 *   put:
 *     tags: [Products]
 *     summary: Update an existing product
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRow'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Product not found
 */
productRouter.put(
    '/:product_id',
    asyncHandler(async (req: Request<{ product_id: string }, {}, ProductRow>, res) => {
        const {product_id} = req.params;
        const {order_id, category, name, description, price} = req.body;

        const result = await pool.query(
            'UPDATE products SET order_id=$1, category=$2, name=$3, description=$4, price=$5 WHERE product_id=$6',
            [order_id, category, name, description, price, product_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({message: 'Product not found'});
        }
        return res.json({message: 'Product updated'});
    })
);

/**
 * @swagger
 * /api/products/{product_id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product by ID
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: The product was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found
 */
productRouter.delete(
    '/:product_id',
    asyncHandler(async (req: Request<{ product_id: string }>, res) => {
        const {product_id} = req.params;

        const result = await pool.query(
            'DELETE FROM products WHERE product_id = $1',
            [product_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({message: 'Product not found'});
        }

        return res.status(200).json({message: 'Product deleted'});
    })
);