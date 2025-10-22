import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Search, FileText, ArrowUpDown, Eye } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import ManageBoothStatusModal from "./ManageBoothStatusModal";
import BoothDetailsModal from "./BoothDetailsModal";

interface BoothType {
  _id: Id<"booths">;
  name: string;
  description?: string;
  status: "pending" | "approved" | "declined" | "available" | "reserved"| "cancelled";
  price: number;
  location: string;
  eventId: Id<"events">;
  createdBy?: Id<"users">;
  ownerId?: Id<"users">;
  createdAt: number;
}

const BoothsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

  const [selectedBooth, setSelectedBooth] = useState<BoothType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedBoothDetails, setSelectedBoothDetails] = useState<BoothType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const booths = useQuery(api.booths.listAllBooths) ?? [];
  const isLoading = useQuery(api.booths.listAllBooths) === undefined;


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
    const filtered = booths.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [booths, searchTerm, sortConfig]);

  // Fetch all users once
  const users = useQuery(api.userQueries.listAllUsers) ?? [];

  // Create a mapping for easy lookup
  // Create a mapping for easy lookup
  const usersMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u._id.toString()] = `${u.firstName} ${u.lastName}`;
    });
    return map;
  }, [users]);



  if (isLoading) {
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
        Loading booths...
      </div>
    );
  }

  const openModal = (booth: BoothType) => {
    setSelectedBooth(booth);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooth(null);
  };

  const openDetails = (booth: BoothType) => {
    setSelectedBoothDetails(booth);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBoothDetails(null);
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
            <h2 className="text-2xl font-bold text-gray-900">Booth Management</h2>
            <p className="text-gray-600 text-sm">Approve or decline pending booth submissions</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search booths..."
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
            <p className="text-gray-600 text-sm">No booths found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center">
                      Booth Name <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-3 py-3 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedList.map((item) => (
                  <tr key={item._id.toString()} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      ₱{item.price.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {usersMap[item.ownerId?.toString() || ""] || "—"}
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
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-3 py-4 text-center text-sm space-x-2">
                    {/* Always show See Details */}
                    <button
                      aria-label="See Details"
                      onClick={() => openDetails(item)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 hover:bg-blue-50 rounded-md items-center gap-1 inline-flex"
                    >
                      <Eye className="w-4 h-4" /> See Details
                    </button>

                    {/* Show Manage Status only if booth is pending (or any status you want to allow management) */}
                    {item.status === "pending" ? (
                      <button
                        onClick={() => openModal(item)}
                        className="text-teal-600 hover:text-teal-900 px-3 py-1 hover:bg-teal-50 rounded-md font-medium text-sm transition-colors"
                      >
                        Manage Status
                      </button>
                    ) : null /* hide Manage Status completely for approved or declined */}
                  </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Status Management Modal */}
      {selectedBooth && (
        <ManageBoothStatusModal
          isOpen={isModalOpen}
          onClose={closeModal}
          boothId={selectedBooth._id}
          boothName={selectedBooth.name}
          currentStatus={selectedBooth.status}
        />
      )}

      {/* Booth Details Modal */}
      {selectedBoothDetails && (
        <BoothDetailsModal
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          booth={selectedBoothDetails}
        />
      )}
    </>
  );
};

export default BoothsTable;
