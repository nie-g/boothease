import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  Home, Clock, Settings, LogOut, Palette, Images, Bell as BellIcon, Users, FileText, BarChart, Layers, Box, NotebookPenIcon
} from "lucide-react";
import logoIcon from "../assets/BoothEaseLogo.png";
import { useUnreadNotificationCount } from "../hooks/UnreadNotificationsCount";
import NotificationBadge from "./NotificationBadge";

type UserType = "admin" | "owner" | "renter";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  route: string;
}

const Sidebar: React.FC = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  const { unreadCount } = useUnreadNotificationCount();

  // ✅ Get userType from Clerk metadata (fallback client)
  const userType: UserType =
    (user?.unsafeMetadata?.userType as UserType) || "renter";

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", (error as Error).message);
    }
  };

  // ✅ Theme colors with safe Tailwind classes
  const getThemeColor = () => {
    switch (userType) {
      case "admin":
        return { text: "text-[#486284]", hover: "hover:bg-slate-300" };
      case "owner":
        return { text: "text-[#486284]", hover: "hover:bg-slate-300" };
      case "renter":
      default:
        return { text: "text-[#486284]", hover: "hover:bg-slate-300" };
    }
  };

  const { text, hover } = getThemeColor();

  // ✅ Navigation by role
  const getNavItems = (): NavItem[] => {
    switch (userType) {
      case "admin":
        return [
          { name: "Dashboard", icon: <Home />, route: "/admin" },
          { name: "Users", icon: <Users />, route: "/admin/users" },
          { name: "Requests", icon: <FileText />, route: "/admin/requests" },
          { name: "Events & Booths", icon: <Palette />, route: "/admin/events" },
          { name: "Notifications", icon: <BellIcon />, route: "/notifications" },
          { name: "Reports", icon: <BarChart />, route: "/admin/reports" },
         
        ];
      case "owner":
        return [
          { name: "Dashboard", icon: <Home />, route: "/owner" },
          { name: "Business Profile", icon: <Home />, route: "/owner/businessprofile" },
          { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/owner/events" },
          { name: "Reservations", icon: <Images />, route: "/owner/reservations" },
        
        ];
      case "renter":
      default:
        return [
         { name: "Dashboard", icon: <Home />, route: "/renter" },
         { name: "Business Profile", icon: <Home />, route: "/renter/businessprofile" },
         { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/renter/events" },
         { name: "Reservations", icon: <Images />, route: "/renter/reservations" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
   <aside
    className={`bg-slate-100 text-[#486284] font-semibold transition-all duration-300 ease-in-out ${
      isSmallScreen ? "w-20" : "w-58"
    } flex flex-col min-h-screen overflow-y-auto`}
  >

    {/* Scrollable nav */}
    <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <Link key={item.name} to={item.route} className={`flex items-center p-4 rounded-lg space-x-3 ${hover}`}>
          <span className={`${text} relative`}>
            {item.icon}
            {item.name === "Notifications" && unreadCount > 0 && (
              <NotificationBadge count={unreadCount} size="sm" color="red" className="animate-pulse" />
            )}
          </span>

          {!isSmallScreen && (
            <span className="flex items-center">
              {item.name}
              {item.name === "Notifications" && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
          )}
        </Link>
      ))}
    </nav>
    </aside>


  );
};

export default Sidebar;
