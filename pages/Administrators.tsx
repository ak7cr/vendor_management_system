import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

interface Department {
  id: number;
  department_name: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  phone_no: string;
  dob: string;
  joining_date: string;
  department: number;
  department_name?: string;
}

interface AdministratorsProps {
  insideSettings?: boolean;
}

const emptyUser = {
  name: '',
  email: '',
  phone_no: '',
  dob: '',
  joining_date: new Date().toISOString().split('T')[0],
  department: 0,
  password: ''
};

const Administrators: React.FC<AdministratorsProps> = ({ insideSettings = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(emptyUser);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentUser(prev => ({
      ...prev,
      [name]: value === 'none' ? null : parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser.name || !currentUser.email || !currentUser.joining_date) {
      toast.error('Name, email, and joining date are required');
      return;
    }

    if (!isEditing && !currentUser.password) {
      toast.error('Password is required for new users');
      return;
    }

    const userData = { ...currentUser };
    
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:3001/api/users/${currentUser.user_id}` 
        : 'http://localhost:3001/api/users';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} user`);
      }

      toast.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
      setOpenDialog(false);
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error submitting user:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} user`);
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser({
      ...user,
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      joining_date: new Date(user.joining_date).toISOString().split('T')[0],
      password: '' // Don't include the password when editing
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setCurrentUser({
      ...emptyUser,
      joining_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setShowPassword(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department_name && user.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    insideSettings ? (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div></div>
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
                Add Administrator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? 'Update the administrator details below.'
                    : 'Fill in the details for the new administrator.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentUser.name || ''}
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
                      value={currentUser.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_no">Phone Number</Label>
                    <Input
                      id="phone_no"
                      name="phone_no"
                      value={currentUser.phone_no || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={currentUser.dob || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date *</Label>
                    <Input
                      id="joining_date"
                      name="joining_date"
                      type="date"
                      value={currentUser.joining_date || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={currentUser.department?.toString() || 'none'}
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={currentUser.password || ''}
                      onChange={handleInputChange}
                      required={!isEditing}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
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
            placeholder="Search administrators..."
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
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Loading administrators...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{user.user_id}</td>
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.phone_no || '-'}</td>
                      <td className="px-6 py-4">{user.department_name || '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(user.joining_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
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
                                Are you sure you want to delete the administrator "{user.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(user.user_id)}
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
                      {searchTerm ? 'No administrators found matching your search.' : 'No administrators found. Create your first administrator!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ) : (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administrators</h1>
              <p className="text-gray-500 mt-1">Manage system users and administrators</p>
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
                  Add Administrator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>
                  <DialogDescription>
                    {isEditing 
                      ? 'Update the administrator details below.'
                      : 'Fill in the details for the new administrator.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={currentUser.name || ''}
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
                        value={currentUser.email || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_no">Phone Number</Label>
                      <Input
                        id="phone_no"
                        name="phone_no"
                        value={currentUser.phone_no || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={currentUser.dob || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="joining_date">Joining Date *</Label>
                      <Input
                        id="joining_date"
                        name="joining_date"
                        type="date"
                        value={currentUser.joining_date || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={currentUser.department?.toString() || 'none'}
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={currentUser.password || ''}
                        onChange={handleInputChange}
                        required={!isEditing}
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
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
              placeholder="Search administrators..."
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
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        Loading administrators...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4">{user.user_id}</td>
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.phone_no || '-'}</td>
                        <td className="px-6 py-4">{user.department_name || '-'}</td>
                        <td className="px-6 py-4">
                          {new Date(user.joining_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
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
                                  Are you sure you want to delete the administrator "{user.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(user.user_id)}
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
                        {searchTerm ? 'No administrators found matching your search.' : 'No administrators found. Create your first administrator!'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  );
};

export default Administrators; 