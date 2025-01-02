import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {Pool} from 'pg';

import {uploadRouter} from './routes/upload';
import {tableRouter} from './routes/table';
import {productRouter} from './routes/product';
import {orderRouter} from './routes/order';
import {swaggerSetup} from './swagger';

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