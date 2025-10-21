import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Search, FileText, ArrowUpDown } from "lucide-react";
import EventDetailsModal from "../../components/eventsAndBooths/EventDetailsModal";
import AddEventModal from "../../components/eventsAndBooths/AddEventModal";
import { useUser } from "@clerk/clerk-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface EventType {
  _id: Id<"events">;
  title: string;
  description?: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: string;
  endDate: string;
  location: {
    address?: string;
    lat: number;
    lng: number;
  };
  createdBy: Id<"users">;
  createdAt: number;
}

const EventsTable: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "title",
    direction: "asc",
  });
  const [selectedItem, setSelectedItem] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const events = useQuery(api.events.listAllEvents) ?? [];
  const isLoading = useQuery(api.events.listAllEvents) === undefined;

  const formatDate = (timestamp?: number) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "—";

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const openModal = (item: EventType) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const sortedList = useMemo(() => {
    const filtered = events.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [events, searchTerm, sortConfig]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
        Loading events...
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
          <p className="text-gray-600 text-sm">View and manage all events</p>
        </div>
        <button
          onClick={() => setIsAddEventOpen(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
        >
          + Add Event
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Table */}
      {sortedList.length === 0 ? (
        <div className="text-center p-6">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No events found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => handleSort("title")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Title <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedList.map((item) => (
                <tr key={item._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(Date.parse(item.startDate))} - {formatDate(Date.parse(item.endDate))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.location?.address || "—"}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => openModal(item)} className="text-teal-600 hover:text-teal-900 px-3 py-1 hover:bg-teal-50 rounded-md">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {selectedItem && (
        <EventDetailsModal item={selectedItem} isOpen={isModalOpen} onClose={closeModal} />
      )}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        userId={clerkUser?.id ?? ""}
      />
    </motion.div>
  );
};

export default EventsTable;
