import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'vendor_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1');
    res.json({ message: 'Database connection successful', result: rows });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection error', error: err.message });
  }
});

// Direct login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const [rows] = await pool.execute('SELECT * FROM auth WHERE email = ? AND password = ?', [email, password]);
    const users = rows;
    
    if (users.length > 0) {
      const user = users[0];
      // Don't send the password back to the client
      const { password: _, ...safeUser } = user;
      return res.status(200).json({ user: safeUser });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Department routes
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Department ORDER BY department_name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Employee routes
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, d.department_name 
      FROM Employee e 
      LEFT JOIN Department d ON e.department = d.id 
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Project routes
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, d.department_name, 
             e1.name as manager_name, 
             e2.name as co_manager_name 
      FROM ListOfProjects p 
      LEFT JOIN Department d ON p.department_id = d.id
      LEFT JOIN Employee e1 ON p.project_manager = e1.employee_id
      LEFT JOIN Employee e2 ON p.co_manager = e2.employee_id
      ORDER BY p.starting_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  server.close(async () => {
    console.log('Server closed.');
    await pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  server.close(async () => {
    console.log('Server closed.');
    await pool.end();
    process.exit(0);
  });
}); 