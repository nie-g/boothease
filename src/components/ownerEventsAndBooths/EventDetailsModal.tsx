import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ImageIcon, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import LocationModal from "./LocationModal";

interface EventDetailsModalProps {
  item: {
    _id: Id<"events">;
    title: string;
    description?: string;
    status: "upcoming" | "ongoing" | "ended";
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    numberOfDays?: number;
    location: {
      address?: string;
      lat: number;
      lng: number;
    };
    createdAt: number;
    createdBy?: Id<"users">;
    event_thumbnail?: Id<"_storage">;
    booth_layout?: Id<"_storage">;
  };
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  // ✅ Fetch event thumbnail & layout URLs
  const storageIds = [item.event_thumbnail, item.booth_layout].filter(Boolean) as Id<"_storage">[];
  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds }) ?? [];
  const eventThumbnailUrl = urls[0];
  const boothLayoutUrl = urls[1];

  // ✅ Fetch event images gallery
  const eventImages =
    useQuery(api.event_images?.getByEventId, { eventId: item._id }) ?? [];
  const extraStorageIds = eventImages.map((img) => img.storageId) as Id<"_storage">[];
  const extraImageUrls =
    useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds: extraStorageIds }) ?? [];

  const showCarousel = extraImageUrls.length > 3;
  const handleNext = () => {
    if (currentIndex < extraImageUrls.length - 3)
      setCurrentIndex((i) => i + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Event Details</h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnail + Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Event Thumbnail */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start">
              {eventThumbnailUrl ? (
                <div className="relative w-full max-w-[220px] aspect-square rounded-xl overflow-hidden shadow border border-gray-200">
                  <img
                    src={eventThumbnailUrl}
                    alt="Event Thumbnail"
                    className="absolute inset-0 w-full h-full object-cover bg-gray-50"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-[220px] aspect-square bg-gray-100 rounded-xl border border-dashed">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-2/3 space-y-2 text-gray-700">
              <Detail label="Title" value={item.title} />
              <Detail label="Description" value={item.description || "—"} />
              <Detail
                label="Status"
                value={
                  <span
                    className={`capitalize px-3 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === "upcoming"
                        ? "bg-teal-100 text-teal-700"
                        : item.status === "ongoing"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                }
              />
              <Detail label="Start Date" value={formatDate(item.startDate)} />
              <Detail label="End Date" value={formatDate(item.endDate)} />
              <Detail
                label="Days"
                value={`${item.numberOfDays || 1} day${item.numberOfDays! > 1 ? "s" : ""}`}
              />
              <Detail
                label="Created By"
                value={item.createdBy ? item.createdBy : "—"}
              />
              <Detail
                label="Created At"
                value={new Date(item.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />

              {/* View Location */}
              <button
                onClick={() => setIsLocationOpen(true)}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-orange-400 text-white text-sm rounded-lg hover:bg-orange-500 transition"
              >
                <MapPin className="w-4 h-4" />
                View Location
              </button>
            </div>
          </div>

          {/* Booth Layout Preview */}
          {boothLayoutUrl && (
            <div className="mt-6">
              <h4 className="text-base font-medium text-gray-800 mb-2">
                Booth Layout
              </h4>
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <img
                  src={boothLayoutUrl}
                  alt="Booth Layout"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>
          )}

          {/* ✅ Event Images Gallery */}
          {/* ✅ Event Images Gallery */}
          <div className="mt-6">
            <h4 className="text-base font-medium text-gray-800 mb-2">
              Event Images Gallery
            </h4>

            {extraImageUrls.length > 0 ? (
              showCarousel ? (
                <div className="relative overflow-hidden">
                  <motion.div
                    className="flex gap-3"
                    animate={{ x: `-${currentIndex * (100 / 3)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  >
                    {extraImageUrls
                      .filter((url): url is string => !!url)
                      .map((url, idx) => (
                        <div
                          key={idx}
                          className="flex-none w-1/3 h-[30vh] overflow-hidden rounded-lg shadow-sm border border-gray-200"
                        >
                          <img
                            src={url}
                            alt={`Event image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </motion.div>

                  {/* Carousel Controls */}
                  <button
                    aria-label="Previous"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    aria-label="Next"
                    onClick={handleNext}
                    disabled={currentIndex >= extraImageUrls.length - 3}
                    className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {extraImageUrls
                    .filter((url): url is string => !!url)
                    .map((url, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden h-[30vh] rounded-lg shadow-sm border border-gray-200 hover:scale-[1.03] transition-transform duration-200"
                      >
                        <img
                          src={url}
                          alt={`Extra ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-[150px] bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 text-sm">No images to show</p>
              </div>
            )}
          </div>


        </motion.div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        location={item.location}
      />
    </>
  );
};

// ✅ Detail Row Component
const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="font-medium text-gray-800 w-28 shrink-0">{label}:</span>
    <span className="text-gray-600 flex-1">{value}</span>
  </div>
);

export default EventDetailsModal;
