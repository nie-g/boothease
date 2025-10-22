import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import SummaryCards from "./renterDashboard/SummaryCards";
import HeaderSection from "./renterDashboard/HeaderSection";
import QuickActionsSection from "./renterDashboard/QuickActions";


const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dbUser = useQuery(
    api.userQueries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const reservations = useQuery(
    api.reservations.getByRenter,
    dbUser?._id ? { renterId: dbUser._id } : "skip"
  );



  // Split reservations into upcoming & past
  const now = new Date();
  const pastReservations = useMemo(
    () => reservations?.filter((r) => new Date(r.endDate) < now) || [],
    [reservations]
  );
  const upcomingReservations = useMemo(
    () => reservations?.filter((r) => new Date(r.startDate) > now) || [],
    [reservations]
  );

  // Optional: Chart data (monthly bookings)

  // Helper functions for event/booth names
    
  

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

            {/* Summary Cards */}
            <SummaryCards
              bookedEventsCount={reservations?.length || 0}
              totalBookings={reservations?.length || 0}
              previousCount={pastReservations.length}
              upcomingCount={upcomingReservations.length}
            />

            <QuickActionsSection />

            {/* Overview Chart */}
            
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
