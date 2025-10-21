import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import type { LeafletMouseEvent, LatLngExpression } from "leaflet";
import L from "leaflet";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  onSelect: (latlng: { lat: number; lng: number }) => void;
  savedLocation?: { lat: number; lng: number };
}

const LocationMarker: React.FC<{
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  savedLocation?: { lat: number; lng: number };
}> = ({ onLocationSelect, savedLocation }) => {
  const [position, setPosition] = useState<LatLngExpression | null>(
    savedLocation || null
  );

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const MapPicker: React.FC<MapPickerProps> = ({ onSelect, savedLocation }) => {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-400 shadow-md ">
      <MapContainer
        center={(savedLocation as LatLngExpression) || [14.5995, 120.9842]} // Manila center
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <LocationMarker onLocationSelect={onSelect} savedLocation={savedLocation} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
