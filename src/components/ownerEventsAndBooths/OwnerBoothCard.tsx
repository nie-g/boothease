import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Search, Eye, XCircle, Filter } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import BoothDetailsModal from "./BoothDetailsModal";
import toast from "react-hot-toast";

interface BoothType {
  _id: Id<"booths">;
  name: string;
  size: string;
  price: number;
  availability_status: "available" | "reserved" | "unavailable";
  status: "approved" | "pending" | "declined" | "cancelled";
  location: string;
  eventId: Id<"events">;
  thumbnail?: Id<"_storage">;
  createdAt: number;
}

const BoothsPage: React.FC = () => {
  const booths = useQuery(api.booths.listAllBooths) ?? [];
  const events = useQuery(api.events.listAllEvents) ?? [];
  const cancelBooth = useMutation(api.booths.cancelBooth);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>("all");

  const [selectedBooth, setSelectedBooth] = useState<BoothType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // ✅ Filtering Logic
  const filteredBooths = useMemo(() => {
    return booths
      .filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((b) =>
        selectedEvent === "all" ? true : b.eventId === selectedEvent
      )
      .filter((b) =>
        selectedStatus === "all" ? true : b.status === selectedStatus
      )
      .filter((b) =>
        selectedAvailability === "all"
          ? true
          : b.availability_status === selectedAvailability
      );
  }, [booths, searchTerm, selectedEvent, selectedStatus, selectedAvailability]);

  const handleCancel = async (boothId: Id<"booths">) => {
    if (!confirm("Are you sure you want to cancel this booth?")) return;
    try {
      await cancelBooth({ boothId });
      toast.success("Booth reservation cancelled successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booth.");
    }
  };

  const openDetails = (booth: BoothType) => {
    setSelectedBooth(booth);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedBooth(null);
    setIsDetailsOpen(false);
  };

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header + Filters inline */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Booths</h2>
          <p className="text-gray-600 text-sm">
            View and manage your reserved and approved booths
          </p>
        </div>

        {/* Filters beside header */}
        <div className="flex flex-wrap items-center gap-3">
         

          {/* Event Filter */}
          <select
            aria-label="Filter booths by event"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All Events</option>
            {events.map((ev) => (
              <option key={ev._id.toString()} value={ev._id.toString()}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter booths by status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          {/* Availability Filter */}
          <select
            aria-label="Filter booths by availability"
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      {filteredBooths.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Filter className="mx-auto h-10 w-10 mb-3 text-gray-400" />
          No booths match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booth
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooths.map((booth) => (
                <tr key={booth._id.toString()} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-semibold text-gray-800">
                    {booth.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600">
                    {booth.size}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600">
                    ₱{booth.price.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booth.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : booth.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booth.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booth.availability_status === "available"
                          ? "bg-teal-100 text-teal-800"
                          : booth.availability_status === "reserved"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booth.availability_status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center text-sm space-x-2">
                    <button
                      onClick={() => openDetails(booth)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 hover:bg-blue-50 rounded-md items-center gap-1 inline-flex"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {(booth.status === "approved" ||
                      booth.status === "pending") && (
                      <button
                        onClick={() => handleCancel(booth._id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 hover:bg-red-50 rounded-md font-medium text-sm transition"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booth Details Modal */}
      {selectedBooth && (
        <BoothDetailsModal
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          booth={selectedBooth}
        />
      )}
    </motion.div>
  );
};

export default BoothsPage;
