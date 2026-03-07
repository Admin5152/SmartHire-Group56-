import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
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
          "ml-20 md:ml-64" // Adjust based on sidebar state
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
