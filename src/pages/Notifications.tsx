import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Navbar from "../components/UsersNavbar";
import Sidebar from "../components/Sidebar";
import { useUser } from "@clerk/clerk-react";
import { Bell, CheckCircle, AlertTriangle, Trash2, Search } from "lucide-react";
import { formatTimeAgo } from "./utils/convexUtils";

interface Notification {
  id: any;
  notif_content: string;
  is_read?: boolean;
  created_at?: number;
}

const Notifications: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRecord = useQuery(
    api.userQueries.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      navigate("/sign-in");
      return;
    }

    if (userRecord) {
      setUserId(userRecord._id);
      setIsLoading(false);
    } else if (userRecord === undefined) {
      return;
    } else {
      setError("Could not retrieve your user data. Please log in again.");
      localStorage.removeItem("user");
      navigate("/sign-in");
    }
  }, [isLoaded, clerkUser, userRecord, navigate]);

  const notificationsRaw =
    useQuery(api.notifications.getUserNotifications, userId ? { userId: userId as any } : "skip") ?? [];

  const notifications: Notification[] = notificationsRaw.map((n: any) => ({
    id: n._id ?? n.id,
    notif_content: n.notif_content ?? n.content,
    is_read: n.is_read ?? n.isRead ?? false,
    created_at: n.created_at ?? n.createdAt ?? null,
  }));

  const markAsReadMutation = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsReadMutation = useMutation(api.notifications.markAllNotificationsAsRead);
  const deleteNotificationMutation = useMutation(api.notifications.deleteNotification);

  const markAsRead = async (id: any) => {
    try {
      await markAsReadMutation({ notificationId: id });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await markAllAsReadMutation({ userId: userId as any });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: any) => {
    try {
      await deleteNotificationMutation({ notificationId: id });
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Filter & Sort =====
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) =>
      n.notif_content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications, searchTerm]);

  // ===== Loading & Error States =====
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 animate-bounce text-teal-500" />
          Loading notifications...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/sign-in")}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  // ===== MAIN CONTENT =====
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Navbar */}
      <div className="w-full flex-none h-[8vh] md:h-[13vh]">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static md:w-64`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Stay updated with your latest account activities
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 text-sm"
                />
                <Search className="absolute h-4 w-4 text-gray-400 ml-3" />
                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-teal-100 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Table-like List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <tr
                        key={notification.id}
                        className={`transition-all hover:bg-gray-50 ${
                          notification.is_read ? "" : "bg-teal-50"
                        }`}
                      >
                        <td className="px-3 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              notification.is_read
                                ? "bg-gray-100 text-gray-700"
                                : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            {notification.is_read ? "Read" : "New"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-800">{notification.notif_content}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {notification.created_at ? formatTimeAgo(notification.created_at) : ""}
                        </td>
                        <td className="px-3 py-4 flex justify-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-teal-600 hover:text-teal-800 p-1.5 rounded-full hover:bg-teal-100 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
