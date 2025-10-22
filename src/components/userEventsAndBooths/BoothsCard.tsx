import React, { useState } from "react";
import { ImageIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import ReserveBoothModal from "./ReserveBoothModal";
import BoothDetailsModal from "./BoothDetailsModal"; // ✅ Import the new modal

// ✅ Booth type
export interface BoothType {
  _id: Id<"booths">;
  name: string;
  size: string;
  price: number;
  location: string;
  status: "approved" | "pending" | "declined" | "cancelled";
  availability_status: "available" | "reserved" | "unavailable";
  eventId: Id<"events">;
  thumbnail?: Id<"_storage">;
  createdAt: number;
}

// ✅ Props for booth list
interface BoothsListProps {
  renterId: Id<"users">;
}

// ✅ Fetch and show approved booths
export const BoothsList: React.FC<BoothsListProps> = ({ renterId }) => {
  const booths = useQuery(api.booths.listApprovedBooths);

  // ✅ Modal states for details
  const [selectedBooth, setSelectedBooth] = useState<BoothType | null>(null);

  if (!booths) return <p>Loading booths...</p>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {booths.length > 0 ? (
          booths.map((booth) => (
            <BoothCard
              key={booth._id}
              booth={booth}
              renterId={renterId}
              onSeeDetails={() => setSelectedBooth(booth)} // 👈 Open details modal
            />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No approved booths available.
          </p>
        )}
      </div>

      {/* ✅ Booth Details Modal */}
      {selectedBooth && (
        <BoothDetailsModal
          isOpen={!!selectedBooth}
          onClose={() => setSelectedBooth(null)}
          booth={selectedBooth}
        />
      )}
    </>
  );
};

// ✅ Individual Booth Card
interface BoothCardProps {
  booth: BoothType;
  renterId: Id<"users">;
  onSeeDetails: (booth: BoothType) => void;
}

export const BoothCard: React.FC<BoothCardProps> = ({
  booth,
  renterId,
  onSeeDetails,
}) => {
  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, {
    storageIds: booth.thumbnail ? [booth.thumbnail] : [],
  });
  const imageUrl = urls?.[0];

  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  return (
    <>
      {/* Booth Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col">
        {/* Image */}
        <div className="relative h-44 w-full bg-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={booth.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="h-10 w-10 mb-1" />
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Availability Badge */}
          <span
            className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
              booth.availability_status === "available"
                ? "bg-green-100 text-green-700"
                : booth.availability_status === "reserved"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {booth.availability_status.charAt(0).toUpperCase() +
              booth.availability_status.slice(1)}
          </span>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-800 font-semibold text-lg truncate">
              {booth.name}
            </h3>
            <p className="text-gray-500 text-sm mt-1">Size: {booth.size}</p>
            <p className="text-gray-500 text-sm mt-0.5">
              Price: ₱{booth.price.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex space-x-2">
            {/* Reserve Booth */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsReserveModalOpen(true)}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition ${
                booth.availability_status === "available"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={booth.availability_status !== "available"}
            >
              {booth.availability_status === "available"
                ? "Reserve Booth"
                : "Unavailable"}
            </motion.button>

            {/* See Details */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSeeDetails(booth)} // 👈 Open modal
              className="flex-1 text-xs font-semibold py-2 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
            >
              See Details
            </motion.button>
          </div>
        </div>
      </div>

      {/* ✅ Reserve Booth Modal */}
      <ReserveBoothModal
        booth={booth}
        renterId={renterId}
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
      />
    </>
  );
};
