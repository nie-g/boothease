import { PlusCircle, Upload, Folder } from "lucide-react";

const actions = [
  {
    label: "Manage Business Profile",
    description: "View and edit your business profile and upload business documents.",
    icon: <PlusCircle className="h-5 w-5 text-orange-700" />,
    path: "/owner/businessprofile",
  },
  {
    label: "Manage Reservations",
    description: "View and manage use requests for your booths.",
    icon: <Upload className="h-5 w-5 text-orange-700" />,
    path: "/owner/reservations",
  },
  {
    label: "Browse Events and Booths",
    description: "View all events and manage your own booths.",
    icon: <Folder className="h-5 w-5 text-orange-700" />,
    path: "/owner/events",
  },
];

interface QuickActionsProps {
  navigate?: (path: string) => void; // optional so UI works standalone
}

export default function QuickActionsSection({ navigate }: QuickActionsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="p-4 bg-orange-50 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-full">{action.icon}</div>
              <h3 className="font-medium text-gray-800">{action.label}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{action.description}</p>
            <button
              onClick={() => navigate && navigate(action.path)}
              className="w-full px-3 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-teal-200 transition-colors text-sm font-medium"
            >
              {action.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
