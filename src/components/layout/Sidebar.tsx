import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Briefcase, 
  Building2, 
  LogIn, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  Bell,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: "applicant" | "hr" | null;
  onSignOut?: () => void;
}

const Sidebar = ({ userRole, onSignOut }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const publicLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/jobs", icon: Briefcase, label: "Available Jobs" },
    { to: "/about", icon: Building2, label: "About Company" },
  ];

  const applicantLinks = [
    { to: "/applicant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/jobs", icon: Briefcase, label: "Browse Jobs" },
    { to: "/apply", icon: FileText, label: "Apply for Job" },
    { to: "/applicant/applications", icon: FileText, label: "My Applications" },
    { to: "/applicant/notifications", icon: Bell, label: "Notifications" },
  ];

  const hrLinks = [
    { to: "/hr/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/hr/applicants", icon: Users, label: "All Applicants" },
    { to: "/hr/jobs", icon: Briefcase, label: "Manage Jobs" },
    { to: "/hr/create-job", icon: PlusCircle, label: "Create Job" },
  ];

  const getLinks = () => {
    if (userRole === "applicant") return applicantLinks;
    if (userRole === "hr") return hrLinks;
    return publicLinks;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-border shadow-glass z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-primary-foreground">S</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-foreground animate-fade-in">
              SmartHire
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {getLinks().map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              isActive(link.to) ? "sidebar-link-active" : "sidebar-link"
            )}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="animate-fade-in">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Auth Buttons / Sign Out */}
      <div className="p-4 border-t border-border space-y-2">
        {!userRole ? (
          <>
            <Link
              to="/signin"
              className={cn(
                isActive("/signin") ? "sidebar-link-active" : "sidebar-link"
              )}
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign In</span>}
            </Link>
            <Link
              to="/signup"
              className={cn(
                isActive("/signup") ? "sidebar-link-active" : "sidebar-link"
              )}
            >
              <UserPlus className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign Up</span>}
            </Link>
          </>
        ) : (
          <button
            onClick={onSignOut}
            className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
