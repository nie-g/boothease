import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface BoothLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId: Id<"_storage">;
}

const BoothLayoutModal: React.FC<BoothLayoutModalProps> = ({ isOpen, onClose, layoutId }) => {
  if (!isOpen) return null;

  const [layoutUrl] = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds: [layoutId] }) ?? [undefined];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-4 overflow-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Booth Layout</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Image */}
        {layoutUrl ? (
          <div className="w-full h-full flex justify-center">
            <img
              src={layoutUrl}
              alt="Booth Layout"
              className="w-full max-h-[75vh] object-contain rounded-lg shadow"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 border border-dashed rounded-lg">
            Layout image not available
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BoothLayoutModal;
