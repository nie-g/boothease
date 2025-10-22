// src/pages/MerchantDashboard.tsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import AllReservationsSection from "./ownerDashboard/Reservations";
import QuickActionsSection from "./ownerDashboard/QuickActions";
import HeaderSection from "./ownerDashboard/HeaderSection";
import type { Id } from "../../convex/_generated/dataModel";

const MerchantDashboard: React.FC = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Fetch the current user from Convex
  const dbUser = useQuery(
    api.userQueries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // ✅ Fetch all reservations for this owner’s booths
  const ownerReservations = useQuery(
  api.reservations.getOwnerBoothReservations, // <-- use the new function
  dbUser?._id ? { ownerId: dbUser._id as Id<"users"> } : "skip"
);

  const isLoading = ownerReservations === undefined;

  // ✅ Transform data into the shape AllReservationsSection expects
  const formattedReservations = useMemo(() => {
    if (!ownerReservations) return [];
    return ownerReservations.map((res) => ({
      id: res._id, // map Convex _id to `id`
      boothName: (res as any).boothName || "N/A", // safely handle missing fields
      renterName: (res as any).renterName || "N/A",
      eventName: (res as any).eventName || "N/A",
      startDate: res.startDate,
      endDate: res.endDate,
      status: res.status,
      totalPrice: res.totalPrice,
    }));
  }, [ownerReservations]);

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
          
            <HeaderSection />
         

            {/* ✅ Display All Reservations for This Owner */}
            <AllReservationsSection
              reservations={formattedReservations}
              isLoading={isLoading}
            />
            <QuickActionsSection />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MerchantDashboard;
