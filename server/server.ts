import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config.js';
import { pool } from '../lib/db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Test database connection
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT 1');
    res.json({ message: 'Database connection successful', result: rows });
  } catch (err: any) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection error', error: err.message });
  }
});

// Debug endpoint to check database connection
app.get('/api/debug/db', async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful',
      result 
    });
  } catch (err: any) {
    console.error('Database error:', err);
    res.status(500).json({ 
      message: 'Database connection error', 
      error: err.message 
    });
  }
});

// Debug endpoint to list database tables
app.get('/api/debug/tables', async (req: Request, res: Response) => {
  try {
    const [tables] = await pool.execute("SHOW TABLES");
    res.json({ 
      message: 'Database tables', 
      tables: tables 
    });
  } catch (err: any) {
    console.error('Database error:', err);
    res.status(500).json({ 
      message: 'Database error', 
      error: err.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    const [rows] = await pool.execute('SELECT * FROM auth WHERE email = ? AND password = ?', [email, password]);
    const users = rows as any[];
    
    if (users.length > 0) {
      const user = users[0];
      // Don't send the password back to the client
      const { password: _, ...safeUser } = user;
      res.status(200).json({ user: safeUser });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// API routes for departments
app.get('/api/departments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Department ORDER BY department_name');
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/departments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = req.body;
    await pool.execute(
      'INSERT INTO Department (department_name, respective_manager, no_of_ongoing_projects, no_of_finished_projects, no_of_people_in_department) VALUES (?, ?, ?, ?, ?)',
      [
        dept.department_name,
        dept.respective_manager,
        dept.no_of_ongoing_projects || 0,
        dept.no_of_finished_projects || 0,
        dept.no_of_people_in_department || 0
      ]
    );
    res.status(201).json({ message: 'Department created successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/departments/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute('SELECT * FROM Department WHERE id = ?', [id]);
    const departments = rows as any[];
    if (departments.length > 0) {
      res.status(200).json(departments[0]);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/departments/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const dept = req.body;
    await pool.execute(
      'UPDATE Department SET department_name = ?, respective_manager = ?, no_of_ongoing_projects = ?, no_of_finished_projects = ?, no_of_people_in_department = ? WHERE id = ?',
      [
        dept.department_name,
        dept.respective_manager,
        dept.no_of_ongoing_projects || 0,
        dept.no_of_finished_projects || 0,
        dept.no_of_people_in_department || 0,
        id
      ]
    );
    res.status(200).json({ message: 'Department updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/departments/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await pool.execute('DELETE FROM Department WHERE id = ?', [id]);
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// API routes for employees
app.get('/api/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, d.department_name 
      FROM Employee e 
      LEFT JOIN Department d ON e.department = d.id 
      ORDER BY e.name
    `);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emp = req.body;
    await pool.execute(
      'INSERT INTO Employee (name, email, phone, dob, joining_date, department, manager_id, rating_overall) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        emp.name,
        emp.email,
        emp.phone || null,
        emp.dob || null,
        emp.joining_date,
        emp.department || null,
        emp.manager_id || null,
        emp.rating_overall || 0
      ]
    );
    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute(`
      SELECT e.*, d.department_name 
      FROM Employee e 
      LEFT JOIN Department d ON e.department = d.id 
      WHERE e.employee_id = ?
    `, [id]);
    const employees = rows as any[];
    if (employees.length > 0) {
      res.status(200).json(employees[0]);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const emp = req.body;
    await pool.execute(
      'UPDATE Employee SET name = ?, email = ?, phone = ?, dob = ?, joining_date = ?, department = ?, manager_id = ?, rating_overall = ? WHERE employee_id = ?',
      [
        emp.name,
        emp.email,
        emp.phone || null,
        emp.dob || null,
        emp.joining_date,
        emp.department || null,
        emp.manager_id || null,
        emp.rating_overall || 0,
        id
      ]
    );
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await pool.execute('DELETE FROM Employee WHERE employee_id = ?', [id]);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// API routes for projects
app.get('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, d.department_name,
             u1.name as manager_name,
             u2.name as co_manager_name
      FROM ListOfProjects p
      LEFT JOIN Department d ON p.department_id = d.id
      LEFT JOIN user u1 ON p.project_manager = u1.user_id
      LEFT JOIN user u2 ON p.co_manager = u2.user_id
      ORDER BY p.starting_date DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proj = req.body;
    await pool.execute(
      'INSERT INTO ListOfProjects (project_name, department_id, starting_date, project_manager, co_manager, deadline, status, no_of_people_working, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        proj.project_name,
        proj.department_id || null,
        proj.starting_date,
        proj.project_manager,
        proj.co_manager || null,
        proj.deadline || null,
        proj.status || 'Not Started',
        proj.no_of_people_working || 0,
        proj.remarks || ''
      ]
    );
    res.status(201).json({ message: 'Project created successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute(`
      SELECT p.*, d.department_name,
             u1.name as manager_name,
             u2.name as co_manager_name
      FROM ListOfProjects p
      LEFT JOIN Department d ON p.department_id = d.id
      LEFT JOIN user u1 ON p.project_manager = u1.user_id
      LEFT JOIN user u2 ON p.co_manager = u2.user_id
      WHERE p.project_id = ?
    `, [id]);
    const projects = rows as any[];
    if (projects.length > 0) {
      res.status(200).json(projects[0]);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const proj = req.body;
    await pool.execute(
      'UPDATE ListOfProjects SET project_name = ?, department_id = ?, starting_date = ?, project_manager = ?, co_manager = ?, deadline = ?, status = ?, no_of_people_working = ?, remarks = ? WHERE project_id = ?',
      [
        proj.project_name,
        proj.department_id || null,
        proj.starting_date,
        proj.project_manager,
        proj.co_manager || null,
        proj.deadline || null,
        proj.status || 'Not Started',
        proj.no_of_people_working || 0,
        proj.remarks || '',
        id
      ]
    );
    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await pool.execute('DELETE FROM ListOfProjects WHERE project_id = ?', [id]);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// API route for dashboard stats
app.get('/api/dashboard/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total departments count
    const [deptRows] = await pool.execute('SELECT COUNT(*) as count FROM Department');
    const departmentsCount = (deptRows as any[])[0].count;

    // Get total employees count
    const [empRows] = await pool.execute('SELECT COUNT(*) as count FROM Employee');
    const employeesCount = (empRows as any[])[0].count;

    // Get total projects count
    const [projRows] = await pool.execute('SELECT COUNT(*) as count FROM ListOfProjects');
    const projectsCount = (projRows as any[])[0].count;

    // Get projects by status
    const [statusRows] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM ListOfProjects 
      GROUP BY status
    `);
    
    // Get recent projects
    const [recentProjects] = await pool.execute(`
      SELECT p.*, d.department_name, u.name as manager_name
      FROM ListOfProjects p
      LEFT JOIN Department d ON p.department_id = d.id
      LEFT JOIN user u ON p.project_manager = u.user_id
      ORDER BY p.starting_date DESC
      LIMIT 5
    `);

    // Return combined dashboard stats
    res.status(200).json({
      counts: {
        departments: departmentsCount,
        employees: employeesCount,
        projects: projectsCount
      },
      projectsByStatus: statusRows,
      recentProjects: recentProjects
    });
  } catch (error) {
    next(error);
  }
});

// API routes for users
app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.user_id, u.name, u.email, u.phone_no, u.dob, u.joining_date, u.department, d.department_name
      FROM user u
      LEFT JOIN Department d ON u.department = d.id
      ORDER BY u.name
    `);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.body;
    
    // Insert into user table - the auth view will be automatically updated
    await pool.execute(
      'INSERT INTO user (name, email, phone_no, dob, joining_date, department, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user.name,
        user.email,
        user.phone_no || null,
        user.dob || null,
        user.joining_date,
        user.department || null,
        user.password
      ]
    );
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute(`
      SELECT u.user_id, u.name, u.email, u.phone_no, u.dob, u.joining_date, u.department, d.department_name
      FROM user u
      LEFT JOIN Department d ON u.department = d.id
      WHERE u.user_id = ?
    `, [id]);
    
    const users = rows as any[];
    if (users.length > 0) {
      res.status(200).json(users[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.body;
    
    // If password is provided, update it
    if (user.password) {
      await pool.execute(
        'UPDATE user SET name = ?, email = ?, phone_no = ?, dob = ?, joining_date = ?, department = ?, password = ? WHERE user_id = ?',
        [
          user.name,
          user.email,
          user.phone_no || null,
          user.dob || null,
          user.joining_date,
          user.department || null,
          user.password,
          id
        ]
      );
    } else {
      // Update without changing password
      await pool.execute(
        'UPDATE user SET name = ?, email = ?, phone_no = ?, dob = ?, joining_date = ?, department = ? WHERE user_id = ?',
        [
          user.name,
          user.email,
          user.phone_no || null,
          user.dob || null,
          user.joining_date,
          user.department || null,
          id
        ]
      );
    }
    
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Delete from user table - the auth view will be automatically updated
    await pool.execute('DELETE FROM user WHERE user_id = ?', [id]);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const port = config.server.port;
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
