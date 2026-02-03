import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, Users, PlusCircle, ArrowRight, Edit, Trash2, X, Check } from "lucide-react";
import { useJobs, Job } from "@/contexts/JobsContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManageJobs = () => {
  const { jobs, applications, updateJob, deleteJob } = useJobs();
  const { user } = useAuth();
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Job>>({});

  // Filter jobs created by this HR user
  const myJobs = jobs.filter((job) => job.createdBy === user?.id);

  const handleStartEdit = (job: Job) => {
    setEditingJobId(job.id);
    setEditForm({
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      type: job.type,
    });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setEditForm({});
  };

  const handleSaveEdit = (jobId: string) => {
    if (!editForm.title || !editForm.description || !editForm.department || !editForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateJob(jobId, editForm);
    setEditingJobId(null);
    setEditForm({});
    toast.success("Job updated successfully!");
  };

  const handleDeleteConfirm = () => {
    if (deleteJobId) {
      deleteJob(deleteJobId);
      toast.success("Job deleted successfully!");
      setDeleteJobId(null);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Manage Jobs</h1>
              <p className="text-muted-foreground">
                View and manage your job postings.
              </p>
            </div>
            <Link to="/hr/create-job" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create New Job
            </Link>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {myJobs.map((job, index) => {
              const appCount = applications.filter((a) => a.jobId === job.id).length;
              const pendingCount = applications.filter(
                (a) => a.jobId === job.id && (a.status === "pending" || a.status === "reviewing")
              ).length;
              const isEditing = editingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Department</label>
                          <input
                            type="text"
                            value={editForm.department || ""}
                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <input
                            type="text"
                            value={editForm.location || ""}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={editForm.type || "Full-time"}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Job["type"] })}
                            className="input-field"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="input-field min-h-[100px]"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary inline-flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(job.id)}
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(job)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            title="Edit Job"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteJobId(job.id)}
                            className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  )}
                </div>
              );
            })}
          </div>

          {myJobs.length === 0 && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This will also remove all applications for this position. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageJobs;
