import React from "react";
import { X, MapPin, Calendar, Clock, User, ImageIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

// ✅ Fix Leaflet icons (avoid missing marker)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EventDetailsModalProps {
  event: {
    _id: Id<"events">;
    title: string;
    description?: string;
    status?: "upcoming" | "ongoing" | "ended";
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    numberOfDays?: number;
    location: { address?: string; lat: number; lng: number };
    createdAt?: number;
    createdBy?: Id<"users">;
    event_thumbnail?: Id<"_storage">;
    booth_layout?: Id<"_storage">;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !event) return null;

  // ✅ Load image preview URLs
  const storageIds = [event.event_thumbnail, event.booth_layout].filter(
    Boolean
  ) as Id<"_storage">[];

  const urls =
    useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds }) ?? [];

  const eventThumbnailUrl = urls[0];
  const boothLayoutUrl = urls[1];

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const formatTime = (time?: string) => (time ? time : "—");

  const formatDateTime = (timestamp?: number) =>
    timestamp
      ? new Date(timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const coords: LatLngExpression = [event.location.lat, event.location.lng];
  const hasValidCoords = event.location.lat && event.location.lng;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity backdrop-blur-sm">
      <div className="bg-[#FFF9E9] rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-[#FFF9E9] border-b flex justify-between items-center p-5 rounded-t-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
            {event.title}
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              {eventThumbnailUrl ? (
                <img
                  src={eventThumbnailUrl}
                  alt="Event Thumbnail"
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  No Thumbnail
                </div>
              )}
              <p className="text-sm text-center bg-gray-50 py-2 font-medium text-gray-600">
                Event Thumbnail
              </p>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              {boothLayoutUrl ? (
                <img
                  src={boothLayoutUrl}
                  alt="Booth Layout"
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  No Booth Layout
                </div>
              )}
              <p className="text-sm text-center bg-gray-50 py-2 font-medium text-gray-600">
                Booth Layout
              </p>
            </div>
          </div>

          {/* Status + Metadata */}
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 gap-2">
            {event.status && (
              <span
                className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${
                  event.status === "upcoming"
                    ? "bg-teal-100 text-teal-700"
                    : event.status === "ongoing"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {event.status}
              </span>
            )}

            {event.createdBy && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="truncate max-w-[150px]">
                  Created by: {event.createdBy}
                </span>
              </span>
            )}

            {event.createdAt && (
              <span className="text-gray-500">
                Created: {formatDateTime(event.createdAt)}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-4 text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>
                {formatDate(event.startDate)} – {formatDate(event.endDate)}{" "}
                ({event.numberOfDays || 1} day
                {event.numberOfDays! > 1 ? "s" : ""})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              <span>
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Description</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-teal-600 mt-1" />
              <div className="flex flex-col w-full">
                <span className="mb-2">
                  {event.location.address || "No address provided"}
                </span>

                {hasValidCoords ? (
                  <div className="w-full h-[250px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <MapContainer
                      center={coords}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                      />
                      <Marker position={coords}></Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No map data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
