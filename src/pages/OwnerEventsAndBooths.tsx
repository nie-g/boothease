import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Navbar from "../components/UsersNavbar";
import Sidebar from "../components/Sidebar";
import { OwnerEventCard } from "../components/ownerEventsAndBooths/OwnerEventCard";
import BoothsPage from "../components/ownerEventsAndBooths/OwnerBoothCard"; // ✅ use the proper table page
import { Calendar, LayoutGrid } from "lucide-react";

export interface BoothType {
  _id: Id<"booths">;
  name: string;
  size: string;
  price: number;
  availability_status: "available" | "reserved" | "unavailable";
  status: "approved" | "pending" | "declined" | "cancelled";
  eventId: Id<"events">;
  ownerId: string;
  thumbnail?: Id<"_storage">;
}

interface EventType {
  _id: Id<"events">;
  title: string;
  description?: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: string;
  endDate: string;
  location: { address?: string; lat: number; lng: number };
  event_thumbnail?: Id<"_storage">;
}

const OwnerEventsAndBooths: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"events" | "booths">("events");
  const [searchTerm, setSearchTerm] = useState("");
  const { user: clerkUser } = useUser();

  const currentUser = useQuery(
    api.userQueries.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  const events = useQuery(api.events.listAllEvents) as EventType[] | undefined;
  const booths = useQuery(api.booths.listAllBooths) as BoothType[] | undefined;

  const allEvents = events ?? [];
  const allBooths = booths ?? [];

  const ownerBooths = useMemo(
    () =>
      currentUser
        ? allBooths.filter((b) => b.ownerId === currentUser._id)
        : [],
    [allBooths, currentUser]
  );

  const filteredEvents = useMemo(
    () =>
      allEvents.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allEvents, searchTerm]
  );

  const filteredBooths = useMemo(
    () =>
      ownerBooths.filter((booth) =>
        booth.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [ownerBooths, searchTerm]
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      {/* Navbar */}
      <div className="w-full flex-none h-[13vh]">
        <Navbar />
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
            {/* Tabs + Search */}
            <div className="p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    activeTab === "events"
                      ? "bg-orange-100 text-gray-800"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="inline-block mr-2 h-4 w-4" /> Events
                </button>

                <button
                  onClick={() => setActiveTab("booths")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    activeTab === "booths"
                      ? "bg-orange-100 text-teal-800"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LayoutGrid className="inline-block mr-2 h-4 w-4" /> My Booths
                </button>
              </div>

              <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full shadow-sm w-[250px] sm:w-[20vw]">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="flex-1 text-sm bg-transparent p-1 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content Section */}
            {activeTab === "events" ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 bg-white p-6 rounded-lg border border-gray-100 shadow-md max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <OwnerEventCard key={event._id} event={event} />
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-10">
                    No events yet.
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="bg-white p-6 rounded-lg border border-gray-100 shadow-md max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {filteredBooths.length > 0 ? (
                  <BoothsPage /> // ✅ Now just shows your full table view (no grid)
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    No booths yet.
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default OwnerEventsAndBooths;
