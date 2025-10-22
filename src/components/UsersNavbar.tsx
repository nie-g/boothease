  import { UserButton, useClerk } from "@clerk/clerk-react";
  import { Link, useNavigate } from "react-router-dom";
  import cutie from "../assets/BoothEaseLogo.png";

  interface TestNavbarProps {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }

  export default function TestNavbar({ sidebarOpen, setSidebarOpen }: TestNavbarProps) {
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await signOut();
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", (error as Error).message);
      }
    };

    return (
      <nav className="bg-[#FFF9E9] w-full h-full flex items-center justify-between px-6 md:px-12 shadow-xs border-b border-gray-300">
        {/* Left: Logo or Hamburger */}
        <div className="flex items-center gap-2">
          {/* Hamburger for mobile */}
          <button
            aria-label="Toggle Sidebar"
            className="md:hidden text-black focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo hidden on mobile */}
          <img
            src={cutie}
            alt="BoothEase Logo"
            className="hidden md:block w-9 h-9 sm:w-13 sm:h-13 object-contain"
          />
          <span className="hidden md:inline text-lg sm:text-xl md:text-2xl font-semibold text-black">
            BoothEase
          </span>
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center gap-4 md:gap-6 border-l-0 sm:border-l-2 border-gray-400 pl-6 text-gray-600 font-medium">
          <Link to="/home" className="hover:text-gray-900 transition-all">
            Home
          </Link>
          <Link to="/profile" className="hover:text-gray-900 transition-all">
            Profile
          </Link>
          <button onClick={handleLogout} className="hover:text-gray-900 transition-all">
            Logout
          </button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9" },
            }}
          />
        </div>
      </nav>
    );
  }
