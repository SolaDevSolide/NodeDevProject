import {Request, Response, Router} from 'express';
import {asyncHandler} from '../middleware/asyncHandler';
import {pool} from '../index';
import {OrderRow} from '../types';
import {QueryResult} from "pg";

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: CRUD for orders
 */
export const orderRouter = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (with optional limit & sort)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of orders
 */
orderRouter.get(
    '/',
    asyncHandler(async (req: Request<{}, {}, {}, {
        limit?: string;
        sort?: 'asc' | 'desc'
    }>, res: Response<OrderRow[]>) => {
        const {limit, sort}: { limit?: string; sort?: "asc" | "desc" } = req.query;
        let queryStr: string = 'SELECT * FROM orders';
        const params: number[] = [];

        if (sort === 'asc' || sort === 'desc') {
            queryStr += ` ORDER BY order_id ${sort}`;
        }

        if (limit) {
            const l: number = parseInt(String(limit), 10);
            if (!isNaN(l) && l > 0) {
                queryStr += ' LIMIT $1';
                params.push(l);
            }
        }

        const {rows}: QueryResult<OrderRow> = await pool.query(queryStr, params);
        return res.json(rows);
    })
);

/**
 * @swagger
 * /api/orders/{order_id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a single order by ID
 */
orderRouter.get(
    '/:order_id',
    asyncHandler(async (req: Request<{ order_id: string }>, res: Response<OrderRow | { message: string }>) => {
        const {order_id}: { order_id: string } = req.params;
        const {rows}: QueryResult<OrderRow> = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [order_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({message: 'Order not found'});
        }
        return res.json(rows[0]);
    })
);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 */
orderRouter.post(
    '/',
    asyncHandler(async (req: Request<{}, {}, OrderRow>, res: Response<{ message: string }>) => {
        const {order_id, address, date, status}: OrderRow = req.body;

        await pool.query(
            `
                INSERT INTO orders (order_id, address, date, status)
                VALUES ($1, $2, $3, $4)
            `,
            [order_id, address, date, status]
        );

        return res.status(201).json({message: 'Order created'});
    })
);

/**
 * @swagger
 * /api/orders/{order_id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update an existing order
 */
orderRouter.put(
    '/:order_id',
    asyncHandler(async (req: Request<{ order_id: string }, {}, OrderRow>, res: Response<{ message: string }>) => {
        const {order_id}: { order_id: string } = req.params;
        const {address, date, status}: OrderRow = req.body;

        const result: QueryResult<OrderRow> = await pool.query(
            `
                UPDATE orders
                SET address = $1,
                    date = $2,
                    status = $3
                WHERE order_id = $4
            `,
            [address, date, status, order_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({message: 'Order not found'});
        }
        return res.json({message: 'Order updated'});
    })
);