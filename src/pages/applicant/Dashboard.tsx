import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, FileText, User, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_file_name: string;
  ai_score: number;
  status: string;
  applied_date: string;
}

interface Job {
  id: string;
  title: string;
}

const ApplicantDashboard = () => {
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
      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("applicant_id", user.id)
        .order("applied_date", { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);

      // Fetch jobs for application titles
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title");

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getJobById = (jobId: string) => jobs.find((j) => j.id === jobId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium";
      case "rejected":
        return "bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium";
      default:
        return "bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium";
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
    <div className="min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's an overview of your job applications.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {[
            { icon: FileText, label: "Applications", value: applications.length, color: "text-primary" },
            { icon: Clock, label: "Pending", value: applications.filter((a) => a.status === "pending" || a.status === "reviewing").length, color: "text-primary" },
            { icon: CheckCircle, label: "Accepted", value: applications.filter((a) => a.status === "accepted").length, color: "text-success" },
            { icon: XCircle, label: "Rejected", value: applications.filter((a) => a.status === "rejected").length, color: "text-destructive" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
                <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Applications</h2>
              <Link to="/apply" className="text-primary hover:underline flex items-center gap-1 text-sm">
                Apply for a Job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const job = getJobById(app.job_id);
                  return (
                    <div
                      key={app.id}
                      className="glass-card p-4 md:p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(app.status)}
                            <h3 className="font-semibold">{job?.title || "Unknown Position"}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Applied on {new Date(app.applied_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(app.status)}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              AI Score: <span className="font-medium text-primary">{app.ai_score}%</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Resume</div>
                          <div className="text-sm font-medium">{app.resume_file_name}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying for jobs to see your applications here.
                </p>
                <Link to="/apply" className="btn-primary inline-flex items-center gap-2">
                  Apply for a Job <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/jobs"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span>Browse Available Jobs</span>
                </Link>
                <Link
                  to="/apply"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Submit New Application</span>
                </Link>
                <Link
                  to="/applicant/applications"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <Bell className="w-5 h-5 text-primary" />
                  <span>View All Applications</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
