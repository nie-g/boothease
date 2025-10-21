import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import type { Id } from "../../../convex/_generated/dataModel";

interface ManageReservationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: Id<"reservations">; // ✅ Use Convex Id type
  currentStatus: "pending" | "approved" | "declined" | "cancelled"; // ✅ Match schema
}

const ManageReservationStatusModal: React.FC<ManageReservationStatusModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  currentStatus,
}) => {
  const updateReservationStatus = useMutation(api.reservations.updateStatus);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

 const handleStatusChange = async (status: "approved" | "declined") => {
  try {
    setLoading(true);
    await updateReservationStatus({ reservationId, status });
    toast.success(`Reservation ${status === "approved" ? "approved" : "declined"} successfully!`);
    onClose();
  } catch (error) {
    toast.error("Something went wrong while updating reservation status.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close Button */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Reservation Status</h2>
          <p className="text-gray-600 text-sm mb-6">
            The current status of this reservation is{" "}
            <span className="font-semibold">{currentStatus}</span>.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleStatusChange("declined")}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={() => handleStatusChange("approved")}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ManageReservationStatusModal;
