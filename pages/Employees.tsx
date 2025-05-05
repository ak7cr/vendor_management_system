import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

interface Department {
  id: number;
  department_name: string;
}

interface Employee {
  employee_id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  joining_date: string;
  department: number;
  department_name?: string;
  manager_id: number;
  rating_overall: number;
}

interface User {
  user_id: number;
  name: string;
  email: string;
}

const emptyEmployee: Omit<Employee, 'employee_id'> = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  joining_date: new Date().toISOString().split('T')[0],
  department: 0,
  manager_id: 0,
  rating_overall: 0
};

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>(emptyEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: name === 'rating_overall' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: value === 'none' ? null : parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.joining_date) {
      toast.error('Name, email, and joining date are required');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:3001/api/employees/${currentEmployee.employee_id}` 
        : 'http://localhost:3001/api/employees';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEmployee)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} employee`);
      }

      toast.success(`Employee ${isEditing ? 'updated' : 'created'} successfully`);
      setOpenDialog(false);
      fetchEmployees();
      resetForm();
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} employee`);
    }
  };

  const handleEdit = (employee: Employee) => {
    setCurrentEmployee({
      ...employee,
      dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
      joining_date: new Date(employee.joining_date).toISOString().split('T')[0]
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const resetForm = () => {
    setCurrentEmployee({
      ...emptyEmployee,
      joining_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department_name && emp.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 mt-1">Manage your company employees</p>
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
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update the employee details below.'
                    : 'Fill in the details for the new employee.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentEmployee.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={currentEmployee.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={currentEmployee.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={currentEmployee.dob || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date *</Label>
                    <Input
                      id="joining_date"
                      name="joining_date"
                      type="date"
                      value={currentEmployee.joining_date || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={currentEmployee.department?.toString() || 'none'}
                      onValueChange={(value) => handleSelectChange('department', value)}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager_id">Manager</Label>
                    <Select
                      value={currentEmployee.manager_id?.toString() || 'none'}
                      onValueChange={(value) => handleSelectChange('manager_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rating_overall">Overall Rating (0-5)</Label>
                  <Input
                    id="rating_overall"
                    name="rating_overall"
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={currentEmployee.rating_overall || 0}
                    onChange={handleInputChange}
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

        <div className="flex mb-4">
          <Input
            placeholder="Search employees..."
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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Joining Date</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.employee_id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{employee.employee_id}</td>
                      <td className="px-6 py-4 font-medium">{employee.name}</td>
                      <td className="px-6 py-4">{employee.email}</td>
                      <td className="px-6 py-4">{employee.phone || '-'}</td>
                      <td className="px-6 py-4">{employee.department_name || '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(employee.joining_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {employee.rating_overall > 0 ? Number(employee.rating_overall).toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(employee)}
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
                                Are you sure you want to delete the employee "{employee.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(employee.employee_id)}
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
                      {searchTerm ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
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

export default Employees;
