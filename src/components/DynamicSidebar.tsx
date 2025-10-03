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
        return { text: "text-gray-800", hover: "hover:bg-orange-100" };
      case "owner":
        return { text: "text-gray-800", hover: "hover:bg-orange-100" };
      case "renter":
      default:
        return { text: "text-gray-800", hover: "hover:bg-gray-300" };
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
          { name: "Designs", icon: <Palette />, route: "/admin/designs" },
          { name: "Templates & Pricing", icon: <Layers />, route: "/admin/templates" },
          { name: "Inventory", icon: <Box />, route: "/admin/inventory" },
          { name: "Notifications", icon: <BellIcon />, route: "/notifications" },
          { name: "Reports", icon: <BarChart />, route: "/admin/reports" },
         
        ];
      case "owner":
        return [
          { name: "Business Profile", icon: <Home />, route: "/designer" },
          { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/designer/tasks" },
          { name: "Reservations", icon: <Images />, route: "/designer/gallery" },
        
        ];
      case "renter":
      default:
        return [
         { name: "Business Profile", icon: <Home />, route: "/designer" },
         { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/designer/tasks" },
         { name: "Reservations", icon: <Images />, route: "/designer/gallery" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
  className={`bg-[#F2F4F8] text-gray-800 transition-all duration-300 ease-in-out ${
    isSmallScreen ? "w-20" : "w-64"
  } sticky top-0 h-screen flex flex-col`}
>
  {/* Logo */}
  

  {/* Scrollable Nav */}
  <nav className="flex-1 overflow-y-hidden mt-6  space-y-2">
    {navItems.map((item) => (
      <Link
        key={item.name}
        to={item.route}
        className={`flex items-center  p-4 rounded-lg space-x-3 transition-all relative ${hover}`}
      >
        <span className={`${text} relative`}>
          {item.icon}
          {item.name === "Notifications" && unreadCount > 0 && (
            <NotificationBadge
              count={unreadCount}
              size="sm"
              color="red"
              className="animate-pulse"
            />
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

  {/* Logout (footer) */}
  <div className="px-4 py-5 flex-shrink-0">
    <button
      onClick={handleLogout}
      className="flex items-center space-x-3 text-red-300 hover:text-red-500"
    >
      <LogOut />
      {!isSmallScreen && <span>Sign Out</span>}
    </button>
  </div>
</aside>

  );
};

export default Sidebar;
