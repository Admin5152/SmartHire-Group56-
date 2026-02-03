import { createContext, useContext, useState, ReactNode } from "react";

export interface Job {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  requirements: string[];
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Internship" | "Contract";
  postedDate: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeFileName: string;
  resumeText: string;
  aiScore: number;
  matchedSkills: string[];
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "accepted" | "rejected" | "news" | "info";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface JobsContextType {
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  addJob: (job: Omit<Job, "id" | "postedDate">) => void;
  applyForJob: (application: Omit<Application, "id" | "appliedDate" | "status">) => void;
  updateApplicationStatus: (applicationId: string, status: Application["status"], message?: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (notificationId: string) => void;
  getJobById: (id: string) => Job | undefined;
  getApplicationsByApplicant: (applicantId: string) => Application[];
  getApplicationsByJob: (jobId: string) => Application[];
}

const JobsContext = createContext<JobsContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};

const initialJobs: Job[] = [];

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addJob = (job: Omit<Job, "id" | "postedDate">) => {
    const newJob: Job = {
      ...job,
      id: Math.random().toString(36).substr(2, 9),
      postedDate: new Date().toISOString().split("T")[0],
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const applyForJob = (application: Omit<Application, "id" | "appliedDate" | "status">) => {
    const newApplication: Application = {
      ...application,
      id: Math.random().toString(36).substr(2, 9),
      appliedDate: new Date().toISOString(),
      status: "pending",
    };
    setApplications((prev) => [...prev, newApplication]);
    
    // Add notification for applicant
    addNotification({
      userId: application.applicantId,
      type: "info",
      title: "Application Submitted",
      message: `Your application for ${jobs.find(j => j.id === application.jobId)?.title} has been received. We'll review it shortly.`,
    });
  };

  const updateApplicationStatus = (applicationId: string, status: Application["status"], message?: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status } : app
      )
    );

    const application = applications.find((app) => app.id === applicationId);
    if (application) {
      const job = jobs.find((j) => j.id === application.jobId);
      addNotification({
        userId: application.applicantId,
        type: status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "info",
        title: status === "accepted" ? "Congratulations! 🎉" : status === "rejected" ? "Application Update" : "Status Update",
        message: message || `Your application for ${job?.title} has been ${status}.`,
      });
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const getJobById = (id: string) => jobs.find((job) => job.id === id);

  const getApplicationsByApplicant = (applicantId: string) =>
    applications.filter((app) => app.applicantId === applicantId);

  const getApplicationsByJob = (jobId: string) =>
    applications.filter((app) => app.jobId === jobId);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        notifications,
        addJob,
        applyForJob,
        updateApplicationStatus,
        addNotification,
        markNotificationRead,
        getJobById,
        getApplicationsByApplicant,
        getApplicationsByJob,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};
