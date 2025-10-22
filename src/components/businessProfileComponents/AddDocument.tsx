import React, { useState } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users">;
  businessProfileId: Id<"business_profiles">;
  onUploadSuccess: () => void;
};

const documentTypes = ["permit", "license", "id", "contract", "other"] as const;

export default function AddDocumentModal({
  isOpen,
  onClose,
  userId,
  businessProfileId,
  onUploadSuccess,
}: Props) {
  // ✅ Convex hooks
  const createBusinessDocument = useMutation(api.business_documents.createBusinessDocument);
  const saveBusinessDocumentImage = useAction(api.business_documents.saveBusinessDocumentImage);

  // ✅ Local state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<typeof documentTypes[number]>("permit");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // -------------------------------
  // 📤 File handling
  // -------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------
  // 💾 Upload logic
  // -------------------------------
  const handleUpload = async () => {
    if (!files.length || !title.trim()) return alert("Please fill in all fields and upload at least one image!");

    try {
      setIsUploading(true);

      // ✅ Step 1: Create the document with empty files array
      const documentId = await createBusinessDocument({
        userId,
        businessProfileId,
        title,
        type,
        files: [], // empty array initially
      });

      // ✅ Step 2: Upload all images and attach them
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        await saveBusinessDocumentImage({ documentId, fileBytes });
      }

      alert("✅ Document and images uploaded successfully!");
      onUploadSuccess();
      onClose();
      setFiles([]);
      setTitle("");
      setType("permit");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  // -------------------------------
  // 🧱 UI
  // -------------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-y-auto max-h-[90vh] border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add New Document</h2>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 outline-none"
          />

          <select
            aria-label="Document Type"
            value={type}
            onChange={(e) => setType(e.target.value as typeof documentTypes[number])}
            className="w-full border border-slate-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 outline-none"
          >
            {documentTypes.map((doc) => (
              <option key={doc} value={doc}>
                {doc.charAt(0).toUpperCase() + doc.slice(1)}
              </option>
            ))}
          </select>

          {/* Upload Multiple Images */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">Upload Document Images</label>
              <label
                htmlFor="files"
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg py-1.5 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <ImageIcon className="h-4 w-4 text-amber-600" />
                <span>Upload</span>
                <input
                  id="files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview images */}
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-white z-10 px-6 py-3 border-t">
          <button
            onClick={handleUpload}
            disabled={!files.length || !title.trim() || isUploading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white ${
              files.length && title.trim()
                ? "bg-orange-400 hover:bg-orange-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
