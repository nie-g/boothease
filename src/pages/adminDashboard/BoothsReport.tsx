import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { FileSpreadsheet, FileText } from "lucide-react";

import { exportBoothToPDF } from "../utils/exportBoothsToPdf";
import { exportBoothToExcel } from "../utils/exportBoothsToExcel";

const AdminBoothReports: React.FC = () => {
  // ✅ Fetch all booths
  const booths = useQuery(api.booths.listAllBoothsWithOwner) || [];

  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Filter booths by status
  const filteredBooths = useMemo(() => {
    if (statusFilter === "all") return booths;
    return booths.filter((b: any) => b.status === statusFilter);
  }, [booths, statusFilter]);

  // ✅ Format for table and export
  const formattedData = filteredBooths.map((b: any) => ({
    boothId: b._id,
    name: b.name ?? "Untitled Booth",
    owner: b.ownerName ?? "Unknown",
    location: b.location ?? "N/A",
    price: b.price ? `₱${b.price}` : "N/A",
    status: b.status ?? "N/A",
    createdAt: new Date(b._creationTime).toLocaleDateString(),
  }));

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
                  Booth Reports
                </h1>
                <p className="text-gray-600">
                  View and export all booth records
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  title="Export PDF"
                  aria-label="Export PDF"
                  onClick={() => exportBoothToPDF(formattedData, "Booth_Report")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:border-orange-300 hover:text-white transition"
                >
                  <FileText size={18} /> Export as PDF
                </button>
                <button
                  title="Export Excel"
                  aria-label="Export Excel"
                  type="button"
                  onClick={() => exportBoothToExcel(formattedData, "Booth_Report")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:border-orange-300 hover:text-white transition"
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
              {["all", "available", "reserved", "occupied", "maintenance"].map(
                (status) => (
                  <button
                    key={status}
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
              Total Booths:{" "}
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
              <p className="text-gray-600">No booths found</p>
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
                        "Booth Name",
                        "Owner",
                        "Location",
                        "Price",
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
                    {formattedData.map((b, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{b.name}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{b.owner}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{b.location}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{b.price}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              b.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : b.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : b.status === "occupied"
                                ? "bg-blue-100 text-blue-800"
                                : b.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : b.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {b.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                exportBoothToPDF([b], `Booth_${idx + 1}`)
                              }
                              className="px-3 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() =>
                                exportBoothToExcel([b], `Booth_${idx + 1}`)
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
                {formattedData.map((b, idx) => (
                  <div
                    key={idx}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        Booth #{idx + 1}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "available"
                            ? "bg-green-100 text-green-800"
                            : b.status === "reserved"
                            ? "bg-yellow-100 text-yellow-800"
                            : b.status === "occupied"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "maintenance"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Name:</span> {b.name}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span> {b.owner}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {b.location}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> {b.price}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {b.createdAt}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() =>
                          exportBoothToPDF([b], `Booth_${idx + 1}`)
                        }
                        className="flex-1 px-3 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() =>
                          exportBoothToExcel([b], `Booth_${idx + 1}`)
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

export default AdminBoothReports;
