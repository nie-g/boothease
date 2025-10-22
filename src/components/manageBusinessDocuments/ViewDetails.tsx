// src/components/modals/BusinessDocumentDetailsModal.tsx
import { motion } from "framer-motion";
import { X, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";

interface BusinessDocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: Id<"businessDocuments">;
}

const BusinessDocumentDetailsModal: React.FC<BusinessDocumentDetailsModalProps> = ({
  isOpen,
  onClose,
  documentId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useUser();
  const currentUser = useQuery(
    api.userQueries.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Always fetch document
  const document = useQuery(api.business_documents.getBusinessDocumentById, { documentId });

  // Always fetch uploader safely
    const uploader = useQuery(
    api.userQueries.getUserById,
    document?.userId ? { userId: document.userId as Id<"users"> } : "skip"
    );

  // Always fetch file URLs safely
  const fileIds = document?.files ?? [];
  const fileUrls = useQuery(api.getPreviewUrl.getPreviewUrls, { storageIds: fileIds }) ?? [];

  const approveDocument = useMutation(api.business_documents.approveBusinessDocument);
  const rejectDocument = useMutation(api.business_documents.rejectBusinessDocument);


  const handleApprove = async () => {
  
    if (!document || !uploader) return; // ✅ prevents undefined errors
    try {
      await approveDocument({
        documentId: document._id,
        userId: document.userId as Id<"users">,
        userType: uploader.role, // ✅ pass the uploader's type
        reviewedBy: currentUser?._id as Id<"users">,
      });
      alert("✅ Document approved successfully!");
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to approve document.");
    }
    onClose();
  };

  const handleReject = async () => {
    if (!document || !uploader) return; // ✅ prevents undefined errors
    try {
      await rejectDocument({
        documentId: document._id,
        userId: document.userId as Id<"users">,
       userType: uploader.role, // ✅ pass the uploader's type
        reviewedBy: currentUser?._id as Id<"users">,
      });
      alert("❌ Document rejected.");
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to reject document.");
    }
    onClose();
  };

  if (!isOpen || !document) return null;

  const showCarousel = fileUrls.length > 3;
  const handleNext = () => currentIndex < fileUrls.length - 3 && setCurrentIndex(i => i + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex(i => i - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-600">Document Details</h2>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Info */}
        <div className="space-y-2 text-gray-700">
          <Detail label="Title" value={document.title} />
          <Detail label="Type" value={document.type} />
          <Detail label="Status" value={<span className="capitalize">{document.status}</span>} />
          <Detail label="Uploaded" value={new Date(document.uploadedAt).toLocaleString()} />
          <Detail label="Uploaded By" value={uploader?.fullname || "Loading..."} />
        </div>

        {/* File Images */}
        {fileUrls.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-base font-medium text-gray-800 mb-2">Attached Files</h4>
            {showCarousel ? (
              <div className="relative overflow-hidden">
                <motion.div
                  className="flex gap-3"
                  animate={{ x: `-${currentIndex * (100 / 3)}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                  {fileUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="flex-none w-1/3 h-[30vh] overflow-hidden rounded-lg shadow-sm border border-gray-200"
                    >
                      <img
                        src={url ?? ""}
                        alt={`File ${idx + 1}`}
                        className="h-full w-full object-cover"
                        />
                    </div>
                  ))}
                </motion.div>

                <button
                  aria-label="Previous"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  aria-label="Next"
                  onClick={handleNext}
                  disabled={currentIndex >= fileUrls.length - 3}
                  className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fileUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden h-[30vh] rounded-lg shadow-sm border border-gray-200 hover:scale-[1.03] transition-transform duration-200"
                  >
                   <img
                        src={url ?? ""}
                        alt={`File ${idx + 1}`}
                        className="h-full w-full object-cover"
                        />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex justify-center items-center h-24 bg-gray-100 rounded-lg border border-dashed">
            <ImageIcon className="w-10 h-10 text-gray-400" />
            <span className="ml-2 text-gray-500 italic">No files attached</span>
          </div>
        )}

        {/* Footer Buttons */}
       {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        {document.status === "verified" || document.status === "rejected" ? (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Close
          </button>
        ) : (
          <>
            <button
              onClick={handleApprove}
              className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition"
            >
              Verify Document
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
            >
              Reject
            </button>
          </>
        )}
      </div>
      </motion.div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="font-medium text-gray-800 w-28 shrink-0">{label}:</span>
    <span className="text-gray-600 flex-1">{value}</span>
  </div>
);

export default BusinessDocumentDetailsModal;
