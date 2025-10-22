import React from "react";
import { Dialog } from "@headlessui/react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  totalPrice: number;
}

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, totalPrice }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal Panel */}
      <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 z-10">
        <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
          Reservation Billing
        </Dialog.Title>
        <p className="text-gray-700 mb-4">
          Your reservation has been approved! The total amount is:
        </p>
        <p className="text-2xl font-semibold text-teal-600 mb-6">
          ₱{totalPrice.toLocaleString()}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Close
        </button>
      </Dialog.Panel>
    </Dialog>
  );
};

export default BillingModal;
