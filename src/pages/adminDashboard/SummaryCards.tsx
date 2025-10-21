import React from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Activity, Calendar } from "lucide-react";

interface SummaryCardsProps {
  likedEventsCount: number;
  totalBookings: number;
  previousCount: number;
  upcomingCount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  likedEventsCount,
  totalBookings,
  previousCount,
  upcomingCount,
}) => {
  const cards = [
    {
      label: "Liked Events",
      value: likedEventsCount,
      icon: <Heart className="text-pink-500" size={20} />,
      color: "bg-pink-100 text-pink-600",
      delay: 0.05,
      footer_label: "Total Liked Events by user",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: <ShoppingBag className="text-indigo-500" size={20} />,
      color: "bg-indigo-100 text-indigo-600",
      delay: 0.1,
      footer_label: "Total Bookings by user",
    },
    {
      label: "Previous Bookings",
      value: previousCount,
      icon: <Activity className="text-emerald-500" size={20} />,
      color: "bg-emerald-100 text-emerald-600",
      delay: 0.15,
      footer_label: "Previous Bookings by user",
    },
    {
      label: "Upcoming Events",
      value: upcomingCount,
      icon: <Calendar className="text-amber-500" size={20} />,
      color: "bg-amber-100 text-amber-600",
      delay: 0.2,
      footer_label: "Total upcoming events",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: card.delay }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-semibold">
                {card.label}
              </span>
              <span className="text-2xl font-semibold text-gray-800  p-4">
                {card.value}
              </span>
              <span className="text-xs text-gray-500 ">
                {card.footer_label}
              </span>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default SummaryCards;
