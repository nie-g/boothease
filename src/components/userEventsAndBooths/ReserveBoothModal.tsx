import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  CalendarDays,
  MapPin,
  DollarSign,
  Info,
  Clock,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import toast from "react-hot-toast";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface ReserveBoothModalProps {
  booth: {
    _id: Id<"booths">;
    name: string;
    size: string;
    price: number;
    location: string;
    status: "approved" | "pending" | "declined" | "cancelled";
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
  const reservations = useQuery(api.reservations.listAllReservations, {});
  const createReservation = useMutation(api.reservations.createReservation);

  const [startDate, setStartDate] = useState("");
  const [daysToRent, setDaysToRent] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const eventStart = event ? dayjs(event.startDate) : null;
  const eventEnd = event ? dayjs(event.endDate) : null;

  /** ⏱ Calculate end date based on start + days */
  const endDate = useMemo(() => {
    if (!startDate || !daysToRent) return "";
    return dayjs(startDate).add(daysToRent - 1, "day").format("YYYY-MM-DD");
  }, [startDate, daysToRent]);

  /** 🚫 Collect disabled (unavailable) days */
  const disabledDays = useMemo(() => {
    if (!reservations) return new Set<string>();
    const disabled = new Set<string>();
    reservations
      .filter(
        (r) =>
          r.boothId === booth._id &&
          (r.status === "pending" || r.status === "approved")
      )
      .forEach((r) => {
        let current = dayjs(r.startDate);
        const end = dayjs(r.endDate);
        while (current.isSameOrBefore(end)) {
          disabled.add(current.format("YYYY-MM-DD"));
          current = current.add(1, "day");
        }
      });
    return disabled;
  }, [reservations, booth._id]);

  /** ⚠️ Restrict startDate and daysToRent to avoid overlap dynamically */
  useEffect(() => {
    if (!startDate) return;
    const selectedStart = dayjs(startDate);
    // If selected start date is disabled, reset it
    if (disabledDays.has(selectedStart.format("YYYY-MM-DD"))) {
      alert("❌ That start date is already reserved.");
      setStartDate("");
      return;
    }

    // If extending days overlaps disabled days, adjust automatically
    const potentialEnd = selectedStart.add(daysToRent - 1, "day");
    let current = selectedStart.clone();
    while (current.isSameOrBefore(potentialEnd)) {
      if (disabledDays.has(current.format("YYYY-MM-DD"))) {
        const diff = current.diff(selectedStart, "day");
        setDaysToRent(diff); // adjust rental period
        toast.error("❌ Some of your selected dates are already reserved or pending.");
        break;
      }
      current = current.add(1, "day");
    }
  }, [startDate, daysToRent, disabledDays]);

  /** ⛔ Prevent selecting outside the event range */
  useEffect(() => {
    if (!eventStart || !eventEnd) return;
    if (startDate && dayjs(startDate).isBefore(eventStart)) {
      setStartDate(eventStart.format("YYYY-MM-DD"));
    }
    if (endDate && dayjs(endDate).isAfter(eventEnd)) {
      setDaysToRent(eventEnd.diff(dayjs(startDate), "day") + 1);
    }
  }, [startDate, endDate, eventStart, eventEnd]);

  /** 💰 Total Price */
  const totalPrice = useMemo(
    () => daysToRent * booth.price,
    [daysToRent, booth.price]
  );

  /** ✅ Prevent overlapping reservation submission */
  const handleReserve = async () => {
    if (!startDate || daysToRent < 1) {
      alert("Please select a valid start date and days to rent.");
      return;
    }

    const selectedDays: string[] = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    while (current.isSameOrBefore(end)) {
      selectedDays.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    const hasConflict = selectedDays.some((d) => disabledDays.has(d));
    if (hasConflict) {
      alert("❌ Some of your selected dates are already reserved or pending.");
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
      alert("✅ Reservation request sent!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to reserve booth. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 📅 Generate event calendar months */
  const generateEventRangeCalendar = () => {
    if (!eventStart || !eventEnd) return [];
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

  const eventMonths = useMemo(generateEventRangeCalendar, [eventStart, eventEnd]);

  /** 🖱 Handle selecting day from calendar (prevent overlaps) */
  const handleDateClick = (day: dayjs.Dayjs) => {
    const dateStr = day.format("YYYY-MM-DD");
    if (disabledDays.has(dateStr)) return;

    // Prevent startDate selection that would overlap
    const nextDisabled = day
      .add(1, "day")
      .format("YYYY-MM-DD");
    if (disabledDays.has(nextDisabled)) {
      setDaysToRent(1);
    }

    setStartDate(dateStr);
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

        {/* Header */}
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Reserve Booth
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Select your desired dates within the event’s schedule.
        </p>

        {/* Booth Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-amber-600" />
            {booth.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p>
              <strong>Size:</strong> {booth.size}
            </p>
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-amber-600" /> {booth.location}
            </p>
            <p className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-amber-600" />
              ₱{booth.price.toLocaleString()} / day
            </p>
            <p>
              <strong>Event:</strong> {event?.title || "Loading..."}
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
            Event Calendar
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
                      eventStart &&
                      eventEnd &&
                      day.isSameOrAfter(eventStart) &&
                      day.isSameOrBefore(eventEnd);

                    const isSelected =
                      startDate &&
                      dayjs(day).isSameOrAfter(startDate) &&
                      dayjs(day).isSameOrBefore(endDate);

                    const isDisabled = disabledDays.has(dateStr);

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateClick(day)}
                        disabled={!isEventDay || isDisabled}
                        className={`w-6 h-6 rounded-md transition-all duration-150 ${
                          !isEventDay
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isDisabled
                            ? "bg-red-200 text-gray-600 cursor-not-allowed"
                            : isSelected
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-amber-50 hover:bg-amber-100 text-gray-800"
                        }`}
                      >
                        {day.format("D")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 text-xs text-gray-600 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-400 rounded"></div>
              <span>Event Days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-300 rounded border"></div>
              <span>Reserved/Pending</span>
            </div>
          </div>
        </div>

        {/* Start Date + Days Input */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              aria-label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={eventStart?.format("YYYY-MM-DD")}
              max={eventEnd?.format("YYYY-MM-DD")}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Days to Rent
            </label>
            <input
              aria-label="Days to Rent"
              type="number"
              min={1}
              max={
                eventEnd && eventStart
                  ? eventEnd.diff(eventStart, "day") + 1
                  : 30
              }
              value={daysToRent}
              onChange={(e) => setDaysToRent(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" />
              Duration:
            </span>
            <span>
              {daysToRent} day(s){" "}
              {startDate && endDate
                ? `(${dayjs(startDate).format("MMM D")} → ${dayjs(
                    endDate
                  ).format("MMM D, YYYY")})`
                : ""}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-800 mt-2">
            <span>Total Price:</span>
            <span>₱{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReserve}
            disabled={isLoading || !startDate}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              isLoading || !startDate
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {isLoading ? "Processing..." : "Reserve Booth"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReserveBoothModal;
