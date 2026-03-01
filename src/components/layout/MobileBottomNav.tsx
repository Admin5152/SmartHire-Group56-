import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Briefcase,
  Building2,
  LogIn,
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  userRole?: "applicant" | "hr" | null;
}

const MobileBottomNav = ({ userRole }: MobileBottomNavProps) => {
  const location = useLocation();

  const publicLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/about", icon: Building2, label: "About" },
    { to: "/signin", icon: LogIn, label: "Sign In" },
  ];

  const applicantLinks = [
    { to: "/applicant/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/apply", icon: FileText, label: "Apply" },
    { to: "/applicant/applications", icon: FileText, label: "Apps" },
    { to: "/applicant/notifications", icon: Bell, label: "Alerts" },
  ];

  const hrLinks = [
    { to: "/hr/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/hr/applicants", icon: Users, label: "Applicants" },
    { to: "/hr/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/hr/create-job", icon: PlusCircle, label: "Create" },
  ];

  const getLinks = () => {
    if (userRole === "applicant") return applicantLinks;
    if (userRole === "hr") return hrLinks;
    return publicLinks;
  };

  const links = getLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-0 flex-1 transition-colors",
              isActive(link.to)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <link.icon className={cn("w-5 h-5", isActive(link.to) && "drop-shadow-sm")} />
            <span className={cn(
              "text-[10px] leading-tight truncate",
              isActive(link.to) ? "font-semibold" : "font-medium"
            )}>
              {link.label}
            </span>
            {isActive(link.to) && (
              <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
