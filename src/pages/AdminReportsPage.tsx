import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

import Navbar from "../components/UsersNavbar";
import Sidebar from "../components/Sidebar";
import ReportsOverviewV2 from "./adminDashboard/ReportsOverview"; // ✅ new overview page
import ReservationsReport from "./adminDashboard/ReservationsReport";
import EventsReport from "./adminDashboard/EventsReport";
import BoothsReport from "./adminDashboard/BoothsReport";
import UsersReport from "./adminDashboard/UsersReport";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

const formatDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};


const AdminReportsV2: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ full_name: string } | null>(null);
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  // ✅ Convex queries for new report focus
  const reservations = useQuery(api.reservations.listAllReservationsWithDetails) || [];
  const events = useQuery(api.events.listAllEvents) || [];
  const booths = useQuery(api.booths.listAllBooths) || [];
  const users = useQuery(api.userQueries.listAllUsers) || [];

  const isLoading =
    reservations === undefined ||
    events === undefined ||
    booths === undefined ||
    users === undefined;

  // UI state
  const [activeTab, setActiveTab] = useState<
    "overview" | "reservations Report" | "events Report" | "booths Report" | "users Report"
  >("overview");


  // ✅ Date range filter for chart
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [chartStartDate, setChartStartDate] = useState<string>(
    thirtyDaysAgo.toISOString().split("T")[0]
  );
  const [chartEndDate, setChartEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  const chartRef = useRef<any>(null);

  // --- Auth check ---
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (clerkUser) {
      const role = clerkUser.unsafeMetadata?.userType;
      if (role === "admin") {
        setUser({
          full_name: clerkUser.fullName || clerkUser.username || "admin",
        });
      }
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  // Helpers
  const getUserName = (userId: string) => {
    const u = users.find((usr: any) => usr._id === userId);
    return u
      ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
      : "Unknown User";
  };

  // ===============================
  // Chart setup: Reservations trend
  // ===============================
  const { labels, dataValues } = useMemo(() => {
    // ✅ Use date range from state
    const startDate = new Date(chartStartDate);
    const endDate = new Date(chartEndDate);

    // Ensure end date is at the end of the day
    endDate.setHours(23, 59, 59, 999);

    const start = startDate.getTime();
    const end = endDate.getTime();

    const daysArr: string[] = [];
    const diffDays = Math.ceil((end - start) / (24 * 60 * 60 * 1000));

    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(start + i * 24 * 60 * 60 * 1000);
      daysArr.push(formatDateKey(d));
    }

    const counts: Record<string, number> = {};
    daysArr.forEach((k) => (counts[k] = 0));

    for (const r of reservations) {
      const created = r.createdAt ?? r._creationTime;
      if (created >= start && created <= end) {
        const key = formatDateKey(new Date(created));
        counts[key] = (counts[key] || 0) + 1;
      }
    }

    const values = daysArr.map((k) => counts[k] ?? 0);

    return {
      labels: daysArr.map((k) => {
        const d = new Date(k);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }),
      dataValues: values,
    };
  }, [reservations, chartStartDate, chartEndDate]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { stepSize: 1 } },
    },
  }), []);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Reservations",
        data: dataValues,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(20,184,166,0.12)",
        borderColor: "rgba(13,148,136,1)",
        pointRadius: 2,
      },
    ],
  }), [labels, dataValues]);

  if (isLoading || !user) {
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

          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // JSX
  // ===============================
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

        <main className="p-6 md:p-8 flex-1 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Sub Navigation */}
            <div className="flex gap-3 mt-2 mb-6">
              {["overview","reservations Report","events Report","booths Report","users Report"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === tab
                      ? "bg-orange-100  text-gray-600"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Switch */}
            {activeTab === "overview" ? (
              <ReportsOverviewV2
                user={user}
                chartData={chartData}
                lineChartOptions={lineChartOptions}
                chartRef={chartRef}
                reservations={reservations}
                events={events}
                booths={booths}
                users={users}
                statsSummary={{
                  totalReservations: reservations.length,
                  totalEvents: events.length,
                  totalBooths: booths.length,
                  totalUsers: users.length,
                  pendingReservations: reservations.filter((r: any) => r.status === "pending").length,
                  approvedReservations: reservations.filter((r: any) => r.status === "approved").length,
                }}
                getUserName={getUserName}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                setChartStartDate={setChartStartDate}
                setChartEndDate={setChartEndDate}
              />
            ) : activeTab === "reservations Report" ? (
              <ReservationsReport />
            ) : activeTab === "events Report" ? (
              <EventsReport />
            ) : activeTab === "booths Report" ? (
              <BoothsReport />
            ) : (
              <UsersReport />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportsV2;
