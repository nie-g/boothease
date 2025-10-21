import React from "react";
import { motion } from "framer-motion";
import { ScanHeart, LayoutGrid } from "lucide-react";

interface DataSectionsProps {
  likedEvents: any[];
  previousBookings: any[];
}

const DataSections: React.FC<DataSectionsProps> = ({ likedEvents, previousBookings }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <DataCard
      title="Liked Events"
      icon={<ScanHeart className="text-gray-700" size={20} />}
      items={likedEvents}
      type="event"
    />
    <DataCard
      title="Previous Bookings"
      icon={<LayoutGrid className="text-gray-700" size={20} />}
      items={previousBookings}
      type="booking"
    />
  </div>
);

const DataCard = ({
  title,
  icon,
  items,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  type: "event" | "booking";
}) => (
  <div className="bg-gray-100 border border-gray-100 rounded-xl shadow-sm p-3 h-80 flex flex-col">
    <h2 className="text-xl font-semibold  flex items-center gap-2 text-gray-700 mb-3">
      {icon} {title}
    </h2>

    {/* Scrollable content area */}
    <div className="space-y-3 bg-white border border-gray-100 p-3 rounded-lg overflow-y-auto flex-1">
      {items?.length ? (
        items.map((item) => (
          <motion.div
            key={item._id}
            className="border border-gray-100 bg-gray-50 p-3 hover:shadow-md transition"
          >
            {type === "event" ? (
              <>
                <h4 className="font-medium text-gray-800">
                  {item.event?.title || "Untitled Event"}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(item.event?.startDate).toLocaleDateString()} –{" "}
                  {new Date(item.event?.endDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium text-gray-800">
                  {item.booth?.name} — ₱{item.totalPrice?.toLocaleString()}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(item.startDate).toLocaleDateString()} →{" "}
                  {new Date(item.endDate).toLocaleDateString()}
                </p>
              </>
            )}
          </motion.div>
        ))
      ) : (
        <p className="text-gray-400 italic text-center mt-10">
          No data available.
        </p>
      )}
    </div>
  </div>
);

export default DataSections;
