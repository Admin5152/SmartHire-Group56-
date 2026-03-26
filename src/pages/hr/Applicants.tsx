import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle, XCircle, ChevronDown, FileText, Briefcase, Star, CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_file_name: string;
  resume_text: string | null;
  ai_score: number;
  matched_skills: string[];
  status: string;
  applied_date: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  tech_stack: string[];
  created_by: string;
  is_external: boolean;
}

const Applicants = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"my" | "others">("my");
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*");

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
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs by ownership
  const myJobs = jobs.filter((job) => job.created_by === user?.id && !job.is_external);
  const otherJobs = jobs.filter((job) => job.created_by !== user?.id || job.is_external);
  const myJobIds = myJobs.map((j) => j.id);

  // Filter applications by job ownership
  const myApplications = applications.filter((app) => myJobIds.includes(app.job_id));
  const otherApplications = applications.filter((app) => !myJobIds.includes(app.job_id));

  const currentApplications = viewMode === "my" ? myApplications : otherApplications;

  const filteredApplications = currentApplications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = !filterJob || app.job_id === filterJob;
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  // Get jobs for filter dropdown based on view mode
  const filterJobOptions = viewMode === "my" ? myJobs : otherJobs;

  const openInterviewDialog = (application: Application) => {
    setSelectedApp(application);
    setInterviewDate("");
    setInterviewTime("");
    setInterviewDialogOpen(true);
  };

  const handleAcceptWithInterview = async () => {
    if (!selectedApp || !interviewDate || !interviewTime) {
      toast.error("Please set both a date and time for the interview.");
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "accepted",
          interview_date: interviewDate,
          interview_time: interviewTime,
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      // Create notification for applicant
      const job = jobs.find((j) => j.id === selectedApp.job_id);
      const formattedDate = new Date(interviewDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      
      await supabase.from("notifications").insert({
        user_id: selectedApp.applicant_id,
        type: "accepted",
        title: "🎉 Congratulations! You've Been Accepted",
        message: `Your application for "${job?.title}" has been accepted! Please come in for your in-person interview on ${formattedDate} at ${interviewTime}.`,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status: "accepted" } : app
        )
      );
      setInterviewDialogOpen(false);
      toast.success(`${selectedApp.applicant_name} has been accepted and notified of the interview!`);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  const handleReject = async (application: Application) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", application.id);

      if (error) throw error;

      // Create rejection notification
      const job = jobs.find((j) => j.id === application.job_id);
      await supabase.from("notifications").insert({
        user_id: application.applicant_id,
        type: "rejected",
        title: "Application Update",
        message: `Unfortunately, your application for "${job?.title}" was not selected at this time. We encourage you to apply for other positions.`,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "rejected" } : app
        )
      );
      toast.success(`${application.applicant_name} has been notified.`);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-primary bg-primary/10";
    if (score >= 40) return "text-amber-500 bg-amber-500/10";
    return "text-muted-foreground bg-secondary";
  };

  const highlightMatchedSkills = (text: string, matchedSkills: string[]) => {
    if (!text || !matchedSkills.length) return text;
    
    let highlightedText = text;
    matchedSkills.forEach((skill) => {
      const regex = new RegExp(`(${skill})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-success/30 text-success-foreground px-1 rounded font-semibold">$1</mark>'
      );
    });
    return highlightedText;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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

          {/* View Mode Toggle */}
          <div className="glass-card p-2 mb-6 inline-flex animate-fade-in-up">
            <button
              onClick={() => {
                setViewMode("my");
                setFilterJob("");
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "my"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Jobs ({myApplications.length})
            </button>
            <button
              onClick={() => {
                setViewMode("others");
                setFilterJob("");
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "others"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Other Jobs ({otherApplications.length})
            </button>
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
                  {filterJobOptions.map((job) => (
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
                const job = jobs.find((j) => j.id === app.job_id);
                const isExpanded = expandedId === app.id;
                const isOwnJob = myJobIds.includes(app.job_id);

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
                              {app.applicant_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{app.applicant_name}</h3>
                          <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                          <p className="text-sm mt-1">
                            Applied for <span className="font-medium">{job?.title}</span>
                          </p>
                        </div>

                        {/* Score */}
                        <div className={`px-4 py-2 rounded-xl ${getScoreColor(app.ai_score)}`}>
                          <div className="text-2xl font-bold">{app.ai_score}%</div>
                          <div className="text-xs">AI Score</div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === "accepted" 
                              ? "bg-success/10 text-success" 
                              : app.status === "rejected" 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isOwnJob && app.status === "pending" && (
                            <>
                              <button
                                onClick={() => openInterviewDialog(app)}
                                className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                                title="Accept & Schedule Interview"
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
                      {app.matched_skills && app.matched_skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="text-sm text-muted-foreground mr-2 flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Matched Skills:
                          </span>
                          {app.matched_skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-success/10 text-success text-xs rounded-lg font-medium">
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
                            <div 
                              className="p-4 rounded-xl bg-white/80 text-sm text-muted-foreground max-h-[300px] overflow-y-auto"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightMatchedSkills(app.resume_text || "No text extracted", app.matched_skills || [])
                              }}
                            />
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Star className="w-3 h-3 text-success" />
                              Highlighted words are skills that matched the job requirements
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Application Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Resume File</span>
                                <span className="font-medium">{app.resume_file_name}</span>
                              </div>
                              <div className="flex justify-between p-2 rounded-lg bg-white/80">
                                <span className="text-muted-foreground">Applied Date</span>
                                <span className="font-medium">
                                  {new Date(app.applied_date).toLocaleDateString()}
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
                              {!isOwnJob && (
                                <div className="flex justify-between p-2 rounded-lg bg-amber-500/10">
                                  <span className="text-amber-700">Note</span>
                                  <span className="font-medium text-amber-700">
                                    {job?.is_external ? "External application" : "From another HR's job"}
                                  </span>
                                </div>
                              )}
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
              {viewMode === "others" ? (
                <>
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications from Other Jobs</h3>
                  <p className="text-muted-foreground">
                    Applications for external jobs or jobs created by other HR users will appear here.
                  </p>
                </>
              ) : (
                <>
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applicants Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterJob || filterStatus
                      ? "Try adjusting your filters"
                      : "Applications will appear here as candidates apply"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
