import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Administrators from "./pages/Administrators";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/departments" element={<RequireAuth><Departments /></RequireAuth>} />
            <Route path="/employees" element={<RequireAuth><Employees /></RequireAuth>} />
            <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
            <Route path="/projects/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
            <Route path="/administrators" element={<RequireAuth><Administrators /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            
            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
