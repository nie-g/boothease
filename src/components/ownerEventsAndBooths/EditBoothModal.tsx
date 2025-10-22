import { useEffect, useState, useMemo } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Upload } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

interface EditBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  booth: {
    _id: Id<"booths">;
    name: string;
    price: number;
    size: string;
    location: string;
    dailyOperatingHours?: number;
    eventId: Id<"events">;
    thumbnail?: Id<"_storage">;
    booth_layout?: Id<"_storage">;
  };
}

export default function EditBoothModal({ isOpen, onClose, booth }: EditBoothModalProps) {
  const { user } = useUser();
  const currentUser = useQuery(api.userQueries.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  const events = useQuery(api.events.listAllEvents);
  const updateBooth = useMutation(api.booths.updateBooth);
  const saveBoothThumbnail = useAction(api.booths.saveBoothThumbnail);
  const saveBoothLayout = useAction(api.booths.saveBoothLayout);
  const uploadBoothImage = useAction(api.booth_images.uploadSingleBoothImage);
  const deleteBoothImages = useMutation(api.booth_images.deleteBoothImages); // ✅ new

  // Fetch existing booth images
  const boothImages = useQuery(api.booth_images.getByBoothId, { boothId: booth._id }) ?? [];

  // Fetch existing URLs (thumbnail, layout, images)
  const storageIds = [
    booth.thumbnail,
    booth.booth_layout,
    ...boothImages.map((img) => img.storageId),
  ].filter(Boolean) as Id<"_storage">[];

  const urls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds }) ?? [];

  const existingThumbnailUrl = booth.thumbnail ? urls[0] : undefined;
  const existingLayoutUrl = booth.booth_layout
    ? booth.thumbnail
      ? urls[1]
      : urls[0]
    : undefined;

  const existingImageUrls = useMemo(() => {
    let offset = 0;
    if (booth.thumbnail) offset++;
    if (booth.booth_layout) offset++;
    return urls.slice(offset);
  }, [urls, booth]);

  // ✅ temporary local storage for booth images (URLs + Files)
  const [tempImages, setTempImages] = useState<(string | File)[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<Id<"_storage">[]>([]);

  // preload existing DB images into tempImages
  useEffect(() => {
  if (existingImageUrls.length > 0) {
    // Filter out nulls to match (string | File)[]
    setTempImages(existingImageUrls.filter((url): url is string => url !== null));
  }
}, [existingImageUrls]);

  const [form, setForm] = useState({
    eventId: booth.eventId || "",
    name: booth.name || "",
    size: booth.size || "",
    price: booth.price?.toString() || "",
    dailyOperatingHours: booth.dailyOperatingHours?.toString() || "",
    location: booth.location || "",
    thumbnail: null as File | null,
    boothLayout: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        eventId: booth.eventId || "",
        name: booth.name || "",
        size: booth.size || "",
        price: booth.price?.toString() || "",
        dailyOperatingHours: booth.dailyOperatingHours?.toString() || "",
        location: booth.location || "",
        thumbnail: null,
        boothLayout: null,
      });
  // ✅ Filter out nulls so types align
     setTempImages(existingImageUrls.filter((url): url is string => url !== null));
    }
  }, [isOpen, booth, existingImageUrls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add / Remove temp images
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { files } = e.target;
  if (!files || files.length === 0) return;

    setTempImages((prev) => [...prev, ...Array.from(files)]);
};

  const handleRemoveTempImage = (index: number) => {
  const removed = tempImages[index];

  // If removed item is a string (existing URL), find its storageId
  if (typeof removed === "string") {
    const existingImg = boothImages.find(
      (img) => urls.includes(removed) && img.storageId
    );
    if (existingImg) {
      setDeletedImageIds((prev) => [...prev, existingImg.storageId]);
    }
  }

  setTempImages((prev) => prev.filter((_, i) => i !== index));
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === "thumbnail") {
      setForm((prev) => ({ ...prev, thumbnail: files[0] }));
    } else if (name === "boothLayout") {
      setForm((prev) => ({ ...prev, boothLayout: files[0] }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!canSubmit) {
        toast.error("Please fill in all required fields before submitting.");
        return;
      }

      setLoading(true);

      await updateBooth({
        boothId: booth._id,
        name: form.name,
        size: form.size,
        price: parseFloat(form.price),
        dailyOperatingHours: parseFloat(form.dailyOperatingHours),
        location: form.location,
        eventId: form.eventId as any,
      });

      if (form.thumbnail) {
        const buffer = await form.thumbnail.arrayBuffer();
        await saveBoothThumbnail({ boothId: booth._id, fileBytes: buffer });
      }

      if (form.boothLayout) {
        const buffer = await form.boothLayout.arrayBuffer();
        await saveBoothLayout({ boothId: booth._id, fileBytes: buffer });
      }

      // ✅ Replace all booth images with tempImages
      
      const newFiles = tempImages.filter((img) => img instanceof File) as File[];

        // Delete removed images from DB
        if (deletedImageIds.length > 0) {
        await Promise.all(
            deletedImageIds.map((id) =>
            deleteBoothImages({ boothId: booth._id, storageIds: [id] })
            )
        );
        setDeletedImageIds([]); // clear after deletion
        }
        // If there are new files, upload them
        if (newFiles.length > 0) {
        await Promise.all(
        newFiles.map(async (file) => {
            const buffer = await file.arrayBuffer();
            await uploadBoothImage({
            boothId: booth._id,
            userId: currentUser?._id as any,
            fileBytes: buffer,
            });
        })
        );
        }

      toast.success("Booth updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update booth.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    form.name.trim() !== "" &&
    form.size.trim() !== "" &&
    form.price.trim() !== "" &&
    form.location.trim() !== "" &&
    form.eventId !== "" &&
    (form.thumbnail !== null ||
      form.boothLayout !== null ||
      tempImages.length > 0 ||
      form.name !== booth.name ||
      form.size !== booth.size ||
      form.price !== booth.price.toString() ||
      form.location !== booth.location ||
      form.dailyOperatingHours !== booth.dailyOperatingHours?.toString());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh] border border-gray-200">
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Edit Booth Details
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          <select
            aria-label="Event"
            name="eventId"
            className="w-full border rounded-xl px-3 py-2 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={handleChange}
            value={form.eventId}
          >
            <option value="">Select Event</option>
            {events?.map((ev) => (
              <option key={ev._id.toString()} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          <input
            name="name"
            placeholder="Booth Name"
            className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={form.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              name="size"
              placeholder="Size (e.g., 3x3m)"
              className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={form.size}
              onChange={handleChange}
            />
            <input
              type="number"
              name="price"
              placeholder="Price Per Day"
              className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={form.price}
              onChange={handleChange}
            />
            <input
              type="number"
              name="dailyOperatingHours"
              placeholder="Hours"
              min="1"
              max="24"
              className="border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={form.dailyOperatingHours}
              onChange={handleChange}
            />
          </div>

          <input
            name="location"
            placeholder="Location (e.g., Hall A - Booth 12)"
            className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={form.location}
            onChange={handleChange}
          />

          {/* Existing Thumbnail */}
          {existingThumbnailUrl && (
            <div>
              <p className="text-gray-700 font-medium mb-1">Current Thumbnail</p>
              <img
                src={existingThumbnailUrl}
                alt="Existing Thumbnail"
                className="w-32 h-32 rounded-lg object-cover border shadow-sm"
              />
            </div>
          )}
          <FileUpload
            label="Upload New Booth Thumbnail"
            name="thumbnail"
            onChange={handleFileChange}
            file={form.thumbnail}
          />

          {/* Existing Layout */}
          {existingLayoutUrl && (
            <div>
              <p className="text-gray-700 font-medium mb-1">Current Layout</p>
              <img
                src={existingLayoutUrl}
                alt="Existing Layout"
                className="w-32 h-32 rounded-lg object-cover border shadow-sm"
              />
            </div>
          )}
          <FileUpload
            label="Upload New Booth Layout"
            name="boothLayout"
            onChange={handleFileChange}
            file={form.boothLayout}
          />

          {/* ✅ Updated Booth Images Section */}
          <div>
            <p className="font-medium text-gray-700 mb-1">Booth Images</p>
            <div className="grid grid-cols-3 gap-2">
              {tempImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-20 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTempImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <label
              htmlFor="boothImages"
              className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm mt-3"
            >
              <Upload className="h-4 w-4 text-amber-600" />
              <span>Add Images</span>
              <input
                id="boothImages"
                type="file"
                name="boothImages"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-white transition ${
            canSubmit
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Reusable File Upload Component ---------- */
const FileUpload = ({
  label,
  name,
  onChange,
  file,
  files,
  multiple = false,
  onRemove,
}: {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
  files?: File[];
  multiple?: boolean;
  onRemove?: (idx: number) => void;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <label className="font-medium text-gray-700">{label}</label>
      <label
        htmlFor={name}
        className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
      >
        <Upload className="h-4 w-4 text-amber-600" />
        <span>Upload</span>
        <input
          id={name}
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          multiple={multiple}
          className="hidden"
        />
      </label>
    </div>

    {file && (
      <div className="mt-2 flex border border-dashed border-gray-200 rounded-lg p-2">
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-lg border"
        />
      </div>
    )}
    {files && files.length > 0 && (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {files.map((f, idx) => (
          <div key={idx} className="relative group">
            <img
              src={URL.createObjectURL(f)}
              alt={`File ${idx + 1}`}
              className="w-full h-20 object-cover rounded-lg border shadow-sm"
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
