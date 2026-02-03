import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, FileText, User, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";

const ApplicantDashboard = () => {
  const { user, isFirstLogin, setIsFirstLogin } = useAuth();
  const { getApplicationsByApplicant, notifications, getJobById } = useJobs();
  const [showWelcome, setShowWelcome] = useState(isFirstLogin);

  const applications = getApplicationsByApplicant(user?.id || "");
  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadNotifications = userNotifications.filter((n) => !n.read);

  useEffect(() => {
    if (isFirstLogin) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setIsFirstLogin(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFirstLogin, setIsFirstLogin]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "badge-success";
      case "rejected":
        return "badge-destructive";
      default:
        return "badge-primary";
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">🎉</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            We're excited to have you on board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your job applications and notifications.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: FileText, label: "Applications", value: applications.length, color: "text-primary" },
            { icon: Clock, label: "Pending", value: applications.filter((a) => a.status === "pending" || a.status === "reviewing").length, color: "text-primary" },
            { icon: CheckCircle, label: "Accepted", value: applications.filter((a) => a.status === "accepted").length, color: "text-success" },
            { icon: Bell, label: "Notifications", value: unreadNotifications.length, color: "text-primary" },
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
          {/* Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Applications</h2>
              <Link to="/jobs" className="text-primary hover:underline flex items-center gap-1 text-sm">
                Browse Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const job = getJobById(app.jobId);
                  return (
                    <div
                      key={app.id}
                      className="glass-card p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(app.status)}
                            <h3 className="font-semibold">{job?.title || "Unknown Position"}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Applied on {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(app.status)}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              AI Score: <span className="font-medium text-primary">{app.aiScore}%</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Resume</div>
                          <div className="text-sm font-medium">{app.resumeFileName}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying for jobs to see your applications here.
                </p>
                <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
                  Browse Jobs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Notifications & Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadNotifications.length > 0 && (
                  <span className="badge-primary">{unreadNotifications.length} new</span>
                )}
              </div>

              {userNotifications.length > 0 ? (
                <div className="space-y-3">
                  {userNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-xl ${!notification.read ? "bg-primary/5" : "bg-secondary/50"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "accepted"
                              ? "bg-success"
                              : notification.type === "rejected"
                              ? "bg-destructive"
                              : "bg-primary"
                          }`}
                        />
                        <div>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
