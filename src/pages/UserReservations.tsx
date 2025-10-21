import React from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Sidebar from "../components/Sidebar";
import TestNavbar from "../components/TestNavbar";
import dayjs from "dayjs";
import { Calendar, MapPin, Eye, XCircle } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const UserDashboard: React.FC = () => {
  const { user } = useUser();

  const dbUser = useQuery(
    api.userQueries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const reservations = useQuery(
    api.reservations.getByRenter,
    dbUser?._id ? { renterId: dbUser._id } : "skip"
  );

  const cancelReservation = useMutation(api.reservations.cancelReservation);

  const handleCancel = async (reservationId: Id<"reservations">) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await cancelReservation({ reservationId });
        alert("Reservation cancelled successfully.");
      } catch (err) {
        console.error(err);
        alert("Failed to cancel reservation.");
      }
    }
  };

  if (dbUser === undefined) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      {/* Navbar */}
      <div className="w-full flex-none h-[13vh]">
        <TestNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/6 min-w-[220px] bg-white/60 backdrop-blur-sm border-r border-gray-200">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* =======================
                Reservations Table
            ======================== */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">
                  My Reservations
                </h1>
                <p className="text-sm text-gray-500">
                  View and manage your booth reservations.
                </p>
              </div>

              {!reservations ? (
                <p className="text-gray-500 text-center mt-10">
                  Loading reservations...
                </p>
              ) : reservations.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  You have no reservations yet.
                </p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#FFF9E9] text-gray-800 font-semibold">
                      <tr>
                        <th className="px-3 py-3 border-b">Booth</th>
                        <th className="px-3 py-3 border-b">Event</th>
                        <th className="px-3 py-3 border-b">Date Range</th>
                        <th className="px-3 py-3 border-b">Location</th>
                        <th className="px-3 py-3 border-b">Total Price</th>
                        <th className="px-3 py-3 border-b">Status</th>
                        <th className="px-3 py-3 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r: any) => (
                        <tr
                          key={r._id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0"
                        >
                          <td className="px-3 py-3 font-medium text-gray-800">
                            {r.booth?.name || "Booth"}
                          </td>
                          <td className="px-3 py-3">
                            {r.booth?.event?.title || "Event"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {dayjs(r.startDate).format("MMM D, YYYY")} - {" "}
                              {dayjs(r.endDate).format("MMM D, YYYY")}
                            </div>
                          </td>
                          <td className="px-3 py-3 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            {r.booth?.location || "N/A"}
                          </td>
                          <td className="px-3 py-3">
                            ₱{r.totalPrice?.toLocaleString()}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  r.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : r.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.status.charAt(0).toUpperCase() +
                                  r.status.slice(1)}
                              </span>
                             
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  alert("View reservation details")
                                }
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                              >
                                <Eye size={16} /> View
                              </button>
                              {r.status === "pending" && (
                                <button
                                  onClick={() => handleCancel(r._id)}
                                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                                >
                                  <XCircle size={16} /> Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
