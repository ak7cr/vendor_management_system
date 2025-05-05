import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

interface Department {
  id: number;
  department_name: string;
  respective_manager: string;
  no_of_ongoing_projects: number;
  no_of_finished_projects: number;
  no_of_people_in_department: number;
}

const emptyDepartment: Omit<Department, 'id'> = {
  department_name: '',
  respective_manager: '',
  no_of_ongoing_projects: 0,
  no_of_finished_projects: 0,
  no_of_people_in_department: 0
};

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDepartment, setCurrentDepartment] = useState<Partial<Department>>(emptyDepartment);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentDepartment(prev => ({
      ...prev,
      [name]: name.startsWith('no_of') ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentDepartment.department_name || !currentDepartment.respective_manager) {
      toast.error('Department name and manager are required');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:3001/api/departments/${currentDepartment.id}` 
        : 'http://localhost:3001/api/departments';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentDepartment)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} department`);
      }

      toast.success(`Department ${isEditing ? 'updated' : 'created'} successfully`);
      setOpenDialog(false);
      fetchDepartments();
      resetForm();
    } catch (error) {
      console.error('Error submitting department:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} department`);
    }
  };

  const handleEdit = (department: Department) => {
    setCurrentDepartment(department);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/departments/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const resetForm = () => {
    setCurrentDepartment(emptyDepartment);
    setIsEditing(false);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.respective_manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-500 mt-1">Manage your company departments</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-vendor-600 hover:bg-vendor-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update the department details below.'
                    : 'Fill in the details for the new department.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_name">Department Name *</Label>
                    <Input
                      id="department_name"
                      name="department_name"
                      value={currentDepartment.department_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="respective_manager">Manager *</Label>
                    <Input
                      id="respective_manager"
                      name="respective_manager"
                      value={currentDepartment.respective_manager || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="no_of_ongoing_projects">Ongoing Projects</Label>
                    <Input
                      id="no_of_ongoing_projects"
                      name="no_of_ongoing_projects"
                      type="number"
                      min="0"
                      value={currentDepartment.no_of_ongoing_projects || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="no_of_finished_projects">Finished Projects</Label>
                    <Input
                      id="no_of_finished_projects"
                      name="no_of_finished_projects"
                      type="number"
                      min="0"
                      value={currentDepartment.no_of_finished_projects || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="no_of_people_in_department">Team Size</Label>
                    <Input
                      id="no_of_people_in_department"
                      name="no_of_people_in_department"
                      type="number"
                      min="0"
                      value={currentDepartment.no_of_people_in_department || 0}
                      onChange={handleInputChange}
                    />
                  </div>
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

        <div className="flex mb-4">
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Department Name</th>
                  <th className="px-6 py-3">Manager</th>
                  <th className="px-6 py-3 text-center">Ongoing Projects</th>
                  <th className="px-6 py-3 text-center">Finished Projects</th>
                  <th className="px-6 py-3 text-center">Team Size</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <tr key={department.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{department.id}</td>
                      <td className="px-6 py-4 font-medium">{department.department_name}</td>
                      <td className="px-6 py-4">{department.respective_manager}</td>
                      <td className="px-6 py-4 text-center">{department.no_of_ongoing_projects}</td>
                      <td className="px-6 py-4 text-center">{department.no_of_finished_projects}</td>
                      <td className="px-6 py-4 text-center">{department.no_of_people_in_department}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(department)}
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
                                Are you sure you want to delete the department "{department.department_name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(department.id)}
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
                    <td colSpan={7} className="px-6 py-4 text-center">
                      {searchTerm ? 'No departments found matching your search.' : 'No departments found. Create your first department!'}
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

export default Departments;
