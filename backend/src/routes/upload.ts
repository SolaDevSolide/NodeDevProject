/**
 * Upload and validation routes (orders / products).
 */
import {Router} from 'express';
import {parse, parse as csvParse} from 'csv-parse';
import fs from 'fs';
import path from 'path';

import multer from 'multer';
import {asyncMulterHandler} from '../middleware/asyncMulterHandler';
import {MulterRequest} from '../middleware/MulterRequest';
import {pool} from '../index';
import {
    CSVRow,
    FileTableMap,
    isOrderRow,
    isProductRow,
    OrderRow,
    ProductRow,
    TableType,
    ValidationResult
} from '../types';

/**
 * Swagger tags:
 *  - name: Upload
 *    description: API for uploading and validating CSV files
 */

const upload = multer({dest: 'tmp/'});
export const uploadRouter = Router();
// Expected columns
const ORDER_COLUMNS = ['order_id', 'address', 'date', 'status'];
const PRODUCT_COLUMNS = ['product_id', 'order_id', 'category', 'name', 'description', 'price'];

/**
 * @swagger
 * /api/upload/validate:
 *   post:
 *     tags: [Upload]
 *     summary: Validate multiple CSV files
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: files
 *         type: file
 *         description: CSV files
 *         required: true
 *     responses:
 *       200:
 *         description: Validation results
 */
uploadRouter.post(
    '/validate',
    upload.array('files'),
    asyncMulterHandler(async (req: MulterRequest, res) => {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({message: 'No files uploaded'});
        }

        const results: ValidationResult[] = [];

        console.log(`Validating ${req.files}`)

        for (const file of req.files) {
            const filePath = path.join(__dirname, '../../', file.path);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            console.log(filePath)

            // Parse only the first row to detect columns
            const [headers] = await new Promise<string[][]>((resolve, reject) => {
                const output: string[][] = [];
                parse(fileContent, {
                    delimiter: ',',
                    trim: true,
                    columns: false,
                    to_line: 1,  // <-- Stop after reading line 1
                })
                    .on('data', function (row: string[]) {
                        output.push(row);
                    })
                    .on('end', () => resolve(output))
                    .on('error', (err) => reject(err));
            });

            let tableType = TableType.Unknown;

            const lowerHeaders = headers.map((h) => h.toLowerCase()).sort();
            const orderCols = [...ORDER_COLUMNS].map((c) => c.toLowerCase()).sort();
            const productCols = [...PRODUCT_COLUMNS].map((c) => c.toLowerCase()).sort();
            console.log("Checks:", lowerHeaders, orderCols, productCols)
            if (
                lowerHeaders.length === ORDER_COLUMNS.length &&
                lowerHeaders.every((val, i) => val === orderCols[i])
            ) {
                tableType = TableType.Orders;
            } else if (
                lowerHeaders.length === PRODUCT_COLUMNS.length &&
                lowerHeaders.every((val, i) => val === productCols[i])
            ) {
                tableType = TableType.Products;
            }

            results.push({
                originalName: file.originalname,
                filename: file.filename,
                tableType,
            });

            fs.unlinkSync(filePath); // cleanup
        }

        return res.status(200).json({results});
    })
);

/**
 * @swagger
 * /api/upload/insert:
 *   post:
 *     tags: [Upload]
 *     summary: Insert CSV data into DB
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: files
 *         type: file
 *         description: CSV files
 *         required: true
 *       - in: formData
 *         name: filesTableMap
 *         type: string
 *         description: JSON specifying the table mapping
 *         required: true
 *     responses:
 *       200:
 *         description: Insert result
 */
uploadRouter.post(
    '/insert',
    upload.array('files'),
    asyncMulterHandler(async (req: MulterRequest, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({message: 'No files provided'});
        }

        const rawMap = req.body.filesTableMap;
        if (!rawMap) {
            return res.status(400).json({message: 'No table map provided'});
        }

        let filesTableMap: FileTableMap[];
        try {
            filesTableMap = JSON.parse(rawMap) as FileTableMap[];
        } catch (err) {
            return res.status(400).json({message: 'Invalid JSON for filesTableMap'});
        }

        const insertedResults: Array<{
            filename: string;
            table: string;
            rowCount: number;
        }> = [];

        // Loop each file
        for (const file of req.files) {
            const {filename} = file;
            const mappedItem = filesTableMap.find((m) => m.filename === filename);
            if (!mappedItem || mappedItem.tableType === TableType.Unknown) {
                continue; // skip unknown
            }

            const filePath = path.join(__dirname, '../../', file.path);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Parse entire CSV as "CSVRow" objects
            const rawRecords: CSVRow[] = [];
            await new Promise<void>((resolve, reject) => {
                csvParse(fileContent, {
                    delimiter: ',',
                    columns: true,
                    trim: true,
                })
                    .on('data', (row: CSVRow) => rawRecords.push(row))
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
            });

            let rowCount = 0;

            if (mappedItem.tableType === TableType.Orders) {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS orders
                    (
                        order_id TEXT PRIMARY KEY,
                        address  TEXT,
                        date     TEXT,
                        status   TEXT
                    )
                `);

                // MAP + FILTER for OrderRow
                const orderRows: OrderRow[] = rawRecords.map((r, index) => {
                    // If it’s not valid, return null
                    if (!isOrderRow(r)) {
                        console.warn(`Skipping invalid order row #${index}`, r);
                        return null;
                    }
                    return r;
                })
                    .filter((r): r is OrderRow => r !== null);

                for (const row of orderRows) {
                    await pool.query(
                        `
                            INSERT INTO orders (order_id, address, date, status)
                            VALUES ($1, $2, $3, $4)
                            ON CONFLICT (order_id) DO NOTHING
                        `,
                        [row.order_id, row.address, row.date, row.status]
                    );
                    rowCount++;
                }

                insertedResults.push({filename, table: 'orders', rowCount});
            } else if (mappedItem.tableType === TableType.Products) {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS products
                    (
                        product_id  TEXT PRIMARY KEY,
                        order_id    TEXT,
                        category    TEXT,
                        name        TEXT,
                        description TEXT,
                        price       TEXT
                    )
                `);

                // MAP + FILTER for ProductRow
                const productRows: ProductRow[] = rawRecords.map((r, index) => {
                    if (!isProductRow(r)) {
                        console.warn(`Skipping invalid product row #${index}`, r);
                        return null;
                    }
                    return r;
                })
                    .filter((r): r is ProductRow => r !== null);

                for (const row of productRows) {
                    await pool.query(
                        `
                            INSERT INTO products (product_id, order_id, category, name, description, price)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT (product_id) DO NOTHING
                        `,
                        [row.product_id, row.order_id, row.category, row.name, row.description, row.price]
                    );
                    rowCount++;
                }

                insertedResults.push({filename, table: 'products', rowCount});
            }

            fs.unlinkSync(filePath); // cleanup
        }

        return res.status(200).json({insertedResults});
    })
);