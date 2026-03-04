import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleAddRequirement = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput("");
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !department || !location || techStack.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("jobs").insert({
        title,
        description,
        department,
        location,
        type,
        tech_stack: techStack,
        requirements: requirements.length > 0 ? requirements : ["No specific requirements listed"],
        created_by: user?.id,
        is_external: false,
      });

      if (error) throw error;

      toast.success("Job created successfully!");
      navigate("/hr/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="glass-card p-4 md:p-8 animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Create New Job</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[120px]"
                  placeholder="Describe the role, responsibilities, and what makes it exciting..."
                />
              </div>

              {/* Department & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Remote / Accra"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Job Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium mb-2">Tech Stack *</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                    className="input-field flex-1"
                    placeholder="e.g., React, TypeScript..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="btn-secondary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium mb-2">Requirements</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRequirement())}
                    className="input-field flex-1"
                    placeholder="e.g., 3+ years of experience..."
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="btn-secondary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className="p-3 bg-secondary/50 rounded-lg flex items-start justify-between gap-3"
                    >
                      <span className="text-sm">{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(req)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Job"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
