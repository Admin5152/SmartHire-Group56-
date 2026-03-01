import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  userRole?: "applicant" | "hr" | null;
  onSignOut?: () => void;
}

const MainLayout = ({ children, userRole, onSignOut }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} onSignOut={onSignOut} />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          "ml-0 md:ml-64", // No margin on mobile, sidebar margin on desktop
          "pb-20 md:pb-0" // Bottom padding for mobile nav
        )}
      >
        {children}
      </main>
      <MobileBottomNav userRole={userRole} />
    </div>
  );
};

export default MainLayout;
