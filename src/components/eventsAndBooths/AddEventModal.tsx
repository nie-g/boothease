import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Upload, ImageIcon } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import MapPicker from "../MapPicker";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function AddEventModal({ isOpen, onClose, userId }: AddEventModalProps) {
  const { user } = useUser();

  // ✅ Convex actions
  const createEvent = useMutation(api.events.createEvent);
  const saveEventThumbnail = useAction(api.events.saveEventThumbnail);
  const saveEventImages = useAction(api.event_images.saveEventImages); // ✅ new action for event images

  const getUserByClerkId = useQuery(api.userQueries.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  // -------------------------------
  // 🧩 Form State
  // -------------------------------
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: {
      address: "",
      lat: 14.5995,
      lng: 120.9842,
    },
    status: "upcoming" as "upcoming" | "ongoing" | "ended",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // ✅ New: multiple event images
  const [eventImages, setEventImages] = useState<File[]>([]);

  // -------------------------------
  // 🔁 Helpers
  // -------------------------------
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: {
        address: "",
        lat: 14.5995,
        lng: 120.9842,
      },
      status: "upcoming",
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setEventImages([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "address") {
      setForm((prev) => ({ ...prev, location: { ...prev.location, address: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMapSelect = (latlng: { lat: number; lng: number }) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, lat: latlng.lat, lng: latlng.lng },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === "thumbnail") {
      const file = files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (name === "eventImages") {
      setEventImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const removeEventImage = (index: number) => {
    setEventImages((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------
  // 💾 Submit
  // -------------------------------
  const handleSubmit = async () => {
    const creatorId = userId || user?.id;
    if (!creatorId) return alert("You must be logged in.");
    if (!form.title || !form.startDate || !form.endDate)
      return alert("Please fill out all required fields.");
    if (!getUserByClerkId) return alert("User data not found or still loading.");

    try {
      setLoading(true);
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = end.getTime() - start.getTime();
      const numberOfDays = diffTime >= 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 : 1;

      const eventId = await createEvent({
        title: form.title,
        description: form.description || undefined,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        numberOfDays,
        location: {
          address: form.location.address || undefined,
          lat: form.location.lat,
          lng: form.location.lng,
        },
        createdBy: getUserByClerkId._id,
      });

      // ✅ Save thumbnail
      if (thumbnailFile) {
        const arrayBuffer = await thumbnailFile.arrayBuffer();
        await saveEventThumbnail({ eventId, fileBytes: arrayBuffer });
      }

      // ✅ Save multiple event images
      for (const img of eventImages) {
        const buffer = await img.arrayBuffer();
        await saveEventImages({
          eventId,
          userId: getUserByClerkId._id,
          fileBytes: buffer,
        });
      }

      alert("✅ Event added successfully!");
      handleClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add event.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // -------------------------------
  // 🧱 UI
  // -------------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Event</h2>
          <button aria-label="Close" onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <input
            name="title"
            placeholder="Event Title"
            className="w-full border border-slate-400 rounded-lg px-3 py-2"
            onChange={handleChange}
            value={form.title}
          />

          <textarea
            name="description"
            placeholder="Description"
            className="w-full border border-slate-400 rounded-lg px-3 py-2"
            onChange={handleChange}
            value={form.description}
          />

          {/* Thumbnail Upload */}
          {/* Event Thumbnail Upload */}
          <div className="flex flex-col gap-2">
            {/* Label + Upload button beside each other */}
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Event Thumbnail</label>
              <label
                htmlFor="thumbnail"
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <Upload className="h-4 w-4 text-amber-600" />
                <span>Upload</span>
                <input
                  id="thumbnail"
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image preview under both */}
            {thumbnailPreview && (
              <div className="mt-2 flex border border-dashed border-gray-200 rounded-lg p-2 relative group">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>


          {/* ✅ Event Images Upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Event Images</label>
              <label
                htmlFor="eventImages"
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <ImageIcon className="h-4 w-4 text-amber-600" />
                <span>Upload</span>
                <input
                  id="eventImages"
                  type="file"
                  name="eventImages"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {eventImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {eventImages.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Event Image ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeEventImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex gap-2">
            <input
              placeholder="Start Date"
              type="date"
              name="startDate"
              className="w-1/2 border border-slate-400 rounded-lg px-3 py-2"
              onChange={handleChange}
              value={form.startDate}
            />
            <input
              placeholder="End Date"
              type="date"
              name="endDate"
              className="w-1/2 border border-slate-400 rounded-lg px-3 py-2"
              onChange={handleChange}
              value={form.endDate}
            />
          </div>

          <input
            name="address"
            placeholder="Event Address"
            className="w-full border border-slate-400 rounded-lg px-3 py-2"
            onChange={handleChange}
            value={form.location.address}
          />

          {/* Map Picker */}
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">📍 Click on the map to select event location:</p>
            <MapPicker
              onSelect={handleMapSelect}
              savedLocation={{ lat: form.location.lat, lng: form.location.lng }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white z-10 px-6 py-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition"
          >
            {loading ? "Saving..." : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
