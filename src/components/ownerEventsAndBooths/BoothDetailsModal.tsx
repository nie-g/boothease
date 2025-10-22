import { motion } from "framer-motion";
import { X, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import BoothLayoutModal from "./BoothLayoutModal";
import EditBoothModal from "./EditBoothModal";

interface BoothType {
  _id: Id<"booths">;
  name: string;
  description?: string;
  status: string;
  price: number;
  location: string;
  eventId: Id<"events">;
  createdAt: number;
  size: string;
  ownerId?: Id<"users">;
  thumbnail?: Id<"_storage">;
  booth_layout?: Id<"_storage">;
}

interface BoothDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booth: BoothType;
}

const BoothDetailsModal: React.FC<BoothDetailsModalProps> = ({ isOpen, onClose, booth }) => {
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const owner = booth.ownerId
    ? useQuery(api.userQueries.getUserById, { userId: booth.ownerId })
    : undefined;

  const storageIds = [booth.thumbnail].filter(Boolean) as Id<"_storage">[];
  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds }) ?? [];
  const thumbnailUrl = urls[0] ?? undefined;

  const boothImages = useQuery(api.booth_images.getByBoothId, { boothId: booth._id }) ?? [];
  const extraStorageIds = boothImages.map((img) => img.storageId) as Id<"_storage">[];
  const extraImageUrls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds: extraStorageIds }) ?? [];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const showCarousel = extraImageUrls.length > 3;
  const handleNext = () => {
    if (currentIndex < extraImageUrls.length - 3) setCurrentIndex((i) => i + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

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
            <h2 className="text-xl font-semibold text-gray-600">Booth Details</h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnail + Details */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start">
              {thumbnailUrl ? (
                <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-[200px] aspect-square bg-gray-100 rounded-xl border border-dashed">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="w-full md:w-2/3 space-y-2 text-gray-700">
              <Detail label="Name" value={booth.name} />
              <Detail label="Location" value={booth.location} />
              <Detail label="Price" value={`₱${booth.price.toLocaleString()}`} />
              <Detail label="Owner" value={owner?.fullname || "Loading..."} />
              <Detail label="Status" value={<span className="capitalize">{booth.status}</span>} />
              <Detail label="Created At" value={new Date(booth.createdAt).toLocaleString()} />
              {booth.description && <Detail label="Description" value={booth.description} />}

              <div className="mt-3 flex gap-3">
                {booth.booth_layout && (
                    <button
                    onClick={() => setIsLayoutOpen(true)}
                    className="px-4 py-2 bg-orange-400 text-white text-sm rounded-lg hover:bg-orange-500 transition"
                    >
                    View Booth Layout
                    </button>
                )}

                {/* 🛠️ Edit Details Button */}
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition"
                    >
                    Edit Details
                </button>
                </div>
            </div>
          </div>

          {/* Extra Images Section */}
          {extraImageUrls.length > 0 && (
            <div className="mt-6">
              <h4 className="text-base font-medium text-gray-800 mb-2">
                Booth Images Gallery
              </h4>

              {/* Carousel if >3 images */}
              {showCarousel ? (
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
                            alt={`Booth image ${idx + 1}`}
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
                // Regular Grid if ≤3 images
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
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Booth Layout Modal */}
      {booth.booth_layout && (
        <BoothLayoutModal
          isOpen={isLayoutOpen}
          onClose={() => setIsLayoutOpen(false)}
          layoutId={booth.booth_layout}
        />
      )}
      {isEditOpen && (
        <EditBoothModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            booth={booth}
        />
        )}
    </>
  );
};

// Detail Row Component
const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="font-medium text-gray-800 w-28 shrink-0">{label}:</span>
    <span className="text-gray-600 flex-1">{value}</span>
  </div>
);

export default BoothDetailsModal;
