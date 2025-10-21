import { useEffect, useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { X, Upload, ImageIcon } from "lucide-react";

interface AddBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
}

export default function AddBoothModal({
  isOpen,
  onClose,
  defaultEventId,
}: AddBoothModalProps) {
  const { user } = useUser();
  const getUserByClerkId = useQuery(api.userQueries.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const events = useQuery(api.events.listAllEvents);

  const createBooth = useMutation(api.booths.createBooth);
  const saveBoothThumbnail = useAction(api.booths.saveBoothThumbnail);
  const saveBoothLayout = useAction(api.booths.saveBoothLayout);
  const saveBoothImages = useAction(api.booth_images.saveBoothImages);

  const defaultForm = {
    eventId: defaultEventId || "",
    name: "",
    size: "",
    price: "",
    location: "",
    dailyOperatingHours: "", // <--- new field
    status: "pending",
    availability_status: "available",
    thumbnail: null as File | null,
    boothImages: [] as File[],
    boothLayout: null as File | null, 
  };

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === "thumbnail") {
      setForm((prev) => ({ ...prev, thumbnail: files[0] }));
    } else if (name === "boothImages") {
      setForm((prev) => ({
        ...prev,
        boothImages: [...prev.boothImages, ...Array.from(files)],
      }));
    } else if (name === "boothLayout") {
      setForm((prev) => ({ ...prev, boothLayout: files[0] }));
    }
  };

  const removeBoothImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      boothImages: prev.boothImages.filter((_, i) => i !== index),
    }));
  };

  // Helper to check if all required fields are filled
  const isFormValid = () => {
    return (
      form.eventId &&
      form.name &&
      form.size &&
      form.price &&
      form.dailyOperatingHours &&
      form.location &&
      form.thumbnail &&
      form.boothLayout &&
      form.boothImages.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!user || !getUserByClerkId?._id)
      return alert("You must be logged in.");

   const { eventId, name, size, price, dailyOperatingHours, location } = form;
  if (!eventId || !name || !size || !price || !dailyOperatingHours || !location)
  return alert("Please fill out all required fields.");


    try {
      setLoading(true);

      const boothId = await createBooth({
        eventId: eventId as any,
        ownerId: getUserByClerkId._id as any,
        name,
        size,
        price: parseFloat(price),
        dailyOperatingHours: parseFloat(dailyOperatingHours), 
        location,
        status: "pending",
        availability_status: "available",
      });

      if (form.thumbnail) {
        const buffer = await form.thumbnail.arrayBuffer();
        await saveBoothThumbnail({ boothId, fileBytes: buffer });
      }
      if (form.boothLayout) {
        const buffer = await form.boothLayout.arrayBuffer();
        await saveBoothLayout({ boothId, fileBytes: buffer }); // <-- create API action for saving layout
      }

      for (const img of form.boothImages) {
        const buffer = await img.arrayBuffer();
        await saveBoothImages({
          boothId,
          userId: getUserByClerkId._id,
          fileBytes: buffer,
        });
      }

      alert("✅ Booth added successfully!");
      setForm(defaultForm);
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add booth.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh] border border-gray-200">
        {/* Header */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Add New Booth
        </h2>

        <div className="space-y-4">
          {/* Event Selection */}
          <select
            aria-label="Event"
            name="eventId"
            className="w-full border rounded-xl px-3 py-2 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.eventId}
            disabled={!!defaultEventId}
          >
            <option value="">Select Event</option>
            {events?.map((ev) => (
              <option key={ev._id.toString()} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Booth Name */}
          <input
            name="name"
            placeholder="Booth Name"
            className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.name}
          />

          {/* Size & Price */}
        {/* Size, Price & Hours per Day */}
        <div className="grid grid-cols-3 gap-3">
          <input
            name="size"
            placeholder="Size (e.g., 3x3m)"
            className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.size}
          />
          <input
            type="number"
            name="price"
            placeholder="Price Per Day"
            className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.price}
          />
          <input
            type="number"
            name="dailyOperatingHours"
            placeholder="Operating hours"
            min="1"
            max="24"
            className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.dailyOperatingHours}
          />
        </div>


          {/* Location */}
          <input
            name="location"
            placeholder="Location (e.g., Hall A - Booth 12)"
            className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.location}
          />

          {/* Thumbnail Upload - Smaller */}
          {/* Thumbnail Upload */}
          <div className="flex flex-col gap-2">
            {/* Label + Upload button beside each other */}
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Booth   Thumbnail</label>
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
            {form.thumbnail && (
              <div className="mt-2 flex border border-dashed border-gray-200 rounded-lg p-2">
                <img
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="Thumbnail preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
          {/* Booth Layout Upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Booth Layout</label>
              <label
                htmlFor="boothLayout"
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <Upload className="h-4 w-4 text-amber-600" />
                <span>Upload</span>
                <input
                  id="boothLayout"
                  type="file"
                  name="boothLayout"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {form.boothLayout && (
              <div className="mt-2 flex border border-dashed border-gray-200 rounded-lg p-2">
                <img
                  src={URL.createObjectURL(form.boothLayout)}
                  alt="Booth Layout preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Booth Images Upload */}
          <div className="flex flex-col gap-2">
            {/* Label + Upload button beside each other */}
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Booth Images</label>
              <label
                htmlFor="boothImages"
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <ImageIcon className="h-4 w-4 text-amber-600" />
                <span>Upload</span>
                <input
                  id="boothImages"
                  type="file"
                  name="boothImages"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image previews under both */}
            {form.boothImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.boothImages.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Booth ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeBoothImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
       <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()} // <-- disable if form incomplete
          className={`mt-6 w-full py-2.5 rounded-xl font-semibold transition
            ${isFormValid() ? "bg-orange-400 hover:bg-orange-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
        >
          {loading ? "Saving..." : "Add Booth"}
        </button>
      </div>
    </div>
  );
}
