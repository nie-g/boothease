import { Link } from "react-router-dom";

import cutie from "../assets/BoothEaseLogo.png";
const Navbar = () => {


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

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-gray-500 font-medium">
        {["Home", "Features", "How It Works", "Contact"].map((item, index) => (
          <Link
            key={index}
            to={`/${item.toLowerCase()}`}
            className="hover:text-gray-900 transition-all"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="flex gap-4 items-center">
       
            <Link
              to="/signup"
              className="px-5 border-l py-2 text-gray-500 font-medium hover:text-gray-900 transition"
            >
              Register
            </Link>
            <Link
              to="/signin"
              className="px-5 py-2 border-2 bg-amber-500 text-gray-50 rounded-lg font-medium hover:bg-amber-600 hover:text-white transition-all"
            >
              Log In
            </Link>
        

        
      </div>
    </nav>
  );
};

export default Navbar;
