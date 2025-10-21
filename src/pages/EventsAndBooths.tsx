import { useState } from "react";
import Navbar from "../components/UsersNavbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Calendar, LayoutGrid } from "lucide-react";
import EventsTable from "../components/eventsAndBooths/EventsTable";
import BoothsTable from "../components/eventsAndBooths/BoothsTable";

const EventsAndBooths: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"events" | "booths">("events");


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
            
            <div className="flex space-x-2 ">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "events"
                    ? "bg-orange-100 text-gray-800"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Calendar className="inline-block mr-1 h-4 w-4" /> Events
              </button>
              <button
                onClick={() => setActiveTab("booths")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "booths"
                    ? "bg-orange-100 text-teal-800"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid className="inline-block mr-1 h-4 w-4" /> Booths
              </button>
            </div>
          

          {activeTab === "events" ? <EventsTable /> : <BoothsTable />}
          

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EventsAndBooths;
