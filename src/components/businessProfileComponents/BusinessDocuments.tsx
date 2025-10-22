import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import AddDocumentModal from "./AddDocument";

type BusinessDocumentType = {
  _id: Id<"businessDocuments">;
  userId: Id<"users">;
  businessProfileId: Id<"business_profiles">;
  title: string;
  type: "permit" | "license" | "id" | "contract" | "other";
  file: Id<"_storage">;
  status: "pending" | "approved" | "rejected";
  uploadedAt: number;
  reviewedBy?: Id<"users">;
  reviewedAt?: number;
};

const BusinessDocuments: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "title",
    direction: "asc",
  });
  const [modalOpen, setModalOpen] = useState(false);

  /** Fetch current user */
  const currentUser = useQuery(
    api.userQueries.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const businessProfile = useQuery(
    api.businessProfiles.getByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  /** Fetch documents */
  const businessDocuments = useQuery(
    api.business_documents.listBusinessDocumentsByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) as BusinessDocumentType[] | null | undefined;

  


  const sortedList = useMemo(() => {
    if (!businessDocuments) return [];
    const filtered = businessDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const valA = (a as any)[sortConfig.key];
      const valB = (b as any)[sortConfig.key];
      const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [businessDocuments, searchTerm, sortConfig]);

  if (!isLoaded || !currentUser)
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
        Loading documents...
      </div>
    );

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Documents</h2>
          <p className="text-gray-600 text-sm">View and manage all your uploaded documents</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
        >
          + Add Document
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Table */}
      {sortedList.length === 0 ? (
        <div className="text-center p-6">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No documents found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                 Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedList.map((doc) => (
                <tr key={doc._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-start font-medium text-gray-900">
                    {doc.title || doc.type.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-start text-gray-600">
                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {doc.status === "approved" && (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle size={16} /> Approved
                      </span>
                    )}
                    {doc.status === "pending" && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Clock size={16} /> Pending
                      </span>
                    )}
                    {doc.status === "rejected" && (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={16} /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-4 text-center text-sm flex justify-center gap-2">
                    <button className="bg-teal-500 text-white font-semibold hover:bg-teal-600 px-3 py-2 rounded-md flex items-center gap-1">
                     View Details
                    </button>
                    <button className="bg-emerald-500 text-white font-semibold hover:bg-emerald-600 px-3 py-2 rounded-md flex items-center gap-1">
                     Edit Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Document Modal */}
      {modalOpen && businessProfile?._id && currentUser?._id && (
        <AddDocumentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={currentUser._id}
          businessProfileId={businessProfile._id}
          onUploadSuccess={() => setModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default BusinessDocuments;
