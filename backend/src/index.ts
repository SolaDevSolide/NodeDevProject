import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {Pool} from 'pg';
import fs from 'fs';
import path from 'path';
import {parse} from 'csv-parse';

import {uploadRouter} from './routes/upload';
import {tableRouter} from './routes/table';
import {productRouter} from './routes/product';
import {orderRouter} from './routes/order';
import {swaggerSetup} from './swagger';
import {visualizationRouter} from "./routes/visualization";

const app = express();
export {app}; // so we can import `app` in tests

const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allows all origins
}));
app.use(bodyParser.json());

// 1) Shared PostgreSQL Pool
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: +(process.env.DB_PORT || 5432),
});

// 2) Create tables on startup if they don't exist
//    (orders, products)
async function createTablesIfNotExist() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders
        (
            order_id TEXT PRIMARY KEY,
            address  TEXT,
            date     TEXT,
            status   TEXT
        )
    `);

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

    // Initialize data from CSV files
    await initializeData();
}


async function initializeData() {
    const resourcesPath = path.join(__dirname, '../resources');
    const commandsFile = path.join(resourcesPath, 'commands.csv');
    const productsFile = path.join(resourcesPath, 'products.csv');

    // Load and insert commands (orders)
    if (fs.existsSync(commandsFile)) {
        const commandsContent = fs.readFileSync(commandsFile, 'utf8');
        const orders: Array<{ order_id: string; address: string; date: string; status: string }> = [];

        await new Promise<void>((resolve, reject) => {
            parse(commandsContent, {columns: true, trim: true})
                .on('data', (row) => {
                    orders.push(row);
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });

        for (const order of orders) {
            await pool.query(
                `INSERT INTO orders (order_id, address, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (order_id) DO NOTHING`,
                [order.order_id, order.address, order.date, order.status]
            );
        }

        console.log(`Inserted ${orders.length} orders into the database.`);
    }

    // Load and insert products
    if (fs.existsSync(productsFile)) {
        const productsContent = fs.readFileSync(productsFile, 'utf8');
        const products: Array<{
            product_id: string;
            order_id: string;
            category: string;
            name: string;
            description: string;
            price: string
        }> = [];

        await new Promise<void>((resolve, reject) => {
            parse(productsContent, {columns: true, trim: true})
                .on('data', (row) => {
                    products.push(row);
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });

        for (const product of products) {
            await pool.query(
                `INSERT INTO products (product_id, order_id, category, name, description, price) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (product_id) DO NOTHING`,
                [product.product_id, product.order_id, product.category, product.name, product.description, product.price]
            );
        }

        console.log(`Inserted ${products.length} products into the database.`);
    }
}


if (process.env.NODE_ENV !== 'test') {
    createTablesIfNotExist()
        .then(() => console.log('Ensured tables "orders" and "products" exist'))
        .catch(err => console.error('Error creating tables:', err));
}


// 3) Swagger Docs
swaggerSetup(app);

// 4) Routers
app.use('/api/upload', uploadRouter);
app.use('/api/table', tableRouter);

// New CRUD Routers
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/visualization', visualizationRouter);

// 5) Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        details: err.details || null,
    });
});

// 6) Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}