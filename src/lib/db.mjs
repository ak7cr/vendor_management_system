import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'vendor_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute SQL queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Auth related queries
export async function authenticateUser(email, password) {
  const query = 'SELECT * FROM auth WHERE email = ? AND password = ?';
  const users = await executeQuery(query, [email, password]);
  return users.length > 0 ? users[0] : null;
}

// Department related queries
export async function getAllDepartments() {
  return executeQuery('SELECT * FROM department ORDER BY department_name');
}

export async function getDepartmentById(id) {
  const query = 'SELECT * FROM department WHERE id = ?';
  const departments = await executeQuery(query, [id]);
  return departments.length > 0 ? departments[0] : null;
}

export async function createDepartment(departmentData) {
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

export async function updateDepartment(id, departmentData) {
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

export async function deleteDepartment(id) {
  return executeQuery('DELETE FROM department WHERE id = ?', [id]);
}

// Employee related queries
export async function getAllEmployees() {
  return executeQuery(`
    SELECT e.*, d.department_name 
    FROM employee e 
    LEFT JOIN department d ON e.department = d.id 
    ORDER BY e.name
  `);
}

export async function getEmployeeById(id) {
  const query = `
    SELECT e.*, d.department_name 
    FROM employee e 
    LEFT JOIN department d ON e.department = d.id 
    WHERE e.employee_id = ?
  `;
  
  const employees = await executeQuery(query, [id]);
  return employees.length > 0 ? employees[0] : null;
}

export async function createEmployee(employeeData) {
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

export async function updateEmployee(id, employeeData) {
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

export async function deleteEmployee(id) {
  return executeQuery('DELETE FROM employee WHERE employee_id = ?', [id]);
}

// Project related queries
export async function getAllProjects() {
  return executeQuery(`
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

export async function getProjectById(id) {
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
  
  const projects = await executeQuery(query, [id]);
  return projects.length > 0 ? projects[0] : null;
}

export async function createProject(projectData) {
  const query = `
    INSERT INTO listofprojects 
    (department_id, project_name, starting_date, project_manager, co_manager, deadline, status, no_of_people_working, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    projectData.department_id,
    projectData.project_name,
    projectData.starting_date,
    projectData.project_manager || null,
    projectData.co_manager || null,
    projectData.deadline || null,
    projectData.status || 'Not Started',
    projectData.no_of_people_working || 0,
    projectData.remarks || null
  ];
  
  return executeQuery(query, params);
}

export async function updateProject(id, projectData) {
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
    projectData.department_id,
    projectData.project_name,
    projectData.starting_date,
    projectData.project_manager || null,
    projectData.co_manager || null,
    projectData.deadline || null,
    projectData.status || 'Not Started',
    projectData.no_of_people_working || 0,
    projectData.remarks || null,
    id
  ];
  
  return executeQuery(query, params);
}

export async function deleteProject(id) {
  return executeQuery('DELETE FROM listofprojects WHERE project_id = ?', [id]);
}

export async function getEmployeeProjects(employeeId) {
  return executeQuery(`
    SELECT p.* FROM listofprojects p
    WHERE p.project_manager = ? OR p.co_manager = ?
  `, [employeeId, employeeId]);
}

export async function getDashboardStats() {
  const [
    departments,
    employees,
    projects,
    ongoingProjects,
    completedProjects
  ] = await Promise.all([
    executeQuery('SELECT COUNT(*) as count FROM department'),
    executeQuery('SELECT COUNT(*) as count FROM employee'),
    executeQuery('SELECT COUNT(*) as count FROM listofprojects'),
    executeQuery('SELECT COUNT(*) as count FROM listofprojects WHERE status = "In Progress"'),
    executeQuery('SELECT COUNT(*) as count FROM listofprojects WHERE status = "Completed"')
  ]);

  return {
    totalDepartments: departments[0].count,
    totalEmployees: employees[0].count,
    totalProjects: projects[0].count,
    ongoingProjects: ongoingProjects[0].count,
    completedProjects: completedProjects[0].count
  };
} 