import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Activity } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import type { Id } from "../../../convex/_generated/dataModel";

interface Reservation {
  id: Id<"reservations">;
  boothName: string;
  renterName: string;
  eventName: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  totalPrice: number;
}

interface AllReservationsSectionProps {
  reservations: Reservation[];
  isLoading: boolean;
}

const AllReservationsSection: React.FC<AllReservationsSectionProps> = ({
  reservations,
  isLoading,
}) => {
  const navigate = useNavigate();


  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">All Reservations</h2>
        <button
          onClick={() => navigate("/owner/reservations")}
          className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
        >
          View Details 
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block p-3 bg-teal-100 rounded-full mb-4">
            <Activity className="h-6 w-6 text-teal-500 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
            <FileText className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-600">No reservations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reservations.slice(0, 6).map((res) => (
            <div
              key={res.id}
              className="p-5 transition-all border border-gray-200 shadow-sm bg-gradient-to-r from-white to-teal-50 rounded-xl hover:shadow-md hover:border-teal-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
                  {res.boothName}
                </h3>
                <StatusBadge status={res.status} />
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Renter: <span className="font-medium">{res.renterName}</span>
              </p>

              <p className="text-sm text-gray-600 mb-1">
                Event: <span className="font-medium">{res.eventName}</span>
              </p>

              <p className="text-xs text-gray-500 mb-2">
                {new Date(res.startDate).toLocaleDateString()} -{" "}
                {new Date(res.endDate).toLocaleDateString()}
              </p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  ₱{res.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllReservationsSection;
