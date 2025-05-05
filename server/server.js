const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const apiHandler = require('./api-handler');

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
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection error' });
  }
});

// Check database tables
app.get('/api/check-db', async (req, res) => {
  try {
    const [tables] = await pool.execute("SHOW TABLES");
    res.json({ 
      message: 'Database tables', 
      tables: tables.map(t => Object.values(t)[0]) 
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Use API handler for all /api routes
app.all('/api/*', (req, res, next) => {
  apiHandler(req, res, next);
});

// Auth route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.execute('SELECT * FROM auth WHERE email = ? AND password = ?', [email, password]);
    
    if (users.length > 0) {
      const user = users[0];
      res.status(200).json({ user: { auth_id: user.auth_id, email: user.email } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
