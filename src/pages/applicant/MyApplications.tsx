import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, XCircle, ArrowRight, Briefcase, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  resume_file_name: string;
  ai_score: number;
  matched_skills: string[];
  status: string;
  applied_date: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  department: string;
  location: string;
  type: string;
  is_external?: boolean;
}

const MyApplications = () => {
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

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const appliedJobIds = applications.map((app) => app.job_id);
  const availableJobs = jobs.filter((job) => !appliedJobIds.includes(job.id) && !job.is_external);
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">My Applications</h1>
              <p className="text-muted-foreground">
                Track the status of all your job applications.
              </p>
            </div>
            <Link to="/apply" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Apply for a Job
            </Link>
          </div>

          {/* Applied Jobs Section */}
          {applications.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const job = getJobById(app.job_id);
                  return (
                    <div
                      key={app.id}
                      className="glass-card p-4 md:p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(app.status)}
                            <h3 className="text-lg font-semibold">{job?.title || "Unknown Position"}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>Applied: {new Date(app.applied_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{job?.department}</span>
                            <span>•</span>
                            <span>{job?.location}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={getStatusBadge(app.status)}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <span className="text-sm">
                              AI Score: <span className="font-semibold text-primary">{app.ai_score}%</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            {app.resume_file_name}
                          </div>
                          {app.matched_skills && app.matched_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {app.matched_skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-lg">
                                  {skill}
                                </span>
                              ))}
                              {app.matched_skills.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{app.matched_skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Jobs Section */}
          {availableJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {applications.length > 0 ? "Other Available Positions" : "Available Positions"}
              </h2>
              <div className="space-y-4">
                {availableJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: `${(applications.length + index) * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{job.type}</span>
                          <span className="text-sm text-muted-foreground">{job.department}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.tech_stack?.slice(0, 4).map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-secondary text-xs rounded-lg">
                              {tech}
                            </span>
                          ))}
                          {job.tech_stack && job.tech_stack.length > 4 && (
                            <span className="px-2 py-1 bg-secondary text-xs rounded-lg text-muted-foreground">
                              +{job.tech_stack.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="btn-secondary"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/apply/${job.id}`}
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          Apply
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {applications.length === 0 && availableJobs.length === 0 && (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring open positions and apply for your dream job.
              </p>
              <Link to="/apply" className="btn-primary inline-flex items-center gap-2">
                Apply for a Job
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {applications.length === 0 && availableJobs.length > 0 && (
            <div className="glass-card p-8 text-center mb-8 animate-fade-in-up">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground text-sm">
                Apply for one of the available positions below to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
