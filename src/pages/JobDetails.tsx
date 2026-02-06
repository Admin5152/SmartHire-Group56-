import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, ArrowLeft, ArrowRight, CheckCircle, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Job {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  requirements: string[];
  department: string;
  location: string;
  type: string;
  posted_date: string;
}

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await api.getJob(id!);
      if (error) throw new Error(error);
      setJob(data?.job || null);
    } catch (error) {
      console.error("Error fetching job:", error);
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

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-xl">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Job not found</h3>
          <p className="text-muted-foreground mb-6">
            The position you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/jobs" className="btn-primary inline-flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>

          {/* Job Header */}
          <div className="glass-card p-8 mb-8 animate-fade-in-up transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{job.type}</span>
              <span className="text-sm text-muted-foreground">{job.department}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Posted {new Date(job.posted_date).toLocaleDateString()}
              </span>
            </div>

            {user?.role === "applicant" ? (
              <Link
                to={`/apply/${job.id}`}
                className="btn-primary inline-flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                Apply for this Position
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : !user ? (
              <Link
                to="/signin"
                className="btn-primary inline-flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                Sign In to Apply
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : null}
          </div>

          {/* Job Description */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="glass-card p-8 animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{ animationDelay: "100ms" }}>
                <h2 className="text-xl font-semibold mb-4">About this Role</h2>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="glass-card p-8 animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{ animationDelay: "200ms" }}>
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {job.tech_stack && job.tech_stack.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{ animationDelay: "300ms" }}>
                  <h2 className="text-lg font-semibold mb-4">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-card p-6 animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{ animationDelay: "400ms" }}>
                <h2 className="text-lg font-semibold mb-4">Quick Info</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{job.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{job.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
