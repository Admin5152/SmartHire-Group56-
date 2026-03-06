import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  job_id: string;
  status: string;
  ai_score: number;
  applied_date: string;
  updated_at: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("applicant_id", user.id)
        .order("updated_at", { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, department");

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getJobTitle = (jobId: string) =>
    jobs.find((j) => j.id === jobId)?.title || "Unknown Position";

  const getNotificationIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-destructive" />;
      case "reviewing":
        return <FileText className="w-6 h-6 text-primary" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getNotificationMessage = (app: Application) => {
    const jobTitle = getJobTitle(app.job_id);
    switch (app.status) {
      case "accepted":
        return `Congratulations! 🎉 Your application for "${jobTitle}" has been accepted.`;
      case "rejected":
        return `Your application for "${jobTitle}" was not selected. Keep trying!`;
      case "reviewing":
        return `Your application for "${jobTitle}" is currently being reviewed.`;
      default:
        return `Your application for "${jobTitle}" has been received and is pending review.`;
    }
  };

  const getNotificationTitle = (status: string) => {
    switch (status) {
      case "accepted":
        return "Application Accepted";
      case "rejected":
        return "Application Update";
      case "reviewing":
        return "Under Review";
      default:
        return "Application Submitted";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on your application status.
            </p>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div
                  key={app.id}
                  className="glass-card p-4 md:p-6 flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(app.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">{getNotificationTitle(app.status)}</h3>
                        <p className="text-muted-foreground text-sm">{getNotificationMessage(app)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        app.status === "accepted"
                          ? "bg-success/10 text-success"
                          : app.status === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>AI Score: {app.ai_score}%</span>
                      <span>•</span>
                      <span>{new Date(app.updated_at).toLocaleDateString()} at {new Date(app.updated_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                You'll receive notifications here when there are updates on your applications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
