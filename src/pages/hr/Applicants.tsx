import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Eye, ChevronDown, FileText } from "lucide-react";
import { useJobs, Application } from "@/contexts/JobsContext";
import { toast } from "sonner";

const Applicants = () => {
  const { jobs, applications, updateApplicationStatus } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort applications by AI score (highest first)
  const sortedApplications = [...applications].sort((a, b) => b.aiScore - a.aiScore);

  const filteredApplications = sortedApplications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = !filterJob || app.jobId === filterJob;
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  const handleAccept = (application: Application) => {
    updateApplicationStatus(
      application.id,
      "accepted",
      `Congratulations! We're pleased to inform you that your application for ${jobs.find((j) => j.id === application.jobId)?.title} has been accepted. Our team will contact you soon with next steps.`
    );
    toast.success(`${application.applicantName} has been accepted!`);
  };

  const handleReject = (application: Application) => {
    updateApplicationStatus(
      application.id,
      "rejected",
      `Thank you for your interest in the ${jobs.find((j) => j.id === application.jobId)?.title} position. After careful consideration, we've decided to move forward with other candidates. We encourage you to apply for future opportunities.`
    );
    toast.success(`${application.applicantName} has been notified.`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-primary bg-primary/10";
    if (score >= 40) return "text-amber-500 bg-amber-500/10";
    return "text-muted-foreground bg-secondary";
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">All Applicants</h1>
            <p className="text-muted-foreground">
              Review and manage job applications. Candidates are ranked by AI score.
            </p>
          </div>

          {/* Filters */}
          <div className="glass-card p-4 mb-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  className="input-field min-w-[180px]"
                >
                  <option value="">All Positions</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field min-w-[150px]"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applicants List */}
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app, index) => {
                const job = jobs.find((j) => j.id === app.jobId);
                const isExpanded = expandedId === app.id;

                return (
                  <div
                    key={app.id}
                    className="glass-card overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Main Row */}
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Rank & Avatar */}
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            #{index + 1}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {app.applicantName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{app.applicantName}</h3>
                          <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                          <p className="text-sm mt-1">
                            Applied for <span className="font-medium">{job?.title}</span>
                          </p>
                        </div>

                        {/* Score */}
                        <div className={`px-4 py-2 rounded-xl ${getScoreColor(app.aiScore)}`}>
                          <div className="text-2xl font-bold">{app.aiScore}%</div>
                          <div className="text-xs">AI Score</div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                          <span className={`badge-${
                            app.status === "accepted" ? "success" : app.status === "rejected" ? "destructive" : "primary"
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(app)}
                                className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                                title="Accept"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(app)}
                                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : app.id)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            title="View Details"
                          >
                            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Matched Skills */}
                      {app.matchedSkills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="text-sm text-muted-foreground mr-2">Matched Skills:</span>
                          {app.matchedSkills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-success/10 text-success text-xs rounded-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-border p-6 bg-secondary/30 animate-fade-in">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Resume Text (OCR Extracted)
                            </h4>
                            <div className="p-4 rounded-xl bg-white/80 text-sm text-muted-foreground whitespace-pre-wrap">
                              {app.resumeText}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Application Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Resume File</span>
                                <span className="font-medium">{app.resumeFileName}</span>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Applied Date</span>
                                <span className="font-medium">
                                  {new Date(app.appliedDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Position</span>
                                <span className="font-medium">{job?.title}</span>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Department</span>
                                <span className="font-medium">{job?.department}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applicants Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterJob || filterStatus
                  ? "Try adjusting your filters"
                  : "Applications will appear here as candidates apply"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
