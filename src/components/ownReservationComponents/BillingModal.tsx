import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// Type for each item in the billing breakdown
interface BreakdownItem {
  item: string;
  numberOfDays?: number;
  amount?: number;
}

// Type for the selected billing
interface Billing {
  _id: string;
  reservationId: string;
  clientId: string;
  numberOfDays: number;
  amount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  transactionDate: string;
  client?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
  breakdown?: BreakdownItem[];
}

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  renterId?: Id<"users">; // Pass as Convex Id type
  reservationId?: Id<"reservations">; // Alternative: pass reservation ID
  totalPrice?: number; // Alternative: pass total price directly
}

const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  renterId,
}) => {
  // Fetch billings if renterId is provided
  const billings = useQuery(
    api.billing.getByBillingRenter,
    renterId ? { renterId } : "skip"
  );
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mutation to update billing status
  const updateBillingStatus = useMutation(api.billing.updateBillingStatus);

  useEffect(() => {
    if (billings && billings.length > 0) {
      setSelectedBilling(billings[0] as Billing);
    }
  }, [billings]);

  const handleStatusUpdate = async (newStatus: "paid" | "refunded") => {
    if (!selectedBilling) return;

    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      await updateBillingStatus({
        billingId: selectedBilling._id as Id<"billing">,
        paymentStatus: newStatus,
        transactionDate: new Date().toISOString(),
      });

      // Update local state
      setSelectedBilling({
        ...selectedBilling,
        paymentStatus: newStatus,
        transactionDate: new Date().toISOString(),
      });

      setUpdateMessage({
        type: "success",
        text: `Billing status updated to ${newStatus.toUpperCase()}`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Error updating billing status:", error);
      setUpdateMessage({
        type: "error",
        text: "Failed to update billing status. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !selectedBilling) return null;

  const {
    _id,
    numberOfDays,
    amount,
    paymentStatus,
    transactionDate,
    client,
    breakdown = []
  } = selectedBilling;

  // Map breakdown to calculate quantity, unitPrice, and total
  const items = breakdown.length > 0
    ? breakdown.map((b: BreakdownItem) => {
        const quantity = b.numberOfDays ?? numberOfDays ?? 1;
        const total = b.amount ?? amount ?? 0;
        const unitPrice = quantity ? total / quantity : 0;
        return { ...b, quantity, unitPrice, total };
      })
    : [{
        item: "Reservation Fee",
        numberOfDays,
        quantity: numberOfDays,
        unitPrice: numberOfDays ? amount / numberOfDays : amount,
        total: amount,
        amount
      }];

  const displaySubtotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const displayFinal = amount;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 z-10 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Invoice</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill To + Invoice Info */}
        <div className="flex justify-between mb-6 text-sm text-gray-700">
          <div>
            <h4 className="font-bold">Billed to:</h4>
            <p>{client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : "Client Name"}</p>
            {client?.phone && <p>{client.phone}</p>}
            {client?.address && <p>{client.address}</p>}
          </div>
          <div className="text-right">
            <p>Invoice No. {_id ? _id.slice(0, 8).toUpperCase() : "N/A"}</p>
            <p>Date: {transactionDate ? new Date(transactionDate).toLocaleDateString() : "N/A"}</p>
            <p className="mt-2 font-semibold">Status: <span className={`${
              paymentStatus === "paid" ? "text-green-600" :
              paymentStatus === "pending" ? "text-yellow-600" :
              "text-red-600"
            }`}>{paymentStatus.toUpperCase()}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left border-t border-b border-gray-300 mb-6 text-sm">
          <thead>
            <tr className="text-gray-600">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Quantity (Days)</th>
              <th className="py-2 text-center">Unit Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b, idx) => (
              <tr key={idx} className="border-t border-gray-200">
                <td className="py-2">{b.item}</td>
                <td className="text-center">{b.quantity}</td>
                <td className="text-center">₱{b.unitPrice.toLocaleString()}</td>
                <td className="text-right">₱{b.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-1 text-sm">
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Subtotal</span>
              <span>₱{displaySubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span>Total</span>
              <span>₱{displaySubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg bg-gray-50 text-gray-800 px-2 py-1 rounded">
              <span>Final Price</span>
              <span>₱{displayFinal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status Update Message */}
        {updateMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              updateMessage.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {updateMessage.text}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between gap-3 mt-6">
          <div className="flex gap-2">
            {paymentStatus !== "paid" && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("paid")}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
              >
                Mark as Paid
              </button>
            )}
            {paymentStatus !== "refunded" && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("refunded")}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-red-400 text-white hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Refund
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default BillingModal;
