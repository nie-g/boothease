import { Calendar, MapPin, Heart, ImageIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import React, { useState } from "react";
import { motion } from "framer-motion";
import EventDetailsModal from "./EventDetailsModal";

interface EventType {
  _id: Id<"events">;
  title: string;
  description?: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: string;
  endDate: string;
  location: { address?: string; lat: number; lng: number };
  event_thumbnail?: Id<"_storage">; // storage ID
}

interface EventCardProps {
  event: EventType;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, {
    storageIds: event.event_thumbnail ? [event.event_thumbnail] : [],
  });
  const thumbnailUrl = urls?.[0];

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (event: any, thumbnailUrl?: string) => {
    setSelectedEvent({ ...event, thumbnailUrl });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-[#DEE5ED] rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
        {/* Title + Favorite */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-800 font-semibold text-base truncate">
            {event.title}
          </h3>
          <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" />
        </div>

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
        <div className="flex flex-col text-center mb-3">
          <div className="text-gray-600 text-sm flex flex-col items-center mt-1">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
            <span className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {event.location?.address || "No venue info"}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="flex justify-center mt-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpen(event)} // ✅ Trigger modal
            className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            View Details
          </motion.button>
        </div>
      </div>

      {/* ✅ Modal Component (below the card) */}
      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={handleClose}
        event={selectedEvent}
      />
    </>
  );
};
