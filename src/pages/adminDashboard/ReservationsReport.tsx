import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { FileSpreadsheet, FileText } from "lucide-react";

import { exportReservationToPDF } from "../utils/exportReservationToPdf";
import { exportReservationToExcel } from "../utils/exportReservationToExcel";

const AdminReservationReports: React.FC = () => {
  // ✅ Fetch all booth reservations with details (booth, owner, amount)
  const reservations = useQuery(api.reservations.listAllReservationsWithDetails) || [];

  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Filter reservations by status
  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservations;
    return reservations.filter((r: any) => r.status === statusFilter);
  }, [reservations, statusFilter]);

  // ✅ Format for table and export
  const formattedData = filteredReservations.map((r: any) => {
    // ✅ Format amount with Philippine Peso
    let amountValue = 0;
    if (r.totalAmount) {
      const cleanAmount = r.totalAmount.toString().replace(/[₱,]/g, "").trim();
      amountValue = parseFloat(cleanAmount) || 0;
    }

    const totalAmount = amountValue > 0
      ? `₱${amountValue.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

    return {
      reservationId: r._id,
      owner: r.ownerName || "Unknown",
      booth: r.boothName || "Unknown",
      startDate: r.startDate
        ? new Date(r.startDate).toLocaleDateString()
        : "N/A",
      endDate: r.endDate ? new Date(r.endDate).toLocaleDateString() : "N/A",
      status: r.status,
      paymentStatus: r.paymentStatus || "Pending",
      totalAmount,
      createdAt: new Date(r._creationTime).toLocaleDateString(),
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
                  Booth Reservation Reports
                </h1>
                <p className="text-gray-600">
                  View and export all booth reservations
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  title="Export PDF"
                  aria-label="Export PDF"
                  onClick={() =>
                    exportReservationToPDF(formattedData, "Reservation_Report")
                  }
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:text-white hover:border-orange-300 transition"
                >
                  <FileText size={18} /> Export as PDF
                </button>
                <button
                  title="Export Excel"
                  aria-label="Export Excel"
                  type="button"
                  onClick={() =>
                    exportReservationToExcel(formattedData, "Reservation_Report")
                  }
                   className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-300 border border-orange-300 rounded-lg hover:bg-orange-300 hover:text-white hover:border-orange-300 transition"
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
              {["all", "pending", "approved", "declined", "cancelled"].map(
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
              Total Reservations:{" "}
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
              <p className="text-gray-600">No reservations found</p>
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
                        "Owner",
                        "Booth",
                        "Start Date",
                        "End Date",
                        "Payment",
                        "Total Amount",
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
                    {formattedData.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="e">{r.owner}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{r.booth}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{r.startDate}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{r.endDate}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{r.paymentStatus}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">{r.totalAmount}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-gray-700">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              r.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : r.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : r.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {r.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                exportReservationToPDF([r], `Reservation_${idx + 1}`)
                              }
                              className="px-3 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                exportReservationToExcel(
                                  [r],
                                  `Reservation_${idx + 1}`
                                )
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
                {formattedData.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        Reservation #{idx + 1}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : r.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : r.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Owner:</span> {r.owner}
                      </div>
                      <div>
                        <span className="font-medium">Booth:</span> {r.booth}
                      </div>
                      <div>
                        <span className="font-medium">Start:</span> {r.startDate}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {r.endDate}
                      </div>
                      <div>
                        <span className="font-medium">Payment:</span>{" "}
                        {r.paymentStatus}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>{" "}
                        {r.totalAmount}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {r.createdAt}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          exportReservationToPDF([r], `Reservation_${idx + 1}`)
                        }
                        className="flex-1 px-3 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          exportReservationToExcel([r], `Reservation_${idx + 1}`)
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

export default AdminReservationReports;
