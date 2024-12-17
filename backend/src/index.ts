import express from 'express';
import dotenv from 'dotenv';
import {Pool} from 'pg';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Database Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
});

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json({success: true, time: result.rows[0]});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});