import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import Navbar from "../components/UsersNavbar";
import Sidebar from "../components/Sidebar";


const RenterDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: clerkUser } = useUser();

  const currentUser = useQuery(
    api.userQueries.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  if (!clerkUser || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-4 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E9]">
     <div className="w-full flex-none h-[8vh] md:h-[13vh]">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
       <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 bg-[#E7EBEE] border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64
        `}
      >
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </aside>
        {/* Content area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-auto">
          <motion.div
            className="bg-white shadow-md rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Your renter content here */}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default RenterDashboard;
