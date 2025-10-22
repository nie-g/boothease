import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { CalendarDays } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsSectionProps {
  chartData: { date: string; userId: string; bookings: number }[];
  currentUserId: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ chartData, currentUserId }) => {
  // Filter chart data for current user
  const userChartData = useMemo(
    () => chartData.filter((d) => d.userId === currentUserId),
    [chartData, currentUserId]
  );

  // Calculate total bookings for this period
  const totalBookings = userChartData.reduce((acc, curr) => acc + curr.bookings, 0);

  const lineData = {
    labels: userChartData.map((d) => d.date),
    datasets: [
      {
        label: "Bookings",
        data: userChartData.map((d) => d.bookings),
        borderColor: "#10b981", // emerald-500
        backgroundColor: "rgba(16,185,129,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
        pointRadius: userChartData.map((d) => (d.bookings > 0 ? 5 : 0)),
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (ctx: any) => `${ctx.raw} booking${ctx.raw !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: "#9ca3af" } 
      },
      y: { 
        beginAtZero: true, 
        grid: { color: "#e5e7eb" }, 
        ticks: { color: "#9ca3af", callback: (val: any) => `${val}` } 
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <CalendarDays className="text-emerald-500" size={18} /> Bookings Overview
        </h2>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{totalBookings}</div>
          <div className="text-sm text-gray-400">Total Bookings</div>
        </div>
      </div>
      <Line data={lineData} options={lineOptions} height={220} />
    </div>
  );
};

export default ChartsSection;
