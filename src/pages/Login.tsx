import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import marketImg from "../assets/booths.png";
import { useSignIn } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";


const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const [oathLoading, setOauthLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Email + password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLoaded || !signIn) return;

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        console.error("Sign in not complete:", result);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.errors ? err.errors[0].message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // OAuth login
  const handleOAuth = async (provider: "oauth_google") => {
    if (!isLoaded || !signIn) return;
    setOauthLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
      setOauthLoading(false);
    } catch (err: any) {
      console.error("OAuth login error:", err);
      setOauthLoading(false);
      setError(err.errors ? err.errors[0].message : "Google login failed");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="font-sans bg-gradient-to-r bg-[#FFF9E9] min-h-screen flex flex-col"
    >
      {/* Navbar */}
      <Navbar />

      {/* Two-column layout */}
      <div className="flex flex-1">
        {/* Left side */}
         {/* Left Side - Hero Section */}
        <div className="w-1/2 hidden lg:flex flex-col justify-center items-center  p-12 relative overflow-hidden">

        {/* Decorative gradient blob (subtle background effect) */}
        <div className="absolute -top-20 -left-20 w-72 h-72 "></div>
        <div className="absolute bottom-0 right-0 w-96 h-96"></div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 max-w-lg text-center space-y-5"
        >
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Secure Access to Your <span className="text-orange-500">Booth Reservations</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
            Join <span className="font-semibold text-gray-600">BoothEase</span> today —
            where booth renters and owners connect effortlessly.
            Simplify your reservations, manage bookings, and grow your business.
            </p>

            <div className="flex justify-center">
            <motion.img
                src={marketImg}
                alt="BoothEase Market"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-[26vw] max-w-sm drop-shadow-lg mt-6"
            />
            </div>
        </motion.div>
        </div>

        {/* Right side (form) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-1 text-gray-600">Login</h1>
            <h2 className="text-l font-semibold text-gray-800 mb-4">Access your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  aria-label="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  aria-label="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-orange-400 text-white rounded-md font-medium hover:bg-orange-500 transition"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-2 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google OAuth */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuth("oauth_google")}
              disabled={oathLoading}
              className={`w-full py-2 border border-gray-400 flex items-center justify-center gap-2 rounded-md transition 
                ${oathLoading ? "bg-gray-100 cursor-not-allowed opacity-70" : "hover:bg-gray-100"}`}
            >
              {oathLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </>
              )}
            </motion.button>


            <p className="text-sm text-gray-500 mt-4 text-center">
              Don’t have an account?{" "}
              <a href="/register" className="text-teal-600 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
