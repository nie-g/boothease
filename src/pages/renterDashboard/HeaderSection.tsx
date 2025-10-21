import { useNavigate } from "react-router-dom";
import { FileText, Users } from "lucide-react";
import { useUser } from "@clerk/clerk-react";


export default function HeaderSection() {
  const navigate = useNavigate();
  const { user } = useUser();

  const userName = user?.fullName || "Renter";


  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-900">Renter Dashboard</h1>
      <p className="text-gray-600">Welcome back, {userName}!</p>
      <div className="flex flex-wrap mt-6 gap-4">
        <button
          onClick={() => navigate('/renter/events')}
          className="px-6 py-3 text-gray-500 transition border-2 border-gray-500 rounded-lg hover:bg-orange-200 hover:border-orange-200 hover:text-white flex items-center gap-2"
        >
          <FileText size={18} /> View Events and Booths
        </button>
        <button
          onClick={() => navigate('/renter/reservations')}
          className="px-6 py-3 text-gray-500 transition border-2 border-gray-500 rounded-lg hover:bg-orange-200 hover:border-orange-200 hover:text-white flex items-center gap-2"
        >
          <Users size={18} /> My Reservations
        
        </button>
      </div>
    </div>
  );
}
