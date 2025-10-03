import { useUser, UserButton } from "@clerk/clerk-react";
import cutie from "../assets/BoothEaseLogo.png";
import { Link } from "react-router-dom";

export default function UsersNavbar() {
  const { user } = useUser();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.fullName || "Unknown Guest";

  // Read userType from Clerk's unsafeMetadata
  const role = (user?.unsafeMetadata?.userType as string) || "Guest";

  return (
     <nav className="flex justify-between items-center p-4 px-12  border border-gray-900">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
         src={cutie} // <- replace with your logo file (e.g. /public/logo.png)
          alt="BoothEase Logo"
          className="w-16 h-16 object-contain"
        />
        
        

         <span className="hidden md:inline text-2xl font-semibold text-black">
          BoothEase
        </span>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center space-x-3 border-l-2  border-gray-400 pl-5">
         <div className="hidden md:flex gap-8 text-gray-500 font-medium">
        {["Home", "Profile", "Logout"].map((item, index) => (
          <Link
            key={index}
            to={`/${item.toLowerCase()}`}
            className="hover:text-gray-900 transition-all"
          >
            {item}
          </Link>
        ))}
      </div>

        {/* Clerk Compact User Button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9", // make avatar smaller
              userButtonPopoverCard: "max-w-xs", // constrain dropdown width
              userButtonPopoverFooter: "hidden", // optional: hide Clerk branding
            },
          }}
        />
      </div>
    </nav>
  );
}
