import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";
import { useAuth } from "@/contexts/AuthContext";

const Jobs = () => {
  const { jobs } = useJobs();
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="section-title mb-4">Available Positions</h1>
          <p className="section-subtitle mx-auto">
            Discover your next opportunity at Company X. We're always looking for talented individuals to join our team.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="glass-card-hover p-6 md:p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="badge-primary">{job.type}</span>
                    <span className="text-sm text-muted-foreground">{job.department}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-3">{job.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {job.techStack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-lg"
                      >
                        {tech}
                      </span>
                    ))}
                    {job.techStack.length > 5 && (
                      <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm rounded-lg">
                        +{job.techStack.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:ml-6">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn-secondary text-center whitespace-nowrap"
                  >
                    View Details
                  </Link>
                  {user?.role === "applicant" ? (
                    <Link
                      to={`/apply/${job.id}`}
                      className="btn-primary text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : !user ? (
                    <Link
                      to="/signin"
                      className="btn-primary text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
                    >
                      Sign In to Apply
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">No positions available</h3>
            <p className="text-muted-foreground">
              Check back later for new opportunities!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
