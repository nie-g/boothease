import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Home, Palette, Images, Bell as BellIcon, Users, CircleUser, NotebookPenIcon, X
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
interface SidebarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setSidebarOpen }) => {

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const { user } = useUser();
  const { unreadCount } = useUnreadNotificationCount();

  const userType: UserType =
    (user?.unsafeMetadata?.userType as UserType) || "renter";

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  const getThemeColor = () => ({
    text: "text-gray-50",
    hover: "hover:bg-gray-300",
  });

  const { text, hover } = getThemeColor();

  const getNavItems = (): NavItem[] => {
    switch (userType) {
      case "admin":
        return [
          { name: "Dashboard", icon: <Home />, route: "/admin" },
          { name: "Users", icon: <Users />, route: "/admin/users" },
          { name: "Events & Booths", icon: <Palette />, route: "/admin/events" },
          { name: "Notifications", icon: <BellIcon />, route: "/notifications" },
        ];
      case "owner":
        return [
          { name: "Dashboard", icon: <Home />, route: "/owner" },
          { name: "Business Profile", icon: <CircleUser />, route: "/owner/businessprofile" },
          { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/owner/events" },
          { name: "Reservations", icon: <Images />, route: "/owner/reservations" },
          { name: "Notifications", icon: <BellIcon />, route: "/notifications" },
        ];
      case "renter":
      default:
        return [
          { name: "Dashboard", icon: <Home />, route: "/renter" },
          { name: "Business Profile", icon: <CircleUser />, route: "/renter/businessprofile" },
          { name: "Events & Booths", icon: <NotebookPenIcon />, route: "/renter/events" },
          { name: "Reservations", icon: <Images />, route: "/renter/reservations" },
          { name: "Notifications", icon: <BellIcon />, route: "/notifications" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="flex flex-col h-full overflow-y-auto bg-gray-800 text-gray-50 ">
      {/* Logo + Close Button */}
      <div className="flex items-center justify-between p-4 md:hidden">
          {/* Logo + text */}
          <div className="flex items-center space-x-2">
            <img src={logoIcon} alt="BoothEase Logo" className="h-10" />
            <span className="text-lg font-bold text-[#486284]">BoothEase</span>
          </div>

          {/* X button only on mobile */}
          {isSmallScreen && setSidebarOpen && (
            <button
              aria-label="Close Sidebar"
              onClick={() => setSidebarOpen(false)}
              className="ml-2 p-1 rounded-md hover:bg-gray-300"
            >
              <X size={24} />
            </button>
          )}
        </div>


      {/* Navigation Items */}
      <nav className="flex-1 mt-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.route}
            onClick={() => setSidebarOpen?.(false)}
            className={`flex items-center p-4 rounded-lg space-x-3 ${hover}`}
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
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
