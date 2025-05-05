import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';

interface Department {
  id: number;
  department_name: string;
}

interface Employee {
  employee_id: number;
  name: string;
}

interface User {
  user_id: number;
  name: string;
}

interface Project {
  project_id: number;
  department_id: number;
  department_name?: string;
  project_name: string;
  starting_date: string;
  project_manager: number;
  manager_name?: string;
  co_manager: number;
  co_manager_name?: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  no_of_people_working: number;
  remarks: string;
}

const emptyProject: Omit<Project, 'project_id'> = {
  department_id: 0,
  project_name: '',
  starting_date: new Date().toISOString().split('T')[0],
  project_manager: 0,
  co_manager: 0,
  deadline: '',
  status: 'Not Started',
  no_of_people_working: 0,
  remarks: ''
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>(emptyProject);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({
      ...prev,
      [name]: name === 'no_of_people_working' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'status') {
      setCurrentProject(prev => ({
        ...prev,
        [name]: value as 'Not Started' | 'In Progress' | 'Completed'
      }));
    } else {
      setCurrentProject(prev => ({
        ...prev,
        [name]: value === 'none' ? null : parseInt(value, 10)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject.project_name || !currentProject.starting_date || !currentProject.project_manager) {
      toast.error('Project name, start date, and project manager are required');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:3001/api/projects/${currentProject.project_id}` 
        : 'http://localhost:3001/api/projects';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProject)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} project`);
      }

      toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully`);
      setOpenDialog(false);
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} project`);
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject({
      ...project,
      starting_date: new Date(project.starting_date).toISOString().split('T')[0],
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const resetForm = () => {
    setCurrentProject({
      ...emptyProject,
      starting_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-500';
      case 'In Progress':
        return 'bg-vendor-600';
      case 'Completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.department_name && proj.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proj.manager_name && proj.manager_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">Manage your company projects</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-vendor-600 hover:bg-vendor-700"
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update the project details below.'
                    : 'Fill in the details for the new project.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_name">Project Name *</Label>
                    <Input
                      id="project_name"
                      name="project_name"
                      value={currentProject.project_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                      value={currentProject.department_id?.toString() || 'none'}
                      onValueChange={(value) => handleSelectChange('department_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starting_date">Start Date *</Label>
                    <Input
                      id="starting_date"
                      name="starting_date"
                      type="date"
                      value={currentProject.starting_date || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={currentProject.deadline || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_manager">Project Manager *</Label>
                    <Select
                      value={currentProject.project_manager?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('project_manager', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="co_manager">Co-Manager</Label>
                    <Select
                      value={currentProject.co_manager?.toString() || 'none'}
                      onValueChange={(value) => handleSelectChange('co_manager', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select co-manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Co-Manager</SelectItem>
                        {users
                          .filter(u => u.user_id !== currentProject.project_manager)
                          .map((user) => (
                            <SelectItem key={user.user_id} value={user.user_id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={currentProject.status || 'Not Started'}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="no_of_people_working">Team Size</Label>
                    <Input
                      id="no_of_people_working"
                      name="no_of_people_working"
                      type="number"
                      min="0"
                      value={currentProject.no_of_people_working || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    value={currentProject.remarks || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-vendor-600 hover:bg-vendor-700">
                    {isEditing ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="whitespace-nowrap">Filter Status:</Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status-filter" className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Project Name</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Manager</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading projects...
                    </td>
                  </tr>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.project_id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{project.project_id}</td>
                      <td className="px-6 py-4 font-medium">{project.project_name}</td>
                      <td className="px-6 py-4">{project.department_name || '-'}</td>
                      <td className="px-6 py-4">{project.manager_name || '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(project.starting_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusBadgeColor(project.status)}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the project "{project.project_name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(project.project_id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No projects found matching your criteria.' 
                        : 'No projects found. Create your first project!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
