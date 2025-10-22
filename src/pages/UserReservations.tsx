import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Search, FileText, ArrowUpDown, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import ReservationDetailsModal from "../components/userReservationsComponents/ReservationDetails";
import BillingModal from "../components/userReservationsComponents/BillingModal";
import type { Id } from "../../convex/_generated/dataModel";

interface ReservationType {
  _id: Id<"reservations">;
  boothId: Id<"booths">;
  renterId: Id<"users">;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  totalPrice: number;
  createdAt: number;
  updatedAt?: number;
}

const UserReservations: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ReservationType;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  const [selectedReservation, setSelectedReservation] = useState<ReservationType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const [billingAmount, setBillingAmount] = useState<number>(0);

  const user = useQuery(
    api.userQueries.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const reservations = useQuery(
    api.reservations.getUserReservations,
    user?._id ? { renterId: user._id } : "skip"
  );

  const isLoading = !reservations;

  const userReservations = useMemo(() => {
    if (!user || !reservations) return [];
    return reservations.filter((r) => r.renterId === user._id);
  }, [reservations, user]);

  const handleSort = (key: keyof ReservationType) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedList = useMemo(() => {
    const filtered = userReservations.filter(
      (r) =>
        r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [userReservations, searchTerm, sortConfig]);

  const formatDate = (date: string | number) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const openDetailsModal = (reservation: ReservationType) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  const openBillingModal = (reservation: ReservationType) => {
    setSelectedReservation(reservation);
    setBillingAmount(reservation.totalPrice);
    setIsBillingOpen(true);
  };

  const closeDetailsModal = () => setIsDetailsOpen(false);
  const closeBillingModal = () => setIsBillingOpen(false);

  const renderStatusBadge = (status: ReservationType["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      {/* Navbar */}
      <div className="w-full flex-none h-[8vh] md:h-[13vh]">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 w-64 bg-[#E7EBEE] border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-md max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Reservations</h2>
                <p className="text-gray-600 text-sm">View all of your booth reservations</p>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
                  Loading reservations...
                </div>
              ) : sortedList.length === 0 ? (
                <div className="text-center p-6">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No reservations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          onClick={() => handleSort("createdAt")}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        >
                          <div className="flex items-center">
                            Created <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Price
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedList.map((res) => (
                        <tr key={res._id.toString()} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-600">{formatDate(res.createdAt)}</td>
                          <td className="px-3 py-4 text-sm text-gray-600">{formatDate(res.startDate)}</td>
                          <td className="px-3 py-4 text-sm text-gray-600">{formatDate(res.endDate)}</td>
                          <td className="px-3 py-4 text-sm">{renderStatusBadge(res.status)}</td>
                          <td className="px-3 py-4 text-sm text-gray-600">₱{res.totalPrice.toLocaleString()}</td>
                          <td className="px-3 py-4 text-center flex justify-center gap-2">
                            <button
                              onClick={() => openDetailsModal(res)}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1 hover:bg-blue-50 rounded-md inline-flex items-center gap-1 text-sm"
                            >
                              <Eye className="w-4 h-4" /> Details
                            </button>
                            {res.status === "approved" && (
                              <button
                                onClick={() => openBillingModal(res)}
                                className="text-teal-600 hover:text-teal-900 px-3 py-1 hover:bg-teal-50 rounded-md inline-flex items-center gap-1 text-sm"
                              >
                                View Bill
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      {selectedReservation && (
        <ReservationDetailsModal
          isOpen={isDetailsOpen}
          onClose={closeDetailsModal}
          reservationId={selectedReservation._id}
        />
      )}

      {selectedReservation && (
        <BillingModal
          isOpen={isBillingOpen}
          onClose={closeBillingModal}
          renterId={selectedReservation.renterId}
          totalPrice={billingAmount}
        />
      )}
    </div>
  );
};

export default UserReservations;
