import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  department: string;
  location: string;
  type: string;
  posted_date: string;
  is_external?: boolean;
}

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_external", false)
        .order("posted_date", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
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
        <div className="text-center mb-6 md:mb-12 animate-fade-in-up">
          <h1 className="section-title mb-2 md:mb-4">Available Positions</h1>
          <p className="section-subtitle mx-auto">
            Discover your next opportunity at SmartHire. We're always looking for talented individuals to join our team.
          </p>
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className="glass-card-hover p-4 md:p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{job.type}</span>
                      <span className="text-sm text-muted-foreground">{job.department}</span>
                    </div>
                    
                    <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-3">{job.title}</h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Posted {new Date(job.posted_date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Tech Stack */}
                    {job.tech_stack && job.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.tech_stack.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-lg"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.tech_stack.length > 5 && (
                          <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm rounded-lg">
                            +{job.tech_stack.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
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
        ) : (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
