import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // keep your Navbar here
import cutie from "../assets/Booth.jpg";
import pic1 from "../assets/pic1.jpg";
import pic2 from "../assets/pic2.jpg";
import {MousePointer, Mail, MapPin, Image, Phone, Tags } from "lucide-react";

const LandingPage: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && user?.unsafeMetadata?.userType) {
      const role = user.unsafeMetadata.userType as string;

      if (role === "designer") {
        navigate("/designer");
      } else if (role === "client") {
        navigate("/client");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        // fallback if no role or unrecognized
        navigate("/dashboard");
      }
    }
  }, [isSignedIn, user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="font-sans text-white bg-[#FFF9E9]"
    >
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative flex flex-col items-center justify-between  py-20 md:flex-row"
      >
        <div className="max-w-3xl px-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="px-4 py-1 text-sm font-semibold text-gray-600 rounded-full"
          >
           Say goodbye to manual booking and hello to smart event management.
          </motion.span>
          <h1 className="mt-5 text-5xl font-bold text-gray-900">
           SMART RESEVATIONS, HASSLE-FREE EVENTS
          </h1>
          <p className="mt-5 text-lg text-gray-600">
            BoothEase makes it simple for organizers to manage events and for merchants to reserve booths in just a few clicks. Easy, fast, and efficient—so you can focus on what truly matters: your business and your customers.
          </p>
          <div className="flex gap-4 mt-7">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-3 text bg-white font-semibold text-gray-900 transition-all duration-300 "
            >
              <a href="/sign-up"> Reserve Now</a>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-3 text font-semibold text-gray-900 transition-all duration-300 "
        >
              <a href="/features">See all events</a>
            </motion.button>
          </div>
        </div>

        {/* Decorative Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-10 md:mt-0 md:w-1/3 "
        >
          <img
            src={cutie}
            alt="Decorative"
            className="w-full  max-w-xs mx-auto md:max-w-md border rounded-tl-4xl"
          />
        </motion.div>
      </motion.section>

      {/* Features Intro */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="px-6 py-16 text-center text-gray-900 relative"
      >
        <h2 className="text-4xl font-bold text-[#486284] mb-4">
         How BoothEase Works
        </h2>
        <p className="mt-4 text-lg text-[#486284] max-w-3xl mx-auto">
          BoothEase makes the reservation process effortless. In just three simple steps, you can secure your booth and join exciting events with ease.
        </p>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="px-6 py-20 text-gray-900 relative"
      >
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-50 rounded-full opacity-40 blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 gap-8 mx-auto md:grid-cols-3 max-w-7xl">
          {[
            {
              title: "Choose Event",
              desc: "Browse through upcoming events and explore details to find the perfect one for your business.",
              icon: <MapPin size={50} strokeWidth={3} className="text-[#486284]" />,
            },
            {
              title: "Reserve Booth",
              desc: "Select your preferred booth from the event layout and send you reservation request instantly.",
              icon: <MousePointer size={50} strokeWidth={3} className="text-[#486284]" />,
            },
            {
              title: "Get Confirmation",
              desc: "Receive timely updates and get ready to showcase at your chosen event",
              icon: <Mail size={50} strokeWidth={3} className="text-[#486284]" />,
            },
           
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8  transition-all duration-300 transform
                hover:scale-[1.03] min-h-[220px]
                flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="flex items-center justify-center w-33 h-33 mb-6 bg-[#486284]/10 bg-opacity-10 rounded-lg group-hover:scale-110 group-hover: transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-800 group-hover:text-[#486284] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
      {/* Discover Upcoming Events Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="px-6 py-20 text-center text-gray-900 relative bg-white"
      >
        <h2 className="text-4xl font-bold text-[#486284] mb-4">
          Discover Upcoming Events
        </h2>
        <p className="mt-2 text-lg text-[#486284] max-w-3xl mx-auto">
          Stay updated with the latest food fairs, expos, and community
          gatherings. Browse through featured events, check important
          details, and find the best opportunities to showcase your booth.
        </p>

        <div className="border-t border-gray-300 my-10 max-w-4xl mx-auto"></div>

        {/* Event cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((event) => (
                <div
                key={event}
                className="bg-gray-300 p-6 rounded-lg shadow-sm flex flex-col items-start justify-between"
                >
                {/* Title + Heart */}
                <div className="flex w-full items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Event Title</h3>
                    <button className="text-gray-400 hover:text-[#486284]">♥</button>
                </div>

                {/* Image placeholder */}
                <div className="w-full h-[30vh]  flex items-center justify-center rounded-md mb-4">
                    <span className="text-gray-500"><Image size={30} strokeWidth={1.5} className="text-gray-100" /></span>
                </div>
                  <div className="flex w-full items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-600 font-semibold">DATE & VENUE</h3>
                <motion.button
                 whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                 className="px-4 py-2 bg-gray-50 font-semibold rounded-lg text-xs text-gray-600 transition-all duration-300 "
                >
                <a href="/features">View Details</a>
                </motion.button>
                   
                </div>

               
              
                
                </div>
            ))}
            </div>


        {/* Show more button */}
        <div className="mt-10">
          <button className="px-6 py-2 bg-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-300 transition">
            Show More
          </button>
        </div>
      </motion.section>

      {/* Why Choose BoothEase Section */}
        <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="px-6 py-20 text-center text-gray-900 relative bg-[#FFF9E9]]"
        >
        <h2 className="text-4xl font-bold text-[#486284] mb-4">
         Why Choose BoothEase?
        </h2>
        <p className="mt-2 text-lg text-[#486284] max-w-3xl mx-auto mb-20">
              We make booth reservations simple, reliable, and stress-free.
            Whether you’re joining a local fair or a grand expo, BoothEase gives
            you the tools to reserve your spot with confidence.
        </p>

        
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="flex justify-center">
       
           {/* Decorative Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-10 md:mt-0 md:w-2/3"
        >
          <img
            src={cutie}
            alt="Decorative"
            className="w-full max-w-xs mx-auto md:max-w-md ml-[-10px]"
          />
        </motion.div>
     
        </div>

        {/* Right Content */}
        <div>
       
       

        {/* Features */}
        <div className="space-y-4">
            <div className="flex items-start gap-3">
           <div className="flex items-center justify-center w-10 h-10 mb-6 bg-[#486284]/40 bg-opacity-10 rounded-lg group-hover:scale-110 group-hover: transition-transform duration-300">
            <Phone size={20} strokeWidth={2.5} className="text-gray-100" />
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 flex items-start">Customer Support</h4>
                <p className="text-gray-600 text-sm">
                Get assistance anytime with our responsive support team.
                </p>
            </div>
            </div>

            <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 mb-6 bg-[#486284]/40 bg-opacity-10 rounded-lg group-hover:scale-110 group-hover: transition-transform duration-300">
            <Tags size={20} strokeWidth={2.5} className="text-gray-100" />
            </div>
            <div >
                <h4 className="font-semibold flex items-start text-gray-800">Best Price Guaranteed</h4>
                <p className="text-gray-600 text-sm">
                Reserve booths at fair and transparent prices.
                </p>
            </div>
            </div>
              

            <div className="flex items-start gap-3 ">
            <div className="flex items-center justify-center w-10 h-10 mb-6 bg-[#486284]/40 bg-opacity-10 rounded-lg group-hover:scale-110 group-hover: transition-transform duration-300">
            <MapPin size={20} strokeWidth={2.5} className="text-gray-100" />
            </div>
           
            <div>
                <h4 className="font-semibold text-gray-800 flex items-start">Many Locations</h4>
                <p className="text-gray-600 text-sm">
                Access events and booths across various venues.
                </p>
            </div>
            </div>
        </div>
        </div>
    </div>
    </motion.section>
    {/* Two-Card Section */}
    <motion.section
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.3 }}
    className="px-6 p-10 py-16 bg-[#F7C686]"
    >
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1 */}
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="h-100 w-full  rounded-lg overflow-hidden"
        >
        <img
            src={pic1}
            alt="Decorative"
            className="w-full h-full object-cover"
        />
        </motion.div>

        {/* Card 2 */}
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="h-100 w-full rounded-lg overflow-hidden"
        >
        <img
            src={pic2}
            alt="Decorative"
            className="w-full h-full object-cover"
        />
        </motion.div>

    </div>
    </motion.section>



      {/* Footer */}
      <footer className="w-full px-6 py-10 text-gray-400 bg-gray-900">
        <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
          <div>

           
            <p>The collaborative platform for t-shirt design that connects clients and designers.</p>
          </div>
          <div>
            <h4 className="font-bold text-white">Product</h4>
            <a href="/features" className="block mt-2">
              Features
            </a>
            <a href="/how-it-works" className="block mt-2">
              How It Works
            </a>
            <a href="/pricing" className="block mt-2">
              Pricing
            </a>
          </div>
          <div>
            <h4 className="font-bold text-white">Company</h4>
            <a href="/about" className="block mt-2">
              About Us
            </a>
            <a href="/contact" className="block mt-2">
              Contact
            </a>
            <a href="/careers" className="block mt-2">
              Careers
            </a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
