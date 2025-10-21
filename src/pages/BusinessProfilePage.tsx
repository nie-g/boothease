import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import BusinessProfile from "../components/businessProfileComponents/BusinessProfile";
import { api } from "../../convex/_generated/api";

const BusinessProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile");
  const { user, isLoaded } = useUser();

  const dbUser = useQuery(
    api.userQueries.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  if (!isLoaded || !user || !dbUser) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

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
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    activeTab === "profile"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Profile
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    activeTab === "documents"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Documents
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && (
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <BusinessProfile />
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-5xl mx-auto text-center text-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                Business documents upload/view section here
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
