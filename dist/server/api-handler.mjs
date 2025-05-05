import * as db from '../lib/db.mjs';
async function apiHandler(req, res) {
    const { method, url } = req;
    const endpoint = url?.replace(/^\/api\//, '') || '';
    try {
        // Auth routes
        if (endpoint === 'auth/login') {
            if (method === 'POST') {
                const { email, password } = req.body;
                const user = await db.authenticateUser(email, password);
                if (user) {
                    res.status(200).json({ user: { auth_id: user.auth_id, email: user.email } });
                }
                else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
                return;
            }
        }
        // Department routes
        if (endpoint === 'departments') {
            if (method === 'GET') {
                const departments = await db.getAllDepartments();
                res.status(200).json(departments);
                return;
            }
            else if (method === 'POST') {
                await db.createDepartment(req.body);
                res.status(201).json({ message: 'Department created' });
                return;
            }
        }
        if (endpoint.match(/^departments\/\d+$/)) {
            const id = parseInt(endpoint.split('/')[1], 10);
            if (method === 'GET') {
                const department = await db.getDepartmentById(id);
                if (department) {
                    res.status(200).json(department);
                }
                else {
                    res.status(404).json({ message: 'Department not found' });
                }
                return;
            }
            else if (method === 'PUT') {
                await db.updateDepartment(id, req.body);
                res.status(200).json({ message: 'Department updated' });
                return;
            }
            else if (method === 'DELETE') {
                await db.deleteDepartment(id);
                res.status(200).json({ message: 'Department deleted' });
                return;
            }
        }
        // Employee routes
        if (endpoint === 'employees') {
            if (method === 'GET') {
                const employees = await db.getAllEmployees();
                res.status(200).json(employees);
                return;
            }
            else if (method === 'POST') {
                await db.createEmployee(req.body);
                res.status(201).json({ message: 'Employee created' });
                return;
            }
        }
        if (endpoint.match(/^employees\/\d+$/)) {
            const id = parseInt(endpoint.split('/')[1], 10);
            if (method === 'GET') {
                const employee = await db.getEmployeeById(id);
                if (employee) {
                    res.status(200).json(employee);
                }
                else {
                    res.status(404).json({ message: 'Employee not found' });
                }
                return;
            }
            else if (method === 'PUT') {
                await db.updateEmployee(id, req.body);
                res.status(200).json({ message: 'Employee updated' });
                return;
            }
            else if (method === 'DELETE') {
                await db.deleteEmployee(id);
                res.status(200).json({ message: 'Employee deleted' });
                return;
            }
        }
        // Project routes
        if (endpoint === 'projects') {
            if (method === 'GET') {
                const projects = await db.getAllProjects();
                res.status(200).json(projects);
                return;
            }
            else if (method === 'POST') {
                await db.createProject(req.body);
                res.status(201).json({ message: 'Project created' });
                return;
            }
        }
        if (endpoint.match(/^projects\/\d+$/)) {
            const id = parseInt(endpoint.split('/')[1], 10);
            if (method === 'GET') {
                const project = await db.getProjectById(id);
                if (project) {
                    res.status(200).json(project);
                }
                else {
                    res.status(404).json({ message: 'Project not found' });
                }
                return;
            }
            else if (method === 'PUT') {
                await db.updateProject(id, req.body);
                res.status(200).json({ message: 'Project updated' });
                return;
            }
            else if (method === 'DELETE') {
                await db.deleteProject(id);
                res.status(200).json({ message: 'Project deleted' });
                return;
            }
        }
        // If no route matches
        res.status(404).json({ message: 'API endpoint not found' });
    }
    catch (error) {
        console.error('API error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export default apiHandler;
