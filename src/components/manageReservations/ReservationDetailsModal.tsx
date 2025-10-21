import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    _id: Id<"reservations">;
    boothId: Id<"booths">;
    renterId: Id<"users">;
    status: "pending" | "approved" | "declined" | "cancelled";
    startDate: string;
    endDate: string;
    totalPrice: number;
    paymentStatus: "unpaid" | "paid" | "refunded";
    createdAt: number;
    updatedAt?: number;
  };
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  if (!isOpen) return null;

  // ✅ Fetch booth and user using correct fields
  const booth = useQuery(api.booths.getById, { boothId: reservation.boothId });
  const renter = useQuery(api.userQueries.getById, { userId: reservation.renterId });

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Reservation Details
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-medium text-gray-900">Client: </span>
            {renter ? `${renter.firstName} ${renter.lastName}` : "Loading..."}
          </div>
          <div>
            <span className="font-medium text-gray-900">Booth: </span>
            {booth ? booth.name : "Loading..."}
          </div>
          <div>
            <span className="font-medium text-gray-900">Status: </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                reservation.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : reservation.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : reservation.status === "declined"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {reservation.status}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Payment: </span>
            {reservation.paymentStatus}
          </div>
          <div>
            <span className="font-medium text-gray-900">Date Range: </span>
            {reservation.startDate} → {reservation.endDate}
          </div>
          <div>
            <span className="font-medium text-gray-900">Total Price: </span>₱
            {reservation.totalPrice.toLocaleString()}
          </div>
          <div>
            <span className="font-medium text-gray-900">Created At: </span>
            {formatDate(reservation.createdAt)}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReservationDetailsModal;
