import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, MapPin, DollarSign, Info } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import dayjs from "dayjs";

interface ReserveBoothModalProps {
  booth: {
    _id: Id<"booths">;
    name: string;
    size: string;
    price: number;
    location: string;
    status: "approved" | "pending" | "declined"| "cancelled";
    availability_status: "available" | "reserved" | "unavailable";
    eventId: Id<"events">;
  } | null;
  renterId: Id<"users">;
  isOpen: boolean;
  onClose: () => void;
}

const ReserveBoothModal: React.FC<ReserveBoothModalProps> = ({
  booth,
  renterId,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booth) return null;

  const event = useQuery(api.events.getById, { eventId: booth.eventId });
  const createReservation = useMutation(api.reservations.createReservation);

  const [startDate, setStartDate] = useState("");
  const [daysToRent, setDaysToRent] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const eventStart = event ? dayjs(event.startDate).format("YYYY-MM-DD") : "";
  const eventEnd = event ? dayjs(event.endDate).format("YYYY-MM-DD") : "";

  // ✅ Compute end date based on start date + days to rent
  const endDate = useMemo(() => {
    if (!startDate || !daysToRent) return "";
    return dayjs(startDate).add(daysToRent - 1, "day").format("YYYY-MM-DD");
  }, [startDate, daysToRent]);

  // ✅ Validate within event range
  useEffect(() => {
    if (startDate && eventStart && dayjs(startDate).isBefore(eventStart)) {
      setStartDate(eventStart);
    }
    if (endDate && eventEnd && dayjs(endDate).isAfter(eventEnd)) {
      setDaysToRent(dayjs(eventEnd).diff(dayjs(startDate), "day") + 1);
    }
  }, [startDate, endDate, eventStart, eventEnd]);

  const totalPrice = useMemo(() => daysToRent * booth.price, [daysToRent, booth.price]);

  const handleReserve = async () => {
    if (!startDate || daysToRent < 1) {
      alert("Please select a valid start date and days to rent.");
      return;
    }

    setIsLoading(true);
    try {
      await createReservation({
        boothId: booth._id,
        renterId,
        startDate,
        endDate,
        totalPrice,
      });
      alert("Reservation request sent!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to reserve booth. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#FFF9E9] rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-y-auto max-h-[90vh] p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reserve Booth</h2>
        <p className="text-gray-600 text-sm mb-6">
          Choose your start date and number of days to rent within the event’s duration.
        </p>

        {/* Booth Info */}
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-teal-600" />
            {booth.name}
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Size:</strong> {booth.size}
            </p>
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-teal-600" />
              {booth.location}
            </p>
            <p className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-teal-600" /> ₱
              {booth.price.toLocaleString()} / day
            </p>
            <p>
              <strong>Event:</strong> {event?.title || "Loading event..."}
            </p>
            {event && (
              <p className="text-xs text-gray-500">
                Available:{" "}
                {`${dayjs(event.startDate).format("MMM D, YYYY")} → ${dayjs(
                  event.endDate
                ).format("MMM D, YYYY")}`}
              </p>
            )}
          </div>
        </div>

        {/* Reservation Form */}
        <div className="space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              aria-label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={eventStart}
              max={eventEnd}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Days to Rent */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Days to Rent
            </label>
            <input
              aria-label="Days to Rent"
              type="number"
              min={1}
              max={event ? dayjs(event.endDate).diff(dayjs(event.startDate), "day") + 1 : 30}
              value={daysToRent}
              onChange={(e) => setDaysToRent(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-gray-800 font-medium">
            <span>
              <Calendar className="inline-block w-4 h-4 mr-1 text-teal-600" />
              Duration:
            </span>
            <span>
              {daysToRent} day(s) ({startDate && endDate
                ? `${dayjs(startDate).format("MMM D")} → ${dayjs(endDate).format(
                    "MMM D, YYYY"
                  )}`
                : "TBD"})
            </span>
          </div>
          <div className="flex justify-between text-gray-800 font-semibold mt-2">
            <span>
              <DollarSign className="inline-block w-4 h-4 mr-1 text-teal-600" />
              Total Price:
            </span>
            <span>₱{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReserve}
            disabled={isLoading || !startDate}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Reserve Booth"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReserveBoothModal;
