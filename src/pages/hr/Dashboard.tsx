import { Link } from "react-router-dom";
import { Users, Briefcase, FileText, TrendingUp, PlusCircle, ArrowRight } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";
import { useAuth } from "@/contexts/AuthContext";

const HRDashboard = () => {
  const { user } = useAuth();
  const { jobs, applications } = useJobs();

  const pendingApplications = applications.filter((a) => a.status === "pending" || a.status === "reviewing");
  const acceptedApplications = applications.filter((a) => a.status === "accepted");
  const averageScore = applications.length > 0
    ? Math.round(applications.reduce((sum, a) => sum + a.aiScore, 0) / applications.length)
    : 0;

  // Get top candidates (highest AI scores)
  const topCandidates = [...applications]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">HR Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's your hiring overview.
            </p>
          </div>
          <Link to="/hr/create-job" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Briefcase, label: "Open Positions", value: jobs.length, color: "text-primary" },
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
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
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
                  const job = jobs.find((j) => j.id === app.jobId);
                  return (
                    <div
                      key={app.id}
                      className="glass-card p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {app.applicantName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{app.applicantName}</h3>
                              <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied for <span className="font-medium">{job?.title}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {app.matchedSkills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-lg">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            app.aiScore >= 70 ? "text-success" : app.aiScore >= 50 ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {app.aiScore}%
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
                        <div className="font-medium truncate">{candidate.applicantName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {jobs.find((j) => j.id === candidate.jobId)?.title}
                        </div>
                      </div>
                      <div className="font-semibold text-success">{candidate.aiScore}%</div>
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
                <h2 className="text-lg font-semibold">Open Positions</h2>
                <Link to="/hr/jobs" className="text-primary text-sm hover:underline">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {jobs.slice(0, 4).map((job) => {
                  const appCount = applications.filter((a) => a.jobId === job.id).length;
                  return (
                    <div key={job.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                      <div>
                        <div className="font-medium text-sm">{job.title}</div>
                        <div className="text-xs text-muted-foreground">{job.department}</div>
                      </div>
                      <span className="badge-primary">{appCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
