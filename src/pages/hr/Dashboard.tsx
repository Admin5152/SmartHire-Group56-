import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, FileText, TrendingUp, PlusCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  department: string;
}

interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  ai_score: number;
  matched_skills: string[];
  status: string;
}

const HRDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, department")
        .eq("created_by", user?.id);

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .order("ai_score", { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApplications = applications.filter((a) => a.status === "pending" || a.status === "reviewing");
  const acceptedApplications = applications.filter((a) => a.status === "accepted");
  const averageScore = applications.length > 0
    ? Math.round(applications.reduce((sum, a) => sum + a.ai_score, 0) / applications.length)
    : 0;

  // Get top candidates (highest AI scores)
  const topCandidates = applications.slice(0, 5);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">HR Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome back, {user?.name}! Here's your hiring overview.
            </p>
          </div>
          <Link to="/hr/create-job" className="btn-primary inline-flex items-center gap-2 text-sm md:text-base self-start">
            <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
            Create New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {[
            { icon: Briefcase, label: "My Jobs", value: jobs.length, color: "text-primary" },
            { icon: Users, label: "Total Applicants", value: applications.length, color: "text-primary" },
            { icon: FileText, label: "Pending Review", value: pendingApplications.length, color: "text-primary" },
            { icon: TrendingUp, label: "Avg. AI Score", value: `${averageScore}%`, color: "text-success" },
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
          {/* Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Applications</h2>
              <Link to="/hr/applicants" className="text-primary hover:underline flex items-center gap-1 text-sm">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app, index) => {
                  const job = jobs.find((j) => j.id === app.job_id);
                  return (
                    <div
                      key={app.id}
                      className="glass-card p-4 md:p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {app.applicant_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{app.applicant_name}</h3>
                              <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied for <span className="font-medium">{job?.title || "Unknown Position"}</span>
                          </p>
                          {app.matched_skills && app.matched_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {app.matched_skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-lg">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            app.ai_score >= 70 ? "text-success" : app.ai_score >= 50 ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {app.ai_score}%
                          </div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                  Applications will appear here as candidates apply.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Candidates */}
            <div className="glass-card p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold mb-4">Top Candidates</h2>
              {topCandidates.length > 0 ? (
                <div className="space-y-3">
                  {topCandidates.map((candidate, index) => (
                    <div key={candidate.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{candidate.applicant_name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {jobs.find((j) => j.id === candidate.job_id)?.title || "Unknown"}
                        </div>
                      </div>
                      <div className="font-semibold text-success">{candidate.ai_score}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No candidates yet
                </p>
              )}
            </div>

            {/* Open Positions */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Open Positions</h2>
                <Link to="/hr/jobs" className="text-primary text-sm hover:underline">
                  Manage
                </Link>
              </div>
              {jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.slice(0, 4).map((job) => {
                    const appCount = applications.filter((a) => a.job_id === job.id).length;
                    return (
                      <div key={job.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                        <div>
                          <div className="font-medium text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.department}</div>
                        </div>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">{appCount}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No jobs created yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
