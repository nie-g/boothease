import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CheckCircle, XCircle, X } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface ManageBoothStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  boothId: Id<"booths">;
  boothName: string;
  currentStatus: string;
}

const ManageBoothStatusModal: React.FC<ManageBoothStatusModalProps> = ({
  isOpen,
  onClose,
  boothId,
  boothName,
  currentStatus,
}) => {
  const approveBooth = useMutation(api.booths.approveBooth);
  const declineBooth = useMutation(api.booths.declineBooth);

  if (!isOpen) return null;

  const handleApprove = async () => {
    await approveBooth({ boothId });
    onClose();
  };

  const handleDecline = async () => {
    await declineBooth({ boothId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Manage Booth Status</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-6">
          You are managing the status of booth:{" "}
          <span className="font-medium text-gray-900">{boothName}</span>.
        </p>

        <p className="text-sm text-gray-600 mb-6">
          Current status:{" "}
          <span className="font-semibold capitalize">{currentStatus}</span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleDecline}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Decline
          </button>
          <button
            onClick={handleApprove}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageBoothStatusModal;
