const db = require('../lib/db');

function apiHandler(req, res, next) {
  const { method, url } = req;
  const endpoint = url?.replace(/^\/api\//, '') || '';
  
  console.log(`[API Handler] ${method} ${url} -> endpoint: "${endpoint}"`);
  console.log(`[API Handler] Request body:`, req.body);
  
  try {
    // Auth routes
    if (endpoint === 'auth/login') {
      if (method === 'POST') {
        const { email, password } = req.body;
        db.authenticateUser(email, password)
          .then(user => {
            if (user) {
              res.status(200).json({ user: { auth_id: user.auth_id, email: user.email } });
            } else {
              res.status(401).json({ message: 'Invalid credentials' });
            }
          })
          .catch(error => {
            console.error('Auth error:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }

    // Department routes
    if (endpoint === 'departments') {
      if (method === 'GET') {
        db.getAllDepartments()
          .then(departments => {
            res.status(200).json(departments);
          })
          .catch(error => {
            console.error('Error getting departments:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'POST') {
        console.log('[API Handler] Creating department with data:', req.body);
        db.createDepartment(req.body)
          .then(() => {
            res.status(201).json({ message: 'Department created' });
          })
          .catch(error => {
            console.error('Error creating department:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }
    
    if (endpoint.match(/^departments\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1], 10);
      
      if (method === 'GET') {
        db.getDepartmentById(id)
          .then(department => {
            if (department) {
              res.status(200).json(department);
            } else {
              res.status(404).json({ message: 'Department not found' });
            }
          })
          .catch(error => {
            console.error('Error getting department:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'PUT') {
        db.updateDepartment(id, req.body)
          .then(() => {
            res.status(200).json({ message: 'Department updated' });
          })
          .catch(error => {
            console.error('Error updating department:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'DELETE') {
        db.deleteDepartment(id)
          .then(() => {
            res.status(200).json({ message: 'Department deleted' });
          })
          .catch(error => {
            console.error('Error deleting department:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }

    // Employee routes
    if (endpoint === 'employees') {
      if (method === 'GET') {
        db.getAllEmployees()
          .then(employees => {
            res.status(200).json(employees);
          })
          .catch(error => {
            console.error('Error getting employees:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'POST') {
        db.createEmployee(req.body)
          .then(() => {
            res.status(201).json({ message: 'Employee created' });
          })
          .catch(error => {
            console.error('Error creating employee:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }
    
    if (endpoint.match(/^employees\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1], 10);
      
      if (method === 'GET') {
        db.getEmployeeById(id)
          .then(employee => {
            if (employee) {
              res.status(200).json(employee);
            } else {
              res.status(404).json({ message: 'Employee not found' });
            }
          })
          .catch(error => {
            console.error('Error getting employee:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'PUT') {
        db.updateEmployee(id, req.body)
          .then(() => {
            res.status(200).json({ message: 'Employee updated' });
          })
          .catch(error => {
            console.error('Error updating employee:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'DELETE') {
        db.deleteEmployee(id)
          .then(() => {
            res.status(200).json({ message: 'Employee deleted' });
          })
          .catch(error => {
            console.error('Error deleting employee:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }

    // Project routes
    if (endpoint === 'projects') {
      if (method === 'GET') {
        db.getAllProjects()
          .then(projects => {
            res.status(200).json(projects);
          })
          .catch(error => {
            console.error('Error getting projects:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'POST') {
        db.createProject(req.body)
          .then(() => {
            res.status(201).json({ message: 'Project created' });
          })
          .catch(error => {
            console.error('Error creating project:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }
    
    if (endpoint.match(/^projects\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1], 10);
      
      if (method === 'GET') {
        db.getProjectById(id)
          .then(project => {
            if (project) {
              res.status(200).json(project);
            } else {
              res.status(404).json({ message: 'Project not found' });
            }
          })
          .catch(error => {
            console.error('Error getting project:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'PUT') {
        db.updateProject(id, req.body)
          .then(() => {
            res.status(200).json({ message: 'Project updated' });
          })
          .catch(error => {
            console.error('Error updating project:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      } else if (method === 'DELETE') {
        db.deleteProject(id)
          .then(() => {
            res.status(200).json({ message: 'Project deleted' });
          })
          .catch(error => {
            console.error('Error deleting project:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }

    // Dashboard stats route
    if (endpoint === 'dashboard/stats') {
      if (method === 'GET') {
        db.getDashboardStats()
          .then(stats => {
            res.status(200).json(stats);
          })
          .catch(error => {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
        return;
      }
    }

    // If no route matches
    res.status(404).json({ message: 'API endpoint not found' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = apiHandler; 