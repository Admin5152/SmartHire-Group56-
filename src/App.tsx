import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { JobsProvider } from "@/contexts/JobsContext";
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Landing from "./pages/Landing";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Applicant Pages
import ApplicantDashboard from "./pages/applicant/Dashboard";
import ApplyJob from "./pages/applicant/ApplyJob";
import MyApplications from "./pages/applicant/MyApplications";
import Notifications from "./pages/applicant/Notifications";

// HR Pages
import HRDashboard from "./pages/hr/Dashboard";
import Applicants from "./pages/hr/Applicants";
import ManageJobs from "./pages/hr/ManageJobs";
import CreateJob from "./pages/hr/CreateJob";

const queryClient = new QueryClient();

// Protected Route Component - waits for auth to load
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: "applicant" | "hr" }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === "applicant" ? "/applicant/dashboard" : "/hr/dashboard"} replace />;
  }

  return <>{children}</>;
};

// Layout wrapper that uses auth context
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  return (
    <MainLayout userRole={user?.role || null} onSignOut={signOut}>
      {children}
    </MainLayout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/jobs" element={<LayoutWrapper><Jobs /></LayoutWrapper>} />
      <Route path="/jobs/:id" element={<LayoutWrapper><JobDetails /></LayoutWrapper>} />
      <Route path="/about" element={<LayoutWrapper><About /></LayoutWrapper>} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Applicant Routes */}
      <Route path="/applicant/dashboard" element={<ProtectedRoute allowedRole="applicant"><LayoutWrapper><ApplicantDashboard /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/apply/:jobId?" element={<ProtectedRoute allowedRole="applicant"><LayoutWrapper><ApplyJob /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/applicant/applications" element={<ProtectedRoute allowedRole="applicant"><LayoutWrapper><MyApplications /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/applicant/notifications" element={<ProtectedRoute allowedRole="applicant"><LayoutWrapper><Notifications /></LayoutWrapper></ProtectedRoute>} />

      {/* HR Routes */}
      <Route path="/hr/dashboard" element={<ProtectedRoute allowedRole="hr"><LayoutWrapper><HRDashboard /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/hr/applicants" element={<ProtectedRoute allowedRole="hr"><LayoutWrapper><Applicants /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/hr/jobs" element={<ProtectedRoute allowedRole="hr"><LayoutWrapper><ManageJobs /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/hr/create-job" element={<ProtectedRoute allowedRole="hr"><LayoutWrapper><CreateJob /></LayoutWrapper></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <JobsProvider>
            <AppRoutes />
          </JobsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
