import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import apiHandler from './api-handler.mjs';
const app = express();
const port = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(bodyParser.json());
// Create a connection pool to MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'vendor_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Make pool available globally
global.pool = pool;
// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1');
        res.json({ message: 'Database connection successful', result: rows });
    }
    catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'Database connection error' });
    }
});
// Use API handler for all /api routes
app.use('/api', apiHandler);
// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    server.close(() => {
        console.log('Server closed.');
        pool.end();
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    server.close(() => {
        console.log('Server closed.');
        pool.end();
        process.exit(0);
    });
});
