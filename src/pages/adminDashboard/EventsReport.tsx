import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { FileSpreadsheet, FileText } from "lucide-react";

import { exportEventToPDF } from "../utils/exportEventsToPdf";
import { exportEventToExcel } from "../utils/exportEventsToExcel";

const AdminEventReports: React.FC = () => {
  // ✅ Fetch all events with organizer details
  const events = useQuery(api.events.listAllEventsWithOrganizer) || [];

  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Filter events by status
  const filteredEvents = useMemo(() => {
    if (statusFilter === "all") return events;
    return events.filter((e: any) => e.status === statusFilter);
  }, [events, statusFilter]);

  // ✅ Format for table and export
  const formattedData = filteredEvents.map((e: any) => {
    // ✅ Organizer Name from createdBy user
    const organizer = e.organizerName || "Unknown";

    // ✅ Combined Date Range
    const startDate = e.startDate
      ? new Date(e.startDate).toLocaleDateString()
      : "N/A";
    const endDate = e.endDate
      ? new Date(e.endDate).toLocaleDateString()
      : "N/A";
    const dateRange = startDate === "N/A" ? "N/A" : startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    return {
      eventId: e._id,
      name: e.title ?? "Untitled Event",
      organizer,
      location:
        typeof e.location === "object" && e.location !== null
          ? e.location.address ?? "N/A"
          : e.location ?? "N/A",
      dateRange,
      startDate,
      endDate,
      status: e.status ?? "N/A",
      createdAt: new Date(e._creationTime).toLocaleDateString(),
    };
  });


  return (
    <main>
      <motion.div
        className="bg-white shadow-md rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="p-6 bg-white rounded-lg border border-slate-50 shadow-md w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Event Reports
                </h1>
                <p className="text-gray-600">
                  View and export all event records
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  title="Export PDF"
                  aria-label="Export PDF"
                  onClick={() => exportEventToPDF(formattedData, "Event_Report")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:text-white  hover:border-orange-300 transition"
                >
                  <FileText size={18} /> Export as PDF
                </button>
                <button
                  title="Export Excel"
                  aria-label="Export Excel"
                  type="button"
                  onClick={() =>
                    exportEventToExcel(formattedData, "Event_Report")
                  }
                   className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:text-white  hover:border-orange-300 transition"
                  >
                  <FileSpreadsheet size={18} /> Export as Excel
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-sm font-medium">Filter by Status:</span>
              </div>
              {["all", "upcoming", "ongoing", "completed", "cancelled"].map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      statusFilter === status
                        ? "bg-orange-300 text-white border-orange-300"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 text-sm text-gray-600">
              Total Events:{" "}
              <span className="font-semibold text-gray-900">
                {formattedData.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-slate-50 shadow-md overflow-hidden w-full">
          {formattedData.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No events found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "#",
                        "Event Name",
                        "Organizer",
                        "Location",
                        "Date Range",
                        "Status",
                        "Date Created",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formattedData.map((e, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{e.name}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{e.organizer}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{e.location}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{e.dateRange}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              e.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : e.status === "ongoing"
                                ? "bg-blue-100 text-blue-800"
                                : e.status === "upcoming"
                                ? "bg-yellow-100 text-yellow-800"
                                : e.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {e.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                exportEventToPDF([e], `Event_${idx + 1}`)
                              }
                              className="px-3 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                exportEventToExcel([e], `Event_${idx + 1}`)
                              }
                              className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                            >
                              Excel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                {formattedData.map((e, idx) => (
                  <div
                    key={idx}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        Event #{idx + 1}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          e.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : e.status === "ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : e.status === "upcoming"
                            ? "bg-yellow-100 text-yellow-800"
                            : e.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Name:</span> {e.name}
                      </div>
                      <div>
                        <span className="font-medium">Organizer:</span>{" "}
                        {e.organizer}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {e.location}
                      </div>
                      <div>
                        <span className="font-medium">Date Range:</span>{" "}
                        {e.dateRange}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {e.createdAt}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          exportEventToPDF([e], `Event_${idx + 1}`)
                        }
                        className="flex-1 px-3 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          exportEventToExcel([e], `Event_${idx + 1}`)
                        }
                        className="flex-1 px-3 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
};

export default AdminEventReports;
