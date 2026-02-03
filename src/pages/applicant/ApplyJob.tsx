import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { toast } from "sonner";

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, getJobById, applyForJob, getApplicationsByApplicant } = useJobs();

  const [selectedJobId, setSelectedJobId] = useState(jobId || "");
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const job = getJobById(selectedJobId);
  const existingApplications = getApplicationsByApplicant(user?.id || "");
  const hasApplied = existingApplications.some((app) => app.jobId === selectedJobId);

  const simulateAIAnalysis = (resumeText: string, techStack: string[]) => {
    // Simulate AI analysis - in production, this would be a real API call
    const matchedSkills: string[] = [];
    const resumeLower = resumeText.toLowerCase();

    techStack.forEach((tech) => {
      if (resumeLower.includes(tech.toLowerCase())) {
        matchedSkills.push(tech);
      }
    });

    // Calculate score based on matched skills
    const baseScore = (matchedSkills.length / techStack.length) * 100;
    const randomBonus = Math.random() * 15; // Add some variation
    const score = Math.min(Math.round(baseScore + randomBonus), 100);

    return { score, matchedSkills };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF or DOC file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJobId || !name || !file) {
      toast.error("Please fill in all fields and upload your resume");
      return;
    }

    if (hasApplied) {
      toast.error("You have already applied for this position");
      return;
    }

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      // Simulate file reading and OCR
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock extracted resume text
      const mockResumeText = `
        Experienced software developer with expertise in ${job?.techStack.slice(0, 3).join(", ")}.
        Strong background in web development and team collaboration.
        Proficient in JavaScript, TypeScript, React, Node.js, and various other technologies.
        5 years of experience building scalable applications.
      `;

      // Simulate AI analysis
      const { score, matchedSkills } = simulateAIAnalysis(mockResumeText, job?.techStack || []);

      setIsAnalyzing(false);

      applyForJob({
        jobId: selectedJobId,
        applicantId: user?.id || "",
        applicantName: name,
        applicantEmail: user?.email || "",
        resumeFileName: file.name,
        resumeText: mockResumeText,
        aiScore: score,
        matchedSkills,
      });

      toast.success("Application submitted successfully!");
      navigate("/applicant/dashboard");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="glass-card p-8 animate-fade-in-up">
            <h1 className="text-2xl font-bold mb-6">Apply for Position</h1>

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

              {/* Job Position */}
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a position</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} - {j.department}
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
                    {job.techStack.map((tech) => (
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
                    accept=".pdf,.doc,.docx"
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
                          PDF or DOC, max 5MB
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* AI Analysis Info */}
              <div className="p-4 rounded-xl bg-secondary/50 flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">AI-Powered Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Your resume will be analyzed against the job requirements using our AI system.
                    This helps match your skills with the position.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || hasApplied}
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
