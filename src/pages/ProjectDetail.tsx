
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';

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

interface TeamMember {
  employee_id: number;
  name: string;
  email: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id, 10));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data);
      
      // Fetch team members assigned to this project
      // This is a placeholder - in a real app we'd fetch actual team members
      setTeamMembers([]);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusBadgeColor(project.status)}>
                  {project.status}
                </Badge>
                {project.department_name && (
                  <span className="text-sm text-gray-500">
                    Department: {project.department_name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate(`/projects/${project.project_id}/edit`)}
            className="bg-vendor-600 hover:bg-vendor-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div>{formatDate(project.starting_date)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div>{formatDate(project.deadline)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Team Size</div>
                <div>{project.no_of_people_working} members</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Project ID</div>
                <div>{project.project_id}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Project Manager</div>
                <div>{project.manager_name || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Co-Manager</div>
                <div>{project.co_manager_name || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Department</div>
                <div>{project.department_name || '-'}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <Badge className={getStatusBadgeColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">Days Running</div>
                <div>
                  {Math.floor((Date.now() - new Date(project.starting_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Days Remaining</div>
                <div>
                  {project.deadline 
                    ? Math.floor((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 'No deadline'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">
              {project.remarks || 'No description provided.'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button variant="outline" size="sm">
              Manage Team
            </Button>
          </CardHeader>
          <CardContent>
            {teamMembers.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.employee_id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <Button variant="ghost" size="sm">View Profile</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No team members assigned to this project yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
