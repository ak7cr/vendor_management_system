import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Building2, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  counts: {
    departments: number;
    employees: number;
    projects: number;
  };
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentProjects: Array<{
    project_id: number;
    project_name: string;
    department_name: string;
    manager_name: string;
    starting_date: string;
    status: string;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Count active projects (In Progress)
  const activeProjectCount = stats?.projectsByStatus?.find(
    p => p.status === 'In Progress'
  )?.count || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to Vendor Management System</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Total Departments</CardTitle>
                <Building2 className="h-5 w-5 text-vendor-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.counts.departments || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Total Employees</CardTitle>
                <Users className="h-5 w-5 text-vendor-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.counts.employees || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
                <FileText className="h-5 w-5 text-vendor-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.counts.projects || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Active Projects</CardTitle>
                <Clock className="h-5 w-5 text-vendor-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeProjectCount}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentProjects && stats.recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentProjects.map(project => (
                    <div key={project.project_id} className="border-b pb-3">
                      <h3 className="font-medium">{project.project_name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>{project.department_name || 'No Department'}</span>
                        <span className="mx-2">•</span>
                        <span>{project.manager_name || 'No Manager'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(project.starting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          project.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'In Progress'
                            ? 'bg-vendor-100 text-vendor-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent projects found
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.projectsByStatus && stats.projectsByStatus.length > 0 ? (
                <div className="space-y-4">
                  {stats.projectsByStatus.map((statusGroup, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="font-medium">{statusGroup.status}</span>
                      <span className="text-2xl font-bold">{statusGroup.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No project status data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
