import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import AdminSummaryCards from "./adminDashboard/SummaryCards";
import QuickActionsSection from "./adminDashboard/QuickActions";
import HeaderSection from "./adminDashboard/HeaderSection";

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch current user info
  const dbUser = useQuery(
    api.userQueries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

 const stats = useQuery(api.adminQueries.getAdminStats);

const businessDocCount = stats?.businessDocCount ?? 0;
const userCount = stats?.userCount ?? 0;
const eventCount = stats?.eventCount ?? 0;
const boothCount = stats?.boothCount ?? 0;

  if (dbUser === undefined) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      {/* Navbar */}
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* Header */}
            <HeaderSection />

            {/* Admin Summary Cards */}
           <AdminSummaryCards
            businessDocCount={businessDocCount}
            userCount={userCount}
            eventCount={eventCount}
            boothCount={boothCount}
          />

            {/* Quick Actions Section */}
            <QuickActionsSection />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
