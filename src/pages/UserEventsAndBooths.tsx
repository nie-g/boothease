import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
// Components
import TestNavbar from "../components/TestNavbar";
import Sidebar from "../components/Sidebar";
import { EventCard } from "../components/userEventsAndBooths/EventsCard";
import { BoothCard } from "../components/userEventsAndBooths/BoothsCard";
import { Calendar, LayoutGrid } from "lucide-react";
import { useUser } from "@clerk/clerk-react";


export interface BoothType {
  _id: Id<"booths">;
  name: string;
  size: string;
  price: number;
  location: string;
  status: "approved" | "pending" | "declined";
  availability_status: "available" | "reserved" | "unavailable";
  eventId: Id<"events">;
  thumbnail?: Id<"_storage">; // strictly _storage ID
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


const UserEventsAndBooths: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"events" | "booths">("events");
  const [searchTerm, setSearchTerm] = useState("");
   const { user } = useUser(); 
    const currentUser = useQuery(
       api.userQueries.getUserByClerkId,
       user?.id ? { clerkId: user.id } : "skip"
     );

  const events = useQuery(api.events.listAllEvents) as EventType[] | undefined;
  const booths = useQuery(api.booths.listApprovedBooths) as BoothType[] | undefined;

  const allEvents = events ?? [];
  const allBooths = booths ?? [];

  const filteredEvents = useMemo(
    () =>
      allEvents.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allEvents, searchTerm]
  );

  const filteredBooths = useMemo(
    () =>
      allBooths.filter((booth) =>
        booth.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allBooths, searchTerm]
  );


  return (
    <div className="w-screen h-screen flex flex-col bg-white overflow-hidden">
        {/* Navbar */}
        <div className="w-full flex-none h-[13vh]">
            <TestNavbar />
        </div>

        {/* Main Section */}
        <div className="flex flex-1 overflow-hidden">
            <aside className="w-1/6 min-w-[220px] bg-slate-100 overflow-y-auto border-r border-gray-200">
            <Sidebar />
            </aside>
            <main className="flex-1 bg-white overflow-y-auto p-4 md:p-6">
             {/* Tabs + Search Container */}
            <motion.div
                className=" p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Tabs */}
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
                    <LayoutGrid className="inline-block mr-2 h-4 w-4" /> Booths
                </button>
                </div>

                {/* Search */}
                <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full shadow-sm w-[20vw] ">
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="flex-1 text-sm bg-transparent p-1 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </motion.div>

            {/* Content Container */}
            <motion.div
                className="grid grid-cols-1 mt-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full bg-white p-6 rounded-lg border border-gray-100 shadow-lg max-w-6xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {activeTab === "events"
                ? filteredEvents.map((event) => (
                    <EventCard key={event._id} event={event}  />
                    ))
                : filteredBooths.map((booth) => (
                    <BoothCard key={booth._id} booth={booth} renterId={currentUser?._id as any} />
                    ))}
            </motion.div>
            
            </main>
        </div>
        </div>

  );
};

export default UserEventsAndBooths;
