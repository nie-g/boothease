import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as PieChartComp,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, PieChart } from "lucide-react";

interface ChartsSectionProps {
  chartData: any[];
  reservations: any[];
}

const COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];

const ChartsSection: React.FC<ChartsSectionProps> = ({ chartData, reservations }) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    {/* Line Chart */}
    <div className="bg-white rounded-xl shadow-sm p-5 col-span-2">
      <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <BarChart3 className="text-blue-500" size={18} /> Bookings Trend
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Pie Chart */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <PieChart className="text-purple-500" size={18} /> Booking Status
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChartComp>
          <Pie
            data={[
              { name: "Approved", value: reservations.filter((r) => r.status === "approved").length },
              { name: "Pending", value: reservations.filter((r) => r.status === "pending").length },
              { name: "Rejected", value: reservations.filter((r) => r.status === "rejected").length },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {COLORS.map((color, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChartComp>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ChartsSection;
