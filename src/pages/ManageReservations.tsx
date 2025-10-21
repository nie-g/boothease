import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Search, FileText, ArrowUpDown, Eye } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import type { Id } from "../../convex/_generated/dataModel";
import ManageReservationStatusModal from "../components/manageReservations/ManageReservationStatusModal";
import ReservationDetailsModal from "../components/manageReservations/ReservationDetailsModal";

export interface ReservationType {
  _id: Id<"reservations">;
  boothId: Id<"booths">;
  renterId: Id<"users">;
  status: "pending" | "approved" | "declined" | "cancelled";
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: number;
  updatedAt?: number;
}

const ManageReservations: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });

  const [selectedReservation, setSelectedReservation] = useState<ReservationType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDetails, setSelectedDetails] = useState<ReservationType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // ✅ Fetch reservations
  const reservations = useQuery(api.reservations.listAllReservations) ?? [];
  const isLoading = useQuery(api.reservations.listAllReservations) === undefined;

  // ✅ Fetch booths and users for display
  const booths = useQuery(api.booths.listAllBooths) ?? [];
  const users = useQuery(api.userQueries.listAllUsers) ?? [];

  // ✅ Create lookup maps
  const boothsMap = useMemo(() => {
    const map: Record<string, string> = {};
    booths.forEach((b) => {
      map[b._id.toString()] = b.name;
    });
    return map;
  }, [booths]);

  const usersMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u._id.toString()] = `${u.firstName} ${u.lastName}`;
    });
    return map;
  }, [users]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const sortedList = useMemo(() => {
    const filtered = reservations.filter((item) => {
      const userName = usersMap[item.renterId.toString()] || "";
      const boothName = boothsMap[item.boothId.toString()] || "";
      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boothName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof ReservationType];
      const bValue = b[sortConfig.key as keyof ReservationType];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return sorted;
  }, [reservations, searchTerm, sortConfig, usersMap, boothsMap]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
        Loading reservations...
      </div>
    );
  }

  const openModal = (reservation: ReservationType) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const openDetails = (reservation: ReservationType) => {
    setSelectedDetails(reservation);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedDetails(null);
  };

  return (
    <>
      <motion.div
        className="bg-white shadow-md rounded-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reservation Management</h2>
            <p className="text-gray-600 text-sm">Accept or decline client booth reservations</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by client or booth name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Table */}
        {sortedList.length === 0 ? (
          <div className="text-center p-6">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No reservations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center">
                      Date <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booth
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedList.map((item) => (
                  <tr key={item._id.toString()} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      {usersMap[item.renterId.toString()] || "—"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {boothsMap[item.boothId.toString()] || "—"}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm space-x-2">
                      <button
                        onClick={() => openDetails(item)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 hover:bg-blue-50 rounded-md inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> See Details
                      </button>

                      {item.status === "pending" && (
                        <button
                          onClick={() => openModal(item)}
                          className="text-teal-600 hover:text-teal-900 px-3 py-1 hover:bg-teal-50 rounded-md font-medium text-sm transition-colors"
                        >
                          Manage Status
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

      {/* Manage Status Modal */}
      {selectedReservation && (
        <ManageReservationStatusModal
          isOpen={isModalOpen}
          onClose={closeModal}
          reservationId={selectedReservation._id}
          currentStatus={selectedReservation.status}
        />
      )}

      {/* Details Modal */}
      {selectedDetails && (
        <ReservationDetailsModal
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          reservation={selectedDetails}
        />
      )}
    </>
  );
};

export default ManageReservations;
