import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, XCircle, ArrowRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";

const MyApplications = () => {
  const { user } = useAuth();
  const { getApplicationsByApplicant, getJobById } = useJobs();

  const applications = getApplicationsByApplicant(user?.id || "");

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
        return "badge-success";
      case "rejected":
        return "badge-destructive";
      default:
        return "badge-primary";
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-muted-foreground">
              Track the status of all your job applications.
            </p>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => {
                const job = getJobById(app.jobId);
                return (
                  <div
                    key={app.id}
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(app.status)}
                          <h3 className="text-lg font-semibold">{job?.title || "Unknown Position"}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
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
                            AI Score: <span className="font-semibold text-primary">{app.aiScore}%</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {app.resumeFileName}
                        </div>
                        {app.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            {app.matchedSkills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-lg">
                                {skill}
                              </span>
                            ))}
                            {app.matchedSkills.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{app.matchedSkills.length - 3} more
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
          ) : (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring open positions and apply for your dream job.
              </p>
              <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
                Browse Available Jobs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
