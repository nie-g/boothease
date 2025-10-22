import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  CalendarDays,
  MapPin,
  DollarSign,
  Info,
  Clock,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import toast from "react-hot-toast";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface ReservationDetailsModalProps {
  reservationId: Id<"reservations"> | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservationId,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !reservationId) return null;

  // ✅ Step 1: Get reservation
  const reservation = useQuery(api.reservations.getById, { reservationId });

  // ✅ Step 2: Get booth only if reservation exists
  const booth = useQuery(
    api.booths.getById,
    reservation?.boothId ? { boothId: reservation.boothId } : "skip"
  );

  // ✅ Step 3: Get event only if booth exists
  const event = useQuery(
    api.events.getById,
    booth?.eventId ? { eventId: booth.eventId } : "skip"
  );

  const cancelReservation = useMutation(api.reservations.cancelReservation);

  const handleCancel = async () => {
    if (!reservation) return;
    const confirmCancel = window.confirm("Cancel this reservation?");
    if (!confirmCancel) return;

    try {
      await cancelReservation({ reservationId: reservation._id });
      toast.success("Reservation cancelled successfully.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation.");
    }
  };

  /** 📅 Generate event calendar */
  const generateEventRangeCalendar = () => {
    if (!event) return [];
    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);
    const months = [];
    let currentMonth = eventStart.startOf("month");

    while (
      currentMonth.isBefore(eventEnd, "month") ||
      currentMonth.isSame(eventEnd, "month")
    ) {
      const startOfMonth = currentMonth.clone().startOf("month");
      const endOfMonth = currentMonth.clone().endOf("month");
      const daysInMonth = [];

      let day = startOfMonth.clone();
      while (day.isBefore(endOfMonth) || day.isSame(endOfMonth)) {
        daysInMonth.push(day.clone());
        day = day.add(1, "day");
      }

      months.push({
        monthLabel: currentMonth.format("MMMM YYYY"),
        days: daysInMonth,
      });

      currentMonth = currentMonth.add(1, "month");
    }

    return months;
  };

  const eventMonths = useMemo(generateEventRangeCalendar, [event]);

  const isReservedDay = (day: dayjs.Dayjs) => {
    if (!reservation) return false;
    const start = dayjs(reservation.startDate);
    const end = dayjs(reservation.endDate);
    return day.isSameOrAfter(start) && day.isSameOrBefore(end);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] border border-gray-200 p-6"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Reservation Details
        </h2>

        {!reservation ? (
          <p className="text-center text-gray-500">Loading details...</p>
        ) : (
          <>
            {/* Booth Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-amber-600" />
                {booth?.name || "Loading Booth..."}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <strong>Size:</strong> {booth?.size ?? "-"}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  {booth?.location ?? "-"}
                </p>
                <p className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  ₱{booth?.price?.toLocaleString() ?? "0"} / day
                </p>
                <p>
                  <strong>Event:</strong> {event?.title ?? "Loading..."}
                </p>
              </div>

              {event && (
                <p className="text-xs text-gray-500 mt-1">
                  Available: {dayjs(event.startDate).format("MMM D, YYYY")} →{" "}
                  {dayjs(event.endDate).format("MMM D, YYYY")}
                </p>
              )}
            </div>

            {/* Calendar Section */}
            <div className="mb-6">
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-3">
                <CalendarDays className="w-5 h-5 text-amber-600" />
                Reservation Calendar
              </label>

              <div className="flex overflow-x-auto gap-4 pb-2 px-1 no-scrollbar">
                {eventMonths.map(({ monthLabel, days }) => (
                  <div
                    key={monthLabel}
                    className="min-w-[220px] flex-shrink-0 border rounded-2xl p-3 bg-white shadow-sm"
                  >
                    <h4 className="text-center text-sm font-semibold text-gray-800 mb-2">
                      {monthLabel}
                    </h4>

                    <div className="grid grid-cols-7 text-[10px] font-semibold text-gray-500 mb-1 text-center">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                        <div key={d} className="py-0.5">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-[11px] text-center">
                      {days.map((day) => {
                        const dateStr = day.format("YYYY-MM-DD");
                        const isEventDay =
                          event &&
                          day.isSameOrAfter(dayjs(event.startDate)) &&
                          day.isSameOrBefore(dayjs(event.endDate));

                        const reserved = isReservedDay(day);

                        return (
                          <div
                            key={dateStr}
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              !isEventDay
                                ? "bg-gray-100 text-gray-400"
                                : reserved
                                ? "bg-amber-500 text-white"
                                : "bg-amber-50 text-gray-800"
                            }`}
                          >
                            {day.format("D")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 text-xs text-gray-600 mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-400 rounded"></div>
                  <span>Reserved Days</span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Duration:
                </span>
                <span>
                  {dayjs(reservation.startDate).format("MMM D, YYYY")} →{" "}
                  {dayjs(reservation.endDate).format("MMM D, YYYY")}
                </span>
              </div>

              <div className="flex justify-between text-sm font-medium text-gray-700 mt-1">
                <span>Status:</span>
                <span
                  className={`capitalize font-semibold ${
                    reservation.status === "approved"
                      ? "text-green-600"
                      : reservation.status === "pending"
                      ? "text-amber-600"
                      : reservation.status === "declined"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {reservation.status}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold text-gray-800 mt-2">
                <span>Total Price:</span>
                <span>₱{reservation.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
              {(reservation.status === "pending" ||
                reservation.status === "approved") && (
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition"
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ReservationDetailsModal;
