import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import ReportsMetrics from "./SummaryCards";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Dispatch, SetStateAction } from "react";

interface ReportsOverviewEntitiesProps {
  user: { full_name: string };
  chartData: any;
  lineChartOptions: any;
  chartRef: any;

  // Stats & Data
  reservations: any[];
  events: any[];
  booths: any[];
  users: any[];

  statsSummary: {
    totalReservations: number;
    totalEvents: number;
    totalBooths: number;
    totalUsers: number;
    pendingReservations: number;
    approvedReservations: number;
  };

  getUserName: (id: string) => string;

  // ✅ Date range filter for chart
  chartStartDate: string;
  chartEndDate: string;
  setChartStartDate: Dispatch<SetStateAction<string>>;
  setChartEndDate: Dispatch<SetStateAction<string>>;
}

const ReportsOverviewEntities: React.FC<ReportsOverviewEntitiesProps> = ({
  user,
  chartData,
  lineChartOptions,
  chartRef,
  reservations,
  events,
  booths,
  users,
  statsSummary,
  getUserName,
  chartStartDate,
  chartEndDate,
  setChartStartDate,
  setChartEndDate,
}) => {

    const stats = useQuery(api.adminQueries.getAdminStats);

    const businessDocCount = stats?.businessDocCount ?? 0;
    const userCount = stats?.userCount ?? 0;
    const eventCount = stats?.eventCount ?? 0;
    const boothCount = stats?.boothCount ?? 0;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Reports</h1>
          <p className="text-sm text-gray-500">Welcome back, {user.full_name}</p>
        </div>
      </div>

      <ReportsMetrics 
        businessDocCount={businessDocCount}
        userCount={userCount}
        eventCount={eventCount}
        boothCount={boothCount}
      />

      {/* Chart + Summary Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Reservation Trends</h3>
              <p className="text-sm text-gray-500">
                Monthly reservation requests overview
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Reservations</div>
              <div className="text-xl font-semibold">
                {statsSummary.totalReservations.toLocaleString()}
              </div>
            </div>
          </div>

          {/* ✅ Date Range Filter */}
          <div className="flex gap-3 mb-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="chart-start-date" className="text-sm font-medium text-gray-700">Start Date:</label>
              <input
                id="chart-start-date"
                type="date"
                value={chartStartDate}
                onChange={(e) => setChartStartDate(e.target.value)}
                title="Select the start date for the chart"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="chart-end-date" className="text-sm font-medium text-gray-700">End Date:</label>
              <input
                id="chart-end-date"
                type="date"
                value={chartEndDate}
                onChange={(e) => setChartEndDate(e.target.value)}
                title="Select the end date for the chart"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div style={{ height: 300 }}>
            <Line ref={chartRef} data={chartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Right Column: Quick Stats + Recent Events */}
        <div className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow h-fit">
            <h4 className="font-semibold mb-3">Quick Stats</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Events</span>
                <span className="font-semibold text-blue-600">
                  {statsSummary.totalEvents}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Booths</span>
                <span className="font-semibold text-teal-600">
                  {statsSummary.totalBooths}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Users</span>
                <span className="font-semibold text-purple-600">
                  {statsSummary.totalUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approved Reservations</span>
                <span className="font-semibold text-green-600">
                  {statsSummary.approvedReservations}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending Reservations</span>
                <span className="font-semibold text-amber-600">
                  {statsSummary.pendingReservations}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Recent Events</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {events.slice(-5).reverse().map((e: any) => (
                <div key={e._id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-gray-500">
                    {e.status} • {new Date(e.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-gray-500">No events yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tables Section */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow">
          <h4 className="font-semibold mb-3">Recent Reservations</h4>
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "400px" }}>
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500 border-b sticky top-0 bg-white">
                <tr>
                  <th className="p-2">Renter</th>
                  <th className="p-2">Booth</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(-8).reverse().map((r: any) => (
                  <tr key={r._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2">{getUserName(r.renterId)}</td>
                    <td className="p-2">{r.boothName || "N/A"}</td>
                    <td
                      className={`p-2 font-medium ${
                        r.status === "approved"
                          ? "text-green-600"
                          : r.status === "pending"
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {r.status}
                    </td>
                    <td className="p-2 text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-medium text-gray-700">
                      ₱{Number(r.totalPrice || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No reservations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Booths, Users */}
        <div className="flex flex-col gap-6">
          {/* Booths */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Latest Booths</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {booths.slice(-3).reverse().map((b: any) => (
                <div key={b._id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">
                    {b.size} • ₱{Number(b.price).toLocaleString()}
                  </div>
                </div>
              ))}
              {booths.length === 0 && (
                <div className="text-gray-500">No booths yet.</div>
              )}
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold mb-3">Recently Added Users</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {users.slice(-3).reverse().map((u: any) => (
                <div key={u._id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {u.role} • {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-gray-500">No users yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ReportsOverviewEntities;
