import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/UsersNavbar";
import ViewDetailsModal from "../components/manageBusinessDocuments/ViewDetails";


const ManageBusinessDocuments: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [modalType, setModalType] = useState<"details" | "status" | null>(null);

  // ✅ Convex queries and mutations
  const documents = useQuery(api.business_documents.listAllBusinessDocuments);
  

  // ✅ Loading state
  if (!documents) {
    return (
      <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
        <div className="w-full flex-none h-[8vh] md:h-[13vh]">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <aside
            className={`fixed top-0 left-0 h-full z-50 w-64 bg-[#E7EBEE] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:static md:w-64`}
          >
            <Sidebar setSidebarOpen={setSidebarOpen} />
          </aside>
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 text-gray-500">
              Loading business documents...
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ✅ Filter + Search logic
  const filteredDocs = documents.filter((doc: any) => {
    const matchesStatus = statusFilter === "all" ? true : doc.status === statusFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.type.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  
  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
      {/* Navbar */}
      <div className="w-full flex-none h-[8vh] md:h-[13vh]">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 w-64 bg-[#E7EBEE] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static md:w-64`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            <motion.div
              className="bg-white border border-gray-200 shadow-md rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-700">Manage Business Documents</h1>
              </div>

              {/* Filters */}
              <motion.div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Search by title or type..."
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  aria-label="Filter documents by status"   
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </motion.div>

              {/* Table */}
              <motion.div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">Title</th>
                      <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">Uploaded</th>
                      <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc: any, idx: number) => (
                      <motion.tr
                        key={doc._id}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition-colors`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                      >
                        <td className="px-4 py-3 border-b text-sm text-gray-700">{doc.title}</td>
                        <td className="px-4 py-3 border-b text-sm text-gray-700 capitalize">{doc.type}</td>
                        <td
                          className={`px-4 py-3 border-b text-sm font-semibold ${
                            doc.status === "pending"
                              ? "text-yellow-600"
                              : doc.status === "verified"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {doc.status}
                        </td>
                        <td className="px-4 py-3 border-b text-sm text-gray-700">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 border-b text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setModalType("details");
                            }}
                            className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                          >
                            View Details
                          </button>
                      
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          </motion.div>
        </main>
      </div>

                    
               {modalType === "details" && selectedDoc && (
                <ViewDetailsModal
                    isOpen={true}
                    documentId={selectedDoc._id} // <- pass documentId
                    onClose={() => setModalType(null)}
                />
                )}

              
                    </div>
                );
                };

export default ManageBusinessDocuments;
