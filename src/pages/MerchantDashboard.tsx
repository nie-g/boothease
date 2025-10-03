import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import ClientNavbar from "../components/UsersNavbar";
import DynamicSidebar from "../components/DynamicSidebar";


const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
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
      {/* Navbar always on top */}
      <ClientNavbar />

      {/* Main section with sidebar + content */}
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <DynamicSidebar />

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

export default MerchantDashboard;
