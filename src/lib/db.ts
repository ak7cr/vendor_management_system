import mysql from 'mysql2/promise';
import { config } from '../config.js';

// Database connection pool
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Types
export interface User {
  auth_id: number;
  email: string;
  password: string;
}

export interface Department {
  id: number;
  department_name: string;
  respective_manager: string;
  no_of_ongoing_projects: number;
  no_of_finished_projects: number;
  no_of_people_in_department: number;
}

// Auth related queries
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const query = 'SELECT * FROM auth WHERE email = ? AND password = ?';
  const [rows] = await pool.execute(query, [email, password]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
}

// Helper function for executing queries
async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.execute(query, params);
  return rows as T;
}

// Export the pool for direct use if needed
export { pool, executeQuery };

// Department related queries
export async function getAllDepartments() {
  return executeQuery<any[]>('SELECT * FROM department ORDER BY department_name');
}

export async function getDepartmentById(id: number) {
  const query = 'SELECT * FROM department WHERE id = ?';
  const departments = await executeQuery<any[]>(query, [id]);
  return departments.length > 0 ? departments[0] : null;
}

export async function createDepartment(departmentData: any) {
  const query = `
    INSERT INTO department 
    (department_name, respective_manager, no_of_ongoing_projects, no_of_finished_projects, no_of_people_in_department) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    departmentData.department_name, 
    departmentData.respective_manager, 
    departmentData.no_of_ongoing_projects || 0, 
    departmentData.no_of_finished_projects || 0, 
    departmentData.no_of_people_in_department || 0
  ];
  
  return executeQuery(query, params);
}

export async function updateDepartment(id: number, departmentData: any) {
  const query = `
    UPDATE department 
    SET 
      department_name = ?, 
      respective_manager = ?, 
      no_of_ongoing_projects = ?, 
      no_of_finished_projects = ?, 
      no_of_people_in_department = ? 
    WHERE id = ?
  `;
  
  const params = [
    departmentData.department_name, 
    departmentData.respective_manager, 
    departmentData.no_of_ongoing_projects || 0, 
    departmentData.no_of_finished_projects || 0, 
    departmentData.no_of_people_in_department || 0,
    id
  ];
  
  return executeQuery(query, params);
}

export async function deleteDepartment(id: number) {
  return executeQuery('DELETE FROM department WHERE id = ?', [id]);
}

// Employee related queries
export async function getAllEmployees() {
  return executeQuery<any[]>(`
    SELECT e.*, d.department_name 
    FROM employee e 
    LEFT JOIN department d ON e.department = d.id 
    ORDER BY e.name
  `);
}

export async function getEmployeeById(id: number) {
  const query = `
    SELECT e.*, d.department_name 
    FROM employee e 
    LEFT JOIN department d ON e.department = d.id 
    WHERE e.employee_id = ?
  `;
  
  const employees = await executeQuery<any[]>(query, [id]);
  return employees.length > 0 ? employees[0] : null;
}

export async function createEmployee(employeeData: any) {
  const query = `
    INSERT INTO employee 
    (name, email, phone, dob, joining_date, department, manager_id, rating_overall) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    employeeData.name, 
    employeeData.email, 
    employeeData.phone || null, 
    employeeData.dob || null, 
    employeeData.joining_date, 
    employeeData.department || null, 
    employeeData.manager_id || null, 
    employeeData.rating_overall || 0
  ];
  
  return executeQuery(query, params);
}

export async function updateEmployee(id: number, employeeData: any) {
  const query = `
    UPDATE employee 
    SET 
      name = ?, 
      email = ?, 
      phone = ?, 
      dob = ?, 
      joining_date = ?,
      department = ?, 
      manager_id = ?, 
      rating_overall = ? 
    WHERE employee_id = ?
  `;
  
  const params = [
    employeeData.name, 
    employeeData.email, 
    employeeData.phone || null, 
    employeeData.dob || null, 
    employeeData.joining_date, 
    employeeData.department || null, 
    employeeData.manager_id || null, 
    employeeData.rating_overall || 0,
    id
  ];
  
  return executeQuery(query, params);
}

export async function deleteEmployee(id: number) {
  return executeQuery('DELETE FROM employee WHERE employee_id = ?', [id]);
}

// Project related queries
export async function getAllProjects() {
  return executeQuery<any[]>(`
    SELECT p.*, d.department_name, 
           e1.name as manager_name, 
           e2.name as co_manager_name 
    FROM listofprojects p 
    LEFT JOIN department d ON p.department_id = d.id
    LEFT JOIN employee e1 ON p.project_manager = e1.employee_id
    LEFT JOIN employee e2 ON p.co_manager = e2.employee_id
    ORDER BY p.starting_date DESC
  `);
}

export async function getProjectById(id: number) {
  const query = `
    SELECT p.*, d.department_name, 
           e1.name as manager_name, 
           e2.name as co_manager_name 
    FROM listofprojects p 
    LEFT JOIN department d ON p.department_id = d.id
    LEFT JOIN employee e1 ON p.project_manager = e1.employee_id
    LEFT JOIN employee e2 ON p.co_manager = e2.employee_id
    WHERE p.project_id = ?
  `;
  
  const projects = await executeQuery<any[]>(query, [id]);
  return projects.length > 0 ? projects[0] : null;
}

export async function createProject(projectData: any) {
  const query = `
    INSERT INTO listofprojects 
    (department_id, project_name, starting_date, project_manager, co_manager, deadline, status, no_of_people_working, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    projectData.department_id || null, 
    projectData.project_name, 
    projectData.starting_date, 
    projectData.project_manager, 
    projectData.co_manager || null, 
    projectData.deadline || null, 
    projectData.status || 'Not Started', 
    projectData.no_of_people_working || 0, 
    projectData.remarks || null
  ];
  
  return executeQuery(query, params);
}

export async function updateProject(id: number, projectData: any) {
  const query = `
    UPDATE listofprojects 
    SET 
      department_id = ?, 
      project_name = ?, 
      starting_date = ?, 
      project_manager = ?, 
      co_manager = ?, 
      deadline = ?, 
      status = ?, 
      no_of_people_working = ?, 
      remarks = ? 
    WHERE project_id = ?
  `;
  
  const params = [
    projectData.department_id || null, 
    projectData.project_name, 
    projectData.starting_date, 
    projectData.project_manager, 
    projectData.co_manager || null, 
    projectData.deadline || null, 
    projectData.status || 'Not Started', 
    projectData.no_of_people_working || 0, 
    projectData.remarks || null,
    id
  ];
  
  return executeQuery(query, params);
}

export async function deleteProject(id: number) {
  return executeQuery('DELETE FROM listofprojects WHERE project_id = ?', [id]);
}

// Project assignments
export async function getEmployeeProjects(employeeId: number) {
  return executeQuery<any[]>(`
    SELECT p.*
    FROM employeeprojects ep
    JOIN listofprojects p ON ep.list_project_id = p.project_id
    WHERE ep.employee_id = ?
  `, [employeeId]);
}

export async function assignProjectToEmployee(employeeId: number, projectId: number) {
  return executeQuery(
    'INSERT INTO employeeprojects (employee_id, list_project_id) VALUES (?, ?)',
    [employeeId, projectId]
  );
}

export async function removeProjectFromEmployee(employeeId: number, projectId: number) {
  return executeQuery(
    'DELETE FROM employeeprojects WHERE employee_id = ? AND list_project_id = ?',
    [employeeId, projectId]
  );
}

// Dashboard statistics
export async function getDashboardStats() {
  const departments = await executeQuery<any[]>('SELECT COUNT(*) as count FROM department');
  const employees = await executeQuery<any[]>('SELECT COUNT(*) as count FROM employee');
  const projects = await executeQuery<any[]>('SELECT COUNT(*) as count FROM listofprojects');
  const activeProjects = await executeQuery<any[]>("SELECT COUNT(*) as count FROM listofprojects WHERE status = 'In Progress'");
  
  return {
    departmentCount: departments[0]?.count || 0,
    employeeCount: employees[0]?.count || 0,
    projectCount: projects[0]?.count || 0,
    activeProjectCount: activeProjects[0]?.count || 0,
  };
}
