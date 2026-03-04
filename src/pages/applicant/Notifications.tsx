import { Bell, CheckCircle, XCircle, Info, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useJobs();

  const userNotifications = notifications.filter((n) => n.userId === user?.id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "accepted":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-destructive" />;
      case "news":
        return <Megaphone className="w-6 h-6 text-primary" />;
      default:
        return <Info className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on your application status and company news.
            </p>
          </div>

          {userNotifications.length > 0 ? (
            <div className="space-y-4">
              {userNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className={`notification-card cursor-pointer animate-fade-in-up ${
                    !notification.read ? "ring-2 ring-primary/20" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">{notification.title}</h3>
                        <p className="text-muted-foreground text-sm">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                You'll receive notifications here when there are updates on your applications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
