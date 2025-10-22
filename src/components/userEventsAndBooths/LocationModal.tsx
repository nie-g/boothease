import React from "react";
import { motion } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

// ✅ Fix missing Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    address?: string;
    lat: number;
    lng: number;
  };
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location }) => {
  if (!isOpen) return null;

  const coords: LatLngExpression = [location.lat, location.lng];
  const hasValidCoords = location.lat && location.lng;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Event Location
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address + Map */}
        <div className="space-y-3">
          <p className="text-gray-700 text-sm">
            {location.address || "No address provided"}
          </p>

          {hasValidCoords ? (
            <div className="w-full h-[350px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <MapContainer center={coords} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <Marker position={coords}></Marker>
              </MapContainer>
            </div>
          ) : (
            <p className="text-gray-400 italic">No map data available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LocationModal;
