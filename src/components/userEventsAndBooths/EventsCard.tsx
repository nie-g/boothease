import { Calendar, MapPin, ImageIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import React, { useState } from "react";
import { motion } from "framer-motion";
import EventDetailsModal from "./EventDetailsModal"; // ✅ Import modal

interface EventType {
  _id: Id<"events">;
  title: string;
  description?: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: string;
  endDate: string;
  location: { address?: string; lat: number; lng: number };
  event_thumbnail?: Id<"_storage">;
  booth_layout?: Id<"_storage">;
  createdAt: number;
}

interface OwnerEventCardProps {
  event: EventType;
}

export const EventsCard: React.FC<OwnerEventCardProps> = ({ event }) => {
  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, {
    storageIds: event.event_thumbnail ? [event.event_thumbnail] : [],
  });
  const thumbnailUrl = urls?.[0];

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handlers
  const handleOpenDetails = () => setIsDetailsOpen(true);
  const handleCloseDetails = () => setIsDetailsOpen(false);

  return (
    <>
      {/* 🟢 Event Card */}
      <div className="bg-[#DEE5ED] rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
        {/* Title */}
        <h3 className="text-gray-800 font-semibold text-base truncate mb-2">
          {event.title}
        </h3>

        {/* Thumbnail */}
        <div className="bg-gray-100 rounded-lg h-36 flex items-center justify-center mb-3 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={event.title}
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full">
              <ImageIcon className="h-8 w-8 mb-1" />
              No Thumbnail
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="text-gray-600 text-sm flex flex-col items-center mb-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </span>
          <span className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {event.location?.address || "No venue info"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2 mt-auto">
          {/* ✅ View Details opens EventDetailsModal */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenDetails}
            className="bg-white px-2 py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            View Details
          </motion.button>

        
         
        </div>
      </div>

   
      {isDetailsOpen && (
        <EventDetailsModal
          item={event}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default EventsCard;
