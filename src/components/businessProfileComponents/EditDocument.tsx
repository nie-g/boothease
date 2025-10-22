import { useEffect, useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Upload } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import toast from "react-hot-toast";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    _id: Id<"businessDocuments">;
    title: string;
    type: "permit" | "license" | "id" | "contract" | "other";
    status: "pending" | "verified" | "rejected";
    files?: Id<"_storage">[];
  };
}

const documentTypes = ["permit", "license", "id", "contract", "other"] as const;

export default function EditDocumentModal({ isOpen, onClose, document }: EditDocumentModalProps) {
  const updateDocumentTitle = useMutation(api.business_documents.updateBusinessDocumentTitle);
  const updateDocumentType = useMutation(api.business_documents.updateBusinessDocumentType);
  const saveBusinessDocumentImage = useAction(api.business_documents.saveBusinessDocumentImage);
  const deleteBusinessDocumentFiles = useMutation(api.business_documents.deleteBusinessDocumentFiles);

  // Fetch file URLs
  const fileIds = document?.files ?? [];
  const fileUrls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds: fileIds }) ?? [];

  const [form, setForm] = useState({
    title: document.title || "",
    type: document.type || "permit",
  });

  // ✅ Temporary local storage for document images (URLs + Files)
  const [tempImages, setTempImages] = useState<(string | File)[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<Id<"_storage">[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form and images when document loads
  useEffect(() => {
    if (isOpen && document) {
      setForm({
        title: document.title || "",
        type: document.type || "permit",
      });
      // ✅ Filter out nulls so types align
      setTempImages(fileUrls.filter((url): url is string => url !== null));
      setDeletedFileIds([]); // Reset deleted files
    }
  }, [isOpen, document, fileUrls]);

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
      const removedFileId = fileIds[index];
      if (removedFileId) {
        setDeletedFileIds((prev) => [...prev, removedFileId]);
      }
    }

    setTempImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        toast.error("Please enter a document title");
        return;
      }

      setLoading(true);

      // Update document title if changed
      if (form.title !== document.title) {
        await updateDocumentTitle({
          documentId: document._id,
          title: form.title.trim(),
        });
      }

      // Update document type if changed
      if (form.type !== document.type) {
        await updateDocumentType({
          documentId: document._id,
          newType: form.type as any,
        });
      }

      // ✅ Delete removed files from DB first
      if (deletedFileIds.length > 0) {
        await Promise.all(
          deletedFileIds.map((id) =>
            deleteBusinessDocumentFiles({
              documentId: document._id,
              storageIds: [id],
            })
          )
        );
        setDeletedFileIds([]); // clear after deletion
      }

      // Upload new images
      const newFiles = tempImages.filter((img) => img instanceof File) as File[];
      if (newFiles.length > 0) {
        await Promise.all(
          newFiles.map(async (file) => {
            const buffer = await file.arrayBuffer();
            await saveBusinessDocumentImage({
              documentId: document._id,
              fileBytes: buffer,
            });
          })
        );
      }

      toast.success("Document updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  const newFilesCount = tempImages.filter((img) => img instanceof File).length;
  const canSubmit =
    form.title.trim() !== "" &&
    (form.title !== document.title ||
      form.type !== document.type ||
      newFilesCount > 0 ||
      deletedFileIds.length > 0);

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
          Edit Document
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title
            </label>
            <input
              name="title"
              placeholder="Enter document title"
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Document Type & Status (Side by Side) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Document Type (Editable) */}
            <div>
              <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                id="document-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="w-full border rounded-xl px-3 py-2 bg-gray-100 text-gray-600 capitalize font-medium">
                {document.status}
              </div>
            </div>
          </div>

          {/* Document Files Section */}
          <div>
            <p className="font-medium text-gray-700 mb-3">Document Files</p>
            {tempImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {tempImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={typeof img === "string" ? img : URL.createObjectURL(img)}
                      alt={`File ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTempImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500">No files attached</p>
              </div>
            )}

            <label
              htmlFor="documentFiles"
              className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg py-2.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
            >
              <Upload className="h-4 w-4 text-amber-600" />
              <span>Add Files</span>
              <input
                id="documentFiles"
                type="file"
                name="documentFiles"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition ${
              canSubmit
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
