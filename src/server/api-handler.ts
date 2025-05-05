import { Request, Response, NextFunction } from 'express';
import * as db from '../lib/db.js';

export async function apiHandler(req: Request, res: Response, next: NextFunction) {
  const { method, url } = req;
  const endpoint = url?.replace(/^\/api\//, '') || '';
  
  console.log(`[API Handler] ${method} ${url} -> endpoint: "${endpoint}"`);
  console.log(`[API Handler] Request body:`, req.body);
  
  try {
    // Auth routes
    if (endpoint === 'auth/login') {
      console.log('[API Handler] Processing auth/login endpoint');
      if (method === 'POST') {
        console.log('[API Handler] Processing POST method');
        const { email, password } = req.body;
        
        if (!email || !password) {
          console.log('[API Handler] Missing email or password');
          return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
          console.log(`[API Handler] Authenticating user: ${email}`);
          const user = await db.authenticateUser(email, password);
          
          if (user) {
            console.log('[API Handler] Authentication successful');
            // Don't send the password back to the client
            const { password: _, ...safeUser } = user;
            return res.status(200).json({ user: safeUser });
          } else {
            console.log('[API Handler] Authentication failed: Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
          }
        } catch (error) {
          console.error('[API Handler] Authentication error:', error);
          return res.status(500).json({ message: 'Internal server error during authentication' });
        }
      }
    }
    
    // Department routes
    else if (endpoint === 'departments') {
      if (method === 'GET') {
        const departments = await db.getAllDepartments();
        return res.status(200).json(departments);
      }
      else if (method === 'POST') {
        await db.createDepartment(req.body);
        return res.status(201).json({ message: 'Department created successfully' });
      }
    }
    else if (endpoint.match(/^departments\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1]);
      
      if (method === 'GET') {
        const department = await db.getDepartmentById(id);
        if (department) {
          return res.status(200).json(department);
        }
        return res.status(404).json({ message: 'Department not found' });
      }
      else if (method === 'PUT') {
        await db.updateDepartment(id, req.body);
        return res.status(200).json({ message: 'Department updated successfully' });
      }
      else if (method === 'DELETE') {
        await db.deleteDepartment(id);
        return res.status(200).json({ message: 'Department deleted successfully' });
      }
    }
    
    // Employee routes
    else if (endpoint === 'employees') {
      if (method === 'GET') {
        const employees = await db.getAllEmployees();
        return res.status(200).json(employees);
      }
      else if (method === 'POST') {
        await db.createEmployee(req.body);
        return res.status(201).json({ message: 'Employee created successfully' });
      }
    }
    else if (endpoint.match(/^employees\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1]);
      
      if (method === 'GET') {
        const employee = await db.getEmployeeById(id);
        if (employee) {
          return res.status(200).json(employee);
        }
        return res.status(404).json({ message: 'Employee not found' });
      }
      else if (method === 'PUT') {
        await db.updateEmployee(id, req.body);
        return res.status(200).json({ message: 'Employee updated successfully' });
      }
      else if (method === 'DELETE') {
        await db.deleteEmployee(id);
        return res.status(200).json({ message: 'Employee deleted successfully' });
      }
    }
    
    // Project routes
    else if (endpoint === 'projects') {
      if (method === 'GET') {
        const projects = await db.getAllProjects();
        return res.status(200).json(projects);
      }
      else if (method === 'POST') {
        await db.createProject(req.body);
        return res.status(201).json({ message: 'Project created successfully' });
      }
    }
    else if (endpoint.match(/^projects\/\d+$/)) {
      const id = parseInt(endpoint.split('/')[1]);
      
      if (method === 'GET') {
        const project = await db.getProjectById(id);
        if (project) {
          return res.status(200).json(project);
        }
        return res.status(404).json({ message: 'Project not found' });
      }
      else if (method === 'PUT') {
        await db.updateProject(id, req.body);
        return res.status(200).json({ message: 'Project updated successfully' });
      }
      else if (method === 'DELETE') {
        await db.deleteProject(id);
        return res.status(200).json({ message: 'Project deleted successfully' });
      }
    }
    
    // Project assignment routes
    else if (endpoint.match(/^employees\/\d+\/projects\/\d+$/)) {
      const parts = endpoint.split('/');
      const employeeId = parseInt(parts[1]);
      const projectId = parseInt(parts[3]);
      
      if (method === 'POST') {
        await db.assignProjectToEmployee(employeeId, projectId);
        return res.status(200).json({ message: 'Project assigned successfully' });
      }
      else if (method === 'DELETE') {
        await db.removeProjectFromEmployee(employeeId, projectId);
        return res.status(200).json({ message: 'Project unassigned successfully' });
      }
    }
    else if (endpoint.match(/^employees\/\d+\/projects$/)) {
      const employeeId = parseInt(endpoint.split('/')[1]);
      
      if (method === 'GET') {
        const projects = await db.getEmployeeProjects(employeeId);
        return res.status(200).json(projects);
      }
    }
    
    // Dashboard stats
    else if (endpoint === 'dashboard/stats') {
      if (method === 'GET') {
        const stats = await db.getDashboardStats();
        return res.status(200).json(stats);
      }
    }

    // If no route matches
    console.log(`[API Handler] No route matches: ${endpoint}`);
    return res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('[API Handler] Error processing request:', error);
    next(error);
  }
}
