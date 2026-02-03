import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, Users, PlusCircle, ArrowRight } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";

const ManageJobs = () => {
  const { jobs, applications } = useJobs();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Manage Jobs</h1>
              <p className="text-muted-foreground">
                View and manage all open positions.
              </p>
            </div>
            <Link to="/hr/create-job" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create New Job
            </Link>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job, index) => {
              const appCount = applications.filter((a) => a.jobId === job.id).length;
              const pendingCount = applications.filter(
                (a) => a.jobId === job.id && (a.status === "pending" || a.status === "reviewing")
              ).length;

              return (
                <div
                  key={job.id}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="badge-primary">{job.type}</span>
                        <span className="text-sm text-muted-foreground">{job.department}</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.techStack.slice(0, 4).map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-secondary text-sm rounded-lg">
                            {tech}
                          </span>
                        ))}
                        {job.techStack.length > 4 && (
                          <span className="px-2 py-1 bg-secondary text-sm rounded-lg text-muted-foreground">
                            +{job.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-lg font-bold">
                          <Users className="w-5 h-5 text-primary" />
                          {appCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Applicants</div>
                      </div>
                      {pendingCount > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{pendingCount}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                      )}
                      <Link
                        to={`/hr/applicants?job=${job.id}`}
                        className="btn-secondary inline-flex items-center gap-2"
                      >
                        View Applicants
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {jobs.length === 0 && (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Posted</h3>
              <p className="text-muted-foreground mb-6">
                Create your first job posting to start receiving applications.
              </p>
              <Link to="/hr/create-job" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Create New Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
