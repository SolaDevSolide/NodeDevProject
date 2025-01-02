/**
 * Table management routes (dropping tables).
 */
import {Request, Router} from 'express';
import {asyncHandler} from '../middleware/asyncHandler';
import {pool} from '../index';
import {TableType} from '../types';

/**
 * Swagger tags:
 *  - name: Table
 *    description: API for table operations
 */

interface TableRequest extends Request {
    params: {
        tableName: string;
    };
}

export const tableRouter = Router();

/**
 * @swagger
 * /api/table/{tableName}:
 *   delete:
 *     tags: [Table]
 *     summary: Drop a table
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         type: string
 *         enum: [orders, products]
 *     responses:
 *       200:
 *         description: Table dropped
 *       400:
 *         description: Invalid table name
 */
tableRouter.delete(
    '/:tableName',
    asyncHandler(async (req: TableRequest, res) => {
        const {tableName} = req.params;

        if (tableName !== TableType.Orders && tableName !== TableType.Products) {
            return res.status(400).json({message: 'Invalid table name'});
        }

        await pool.query(`DROP TABLE IF EXISTS ${tableName};`);
        return res.status(200).json({message: `Table '${tableName}' dropped`});
    })
);