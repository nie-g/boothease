// src/components/BusinessProfile.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Save, Settings } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Sidebar from "../Sidebar";
import Navbar from "../UsersNavbar";

type BusinessProfileType = {
  _id: Id<"business_profiles">;
  userId: Id<"users">;
  businessName: string;
  category: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: string;
  createdAt: number;
  updatedAt?: number;
};


const BusinessProfile: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();

  // Fetch Convex user record based on Clerk ID
  const currentUser = useQuery(
    api.userQueries.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const businessProfile = useQuery(
    api.businessProfiles.getByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) as BusinessProfileType | null | undefined;


  const updateBusinessProfile = useMutation(api.businessProfiles.updateProfile);

  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setForm({
        businessName: businessProfile.businessName,
        category: businessProfile.category,
        description: businessProfile.description ?? "",
        email: businessProfile.email,
        phone: businessProfile.phone ?? "",
        website: businessProfile.website ?? "",
        address: businessProfile.address ?? "",
        city: businessProfile.city,
        province: businessProfile.province ?? "",
        postalCode: businessProfile.postalCode ?? "",
        country: businessProfile.country,
      });
    }
  }, [businessProfile]);

  const handleSave = async () => {
    if (!businessProfile?._id) return;
    try {
      await updateBusinessProfile({
        profileId: businessProfile._id,
        ...form,
      });
      alert("✅ Business profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("❌ Failed to update profile. Check console for details.");
    }
  };

  if (!isLoaded || !currentUser || !businessProfile) {
    return (
      <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-[#ebeff5] overflow-hidden">
       
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white shadow rounded-lg p-6 text-center w-full max-w-xl">
              <p className="text-gray-500">Loading profile...</p>
            </div>
          </main>
        </div>
      
    );
  }

  return (
    
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-10"
          >
            <h1 className="text-2xl font-bold mb-6 text-gray-600">Business Profile</h1>

            {/* User Info */}
            <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div>
                <p className="text-gray-600 text-sm">{currentUser.email}</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
              </div>
              <button
                onClick={() => openUserProfile()}
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition"
              >
                <span className="text-sm font-medium text-gray-600">Manage Account</span>
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-semibold text-gray-600">Business Information</h2>
              </div>

              {!isEditing ? (
                <div className="space-y-3 text-gray-700">
                  <p><span className="font-medium text-gray-600">Business Name:</span> {businessProfile.businessName}</p>
                  <p><span className="font-medium text-gray-600">Category:</span> {businessProfile.category}</p>
                  <p><span className="font-medium text-gray-600">Email:</span> {businessProfile.email}</p>
                  <p><span className="font-medium text-gray-600">Phone:</span> {businessProfile.phone || "Not provided"}</p>
                  <p><span className="font-medium text-gray-600">Address:</span> {businessProfile.address || "Not provided"}</p>
                  <p><span className="font-medium text-gray-600">City:</span> {businessProfile.city}</p>
                  <p><span className="font-medium text-gray-600">Country:</span> {businessProfile.country}</p>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-gray-100 border font-semibold border-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow hover:bg-gray-200 transition"
                    >
                      <Settings size={18} /> Edit Information
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                >
                  {[
                    { label: "Business Name", key: "businessName", required: true },
                    { label: "Category", key: "category", required: true },
                    { label: "Description", key: "description" },
                    { label: "Email", key: "email", required: true, type: "email" },
                    { label: "Phone", key: "phone" },
                    { label: "Address", key: "address" },
                    { label: "City", key: "city", required: true },
                    { label: "Country", key: "country", required: true },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center gap-4">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.key === "phone" ? (
                        <PhoneInput
                          country="ph"
                          value={form.phone}
                          onChange={(value) => setForm({ ...form, phone: value })}
                          inputClass="!w-full !h-10 !text-sm !rounded-lg !border-gray-300 focus:!ring-teal-400"
                        />
                      ) : field.key === "description" ? (
                        <textarea
                          aria-label="Description"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                      ) : (
                        <input
                          aria-label={field.label}
                          type={field.type || "text"}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          required={field.required}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                      )}
                    </div>
                  ))}

                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" className="flex items-center gap-2 bg-teal-500 text-white px-6 py-2 rounded-lg shadow hover:bg-teal-600 transition"><Save size={18}/> Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        
      
    
  );
};

export default BusinessProfile;
