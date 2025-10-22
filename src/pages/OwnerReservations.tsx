import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Search, FileText, ArrowUpDown, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import ReservationDetailsModal from "../components/ownReservationComponents/ReservationDetails";
import BillingModal from "../components/ownReservationComponents/BillingModal";
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

const OwnerReservations: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ReservationType;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  const [selectedReservation, setSelectedReservation] =
    useState<ReservationType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingAmount, setBillingAmount] = useState<number>(0);

  const user = useQuery(
    api.userQueries.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Fetch reservations for booths owned by this owner
  const reservations = useQuery(
    api.reservations.getOwnerReservations,
    user?._id ? { ownerId: user._id } : "skip"
  );

  const isLoading = !reservations;

  const ownerReservations = useMemo(() => {
    if (!user || !reservations) return [];
    return reservations; // All reservations for owner's booths
  }, [reservations, user]);

  const handleSort = (key: keyof ReservationType) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedList = useMemo(() => {
    const filtered = ownerReservations.filter(
      (r) =>
        r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
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
  }, [ownerReservations, searchTerm, sortConfig]);

  const formatDate = (date: string | number) => {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openModal = (reservation: ReservationType) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const openBillingModal = (reservation: ReservationType) => {
    setSelectedReservation(reservation);
    setBillingAmount(reservation.totalPrice);
    setIsBillingOpen(true);
  };

  const closeBillingModal = () => setIsBillingOpen(false);

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      <div className="w-full flex-none h-[8vh] md:h-[13vh]">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed top-0 left-0 h-full z-50 w-64 bg-[#E7EBEE] border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:w-64`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </aside>

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
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Reservation Requests
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage all reservations for your booths
                </p>
              </div>

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

              {isLoading ? (
                <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
                  Loading reservations...
                </div>
              ) : sortedList.length === 0 ? (
                <div className="text-center p-6">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    No reservations found
                  </p>
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
                          <td className="px-3 py-4 text-sm text-gray-600">
                            {formatDate(res.createdAt)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600">
                            {formatDate(res.startDate)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600">
                            {formatDate(res.endDate)}
                          </td>
                          <td className="px-3 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                res.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : res.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : res.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600">
                            ₱{res.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-3 py-4 text-center flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openModal(res)}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1 hover:bg-blue-50 rounded-md inline-flex items-center gap-1 text-sm"
                            >
                              <Eye className="w-4 h-4" /> Manage
                            </button>
                            {res.status === "approved" && (
                              <button
                                type="button"
                                onClick={() => openBillingModal(res)}
                                className="text-teal-600 hover:text-teal-900 px-3 py-1 hover:bg-teal-50 rounded-md inline-flex items-center gap-1 text-sm"
                              >
                                <FileText className="w-4 h-4" /> View Bill
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
          isOpen={isModalOpen}
          onClose={closeModal}
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

export default OwnerReservations;
