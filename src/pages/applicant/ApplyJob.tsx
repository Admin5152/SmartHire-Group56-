import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [existingApplications, setExistingApplications] = useState<string[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || "");
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Custom job fields for external applications
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [customJobDepartment, setCustomJobDepartment] = useState("");
  const [customJobLocation, setCustomJobLocation] = useState("");
  const [customJobType, setCustomJobType] = useState<string>("Full-time");
  const [customTechStack, setCustomTechStack] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch existing applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("job_id")
        .eq("applicant_id", user.id);

      if (appsError) throw appsError;
      setExistingApplications(appsData?.map((a) => a.job_id) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const job = jobs.find((j) => j.id === selectedJobId);
  const hasApplied = existingApplications.includes(selectedJobId);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeResume = async (file: File, techStack: string[]) => {
    const fileBase64 = await fileToBase64(file);
    
    const { data, error } = await supabase.functions.invoke('analyze-resume', {
      body: {
        fileBase64,
        fileType: file.type,
        fileName: file.name,
        techStack,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to analyze resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'Resume analysis failed');
    }

    return {
      extractedText: data.extractedText,
      matchedSkills: data.matchedSkills,
      score: data.score,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, DOC, or image file");
        return;
      }
      // Increased file size limit to 10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcrError(null);

    if (!name || !file) {
      toast.error("Please fill in all fields and upload your resume");
      return;
    }

    if (!isCustomJob && !selectedJobId) {
      toast.error("Please select a position or create a custom application");
      return;
    }

    if (!isCustomJob && hasApplied) {
      toast.error("You have already applied for this position");
      return;
    }

    if (isCustomJob && (!customJobTitle || !customJobDescription || !customJobDepartment)) {
      toast.error("Please fill in all job details");
      return;
    }

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      let jobIdToApply = selectedJobId;
      let techStackToAnalyze: string[] = [];

      // If custom job, create the job first
      if (isCustomJob) {
        const techStackArray = customTechStack.split(",").map((s) => s.trim()).filter(Boolean);
        techStackToAnalyze = techStackArray;

        const { data: newJob, error: jobError } = await supabase
          .from("jobs")
          .insert({
            title: customJobTitle,
            description: customJobDescription,
            department: customJobDepartment,
            location: customJobLocation || "Remote",
            type: customJobType,
            tech_stack: techStackArray,
            requirements: techStackArray,
            created_by: user!.id,
            is_external: true,
          })
          .select()
          .single();

        if (jobError) throw jobError;
        jobIdToApply = newJob.id;
      } else {
        techStackToAnalyze = job?.tech_stack || [];
      }

      // Analyze resume
      const { extractedText, matchedSkills, score } = await analyzeResume(
        file,
        techStackToAnalyze
      );

      setIsAnalyzing(false);

      // Create application
      const { error: appError } = await supabase.from("applications").insert({
        job_id: jobIdToApply,
        applicant_id: user!.id,
        applicant_name: name,
        applicant_email: user!.email,
        resume_file_name: file.name,
        resume_text: extractedText,
        ai_score: score,
        matched_skills: matchedSkills,
        status: "pending",
      });

      if (appError) throw appError;

      toast.success("Application submitted successfully!");
      navigate("/applicant/applications");
    } catch (error) {
      console.error("Application error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit application";
      setOcrError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to apply for jobs.
          </p>
          <Link to="/signin" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="glass-card p-4 md:p-8 animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Apply for Position</h1>

            {/* Toggle between existing job and custom job */}
            <div className="glass-card p-2 mb-6 inline-flex">
              <button
                type="button"
                onClick={() => setIsCustomJob(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isCustomJob
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Apply to Listed Job
              </button>
              <button
                type="button"
                onClick={() => setIsCustomJob(true)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isCustomJob
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plus className="w-4 h-4" />
                Custom Application
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              {/* Email (auto-filled) */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field bg-secondary/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is your account email
                </p>
              </div>

              {isCustomJob ? (
                <>
                  {/* Custom Job Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Frontend Developer"
                    />
                  </div>

                  {/* Custom Job Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description *</label>
                    <textarea
                      value={customJobDescription}
                      onChange={(e) => setCustomJobDescription(e.target.value)}
                      className="input-field min-h-[100px]"
                      placeholder="Describe the role you're applying for..."
                    />
                  </div>

                  {/* Custom Department */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Department *</label>
                    <input
                      type="text"
                      value={customJobDepartment}
                      onChange={(e) => setCustomJobDepartment(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Engineering"
                    />
                  </div>

                  {/* Custom Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={customJobLocation}
                      onChange={(e) => setCustomJobLocation(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Remote, Accra"
                    />
                  </div>

                  {/* Custom Job Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Type</label>
                    <select
                      value={customJobType}
                      onChange={(e) => setCustomJobType(e.target.value)}
                      className="input-field"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  {/* Custom Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={customTechStack}
                      onChange={(e) => setCustomTechStack(e.target.value)}
                      className="input-field"
                      placeholder="e.g., React, TypeScript, Node.js"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your resume will be analyzed against these skills
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Custom applications will appear in the "Other Jobs" section for HR review.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Job Position */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select a position</option>
                      {jobs.filter(j => !j.is_external).map((j) => (
                        <option key={j.id} value={j.id} disabled={existingApplications.includes(j.id)}>
                          {j.title} - {j.department} {existingApplications.includes(j.id) ? "(Already Applied)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Job Info */}
                  {job && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h3 className="font-semibold mb-2">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{job.description.slice(0, 150)}...</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tech_stack?.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-white text-xs rounded-lg">
                            {tech}
                          </span>
                        ))}
                      </div>
                      {hasApplied && (
                        <div className="mt-3 p-2 bg-destructive/10 rounded-lg text-destructive text-sm">
                          You have already applied for this position
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Resume</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    file ? "border-success bg-success/5" : "border-border hover:border-primary"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-12 h-12 text-success" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          Click to change file
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <span className="font-medium">Upload your resume</span>
                        <span className="text-sm text-muted-foreground">
                          PDF, DOC, or image files, max 10MB
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* OCR Error Display */}
              {ocrError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-destructive">Resume Analysis Failed</h4>
                    <p className="text-xs text-destructive/80">{ocrError}</p>
                  </div>
                </div>
              )}

              {/* AI Analysis Info */}
              <div className="p-4 rounded-xl bg-secondary/50 flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">AI-Powered OCR Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Your resume will be scanned using OCR technology to extract text, then analyzed 
                    against the job requirements to match your skills with the position.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!isCustomJob && hasApplied)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isAnalyzing ? "Analyzing Resume..." : "Submitting..."}
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
