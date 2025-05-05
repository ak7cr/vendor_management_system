import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Building2, FileText, LogOut, Menu, X, ChevronDown, 
  Home, Settings, Search, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isSidebarOpen: boolean;
};

const NavItem = ({ to, icon: Icon, children, isSidebarOpen }: NavItemProps) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => cn(
      'flex items-center py-3 px-4 rounded-lg transition-colors',
      isActive 
        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground',
      !isSidebarOpen && 'justify-center'
    )}
  >
    <Icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
    {isSidebarOpen && <span>{children}</span>}
  </NavLink>
);

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className={cn(
        "hidden md:flex transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-20",
        "bg-sidebar border-r border-sidebar-border flex-col h-screen sticky top-0"
      )}>
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          isSidebarOpen ? "justify-between" : "justify-center"
        )}>
          {isSidebarOpen ? (
            <div className="text-xl font-bold text-vendor-700">Vendor Management</div>
          ) : (
            <div className="text-xl font-bold text-vendor-700">VM</div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className={cn(!isSidebarOpen && "hidden")}
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            <NavItem to="/" icon={Home} isSidebarOpen={isSidebarOpen}>Dashboard</NavItem>
            <NavItem to="/departments" icon={Building2} isSidebarOpen={isSidebarOpen}>Departments</NavItem>
            <NavItem to="/employees" icon={Users} isSidebarOpen={isSidebarOpen}>Employees</NavItem>
            <NavItem to="/projects" icon={FileText} isSidebarOpen={isSidebarOpen}>Projects</NavItem>
          </nav>
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center", 
            isSidebarOpen ? "justify-between" : "justify-center"
          )}>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.email}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-vendor-600 flex items-center justify-center text-white font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="md:hidden text-xl font-bold text-vendor-700">Vendor Management</div>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex ml-2"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <ChevronDown className="h-5 w-5 -rotate-90" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="hidden md:flex max-w-md w-full mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-vendor-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-vendor-600 flex items-center justify-center text-white font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden transition-opacity duration-300",
          isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className={cn(
            "bg-white w-64 h-full transition-transform duration-300",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="text-xl font-bold text-vendor-700">Vendor Management</div>
              <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="overflow-y-auto p-4">
              <nav className="space-y-1">
                <NavItem to="/" icon={Home} isSidebarOpen={true}>Dashboard</NavItem>
                <NavItem to="/departments" icon={Building2} isSidebarOpen={true}>Departments</NavItem>
                <NavItem to="/employees" icon={Users} isSidebarOpen={true}>Employees</NavItem>
                <NavItem to="/projects" icon={FileText} isSidebarOpen={true}>Projects</NavItem>
              </nav>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.email}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
