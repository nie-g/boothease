import { useState, useRef } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import marketImg from "../assets/booths.png";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 persist signup attempt ID across renders
  const signUpIdRef = useRef<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Sign up
  // Step 1: Sign up
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!isLoaded || !signUp) return;

  try {
    await signUp.create({
      emailAddress: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      unsafeMetadata: {
        userType: "renter",
      },
    });

    // request email code
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

    setVerifying(true); // switch UI to verification step
  } catch (err: any) {
    console.error("Signup error details:", err);
    setError(err.errors?.[0]?.message || "Sign up failed");
  } finally {
    setLoading(false);
  }
};

// Step 2: Verify email
const handleVerification = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!isLoaded || !signUp) return;

  try {
    const complete = await signUp.attemptEmailAddressVerification({ code });

    if (complete.status === "complete") {
      await setActive({ session: complete.createdSessionId });
      navigate("/dashboard");
    } else {
      setError("Verification not complete. Please try again.");
    }
  } catch (err: any) {
    console.error("Verification error details:", err);
    setError(err.errors?.[0]?.message || "Verification failed");
  } finally {
    setLoading(false);
  }
};

  // Google OAuth
  const handleOAuth = async (provider: "oauth_google") => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
        unsafeMetadata: { userType: "renter" },
      });
    } catch (err: any) {
      console.error("OAuth signup error:", err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("Google signup failed");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFE9CC] items-center justify-center">
      <div className="flex w-full max-w-5xl h-[550px] shadow-lg bg-white">
        {/* Left side */}
        <div className="w-1/2 bg-[#FFE9CC] flex flex-col justify-center items-start">
        <div className="flex-[2/3] p-17">
           <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-left">
            Secure Access to Your Booth Reservations.
          </h2>
          <h1 className="text-6xl font-bold text-[#1a1a1a] text-left">
            Join <br /> BoothEase <br /> Today!
          </h1>
        </div>
        <div className="flex-[1/3]">
          <img src={marketImg} alt="Market" className="w-full h-auto" />
        </div>
         
          
        </div>

        {/* Right side */}
        <div className="w-1/2 p-16 flex flex-col justify-center">
          {!verifying ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800">Signup</h2>
              <p className="text-sm text-gray-500 mb-6">
                Join the community today!
              </p>

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Name fields side by side */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-l text-gray-500">First Name</span>
                    <input
                      type="text"
                      name="firstName"
                      aria-label="First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <span className="text-l text-gray-500">Last Name</span>
                    <input
                      type="text"
                      name="lastName"
                      aria-label="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
                      required
                    />
                  </div>
                </div>


                {/* Email */}
                <span className="text-l text-gray-500">Email</span>
                <input
                  type="email"
                  name="email"
                  aria-label="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
                  required
                />

                {/* Password */}
                <span className="text-l text-gray-500">Password</span>
                <input
                  type="password"
                  name="password"
                  aria-label="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
                  required
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#EB6A34] text-white rounded-md font-medium hover:bg-orange-600 transition"
                >
                  {loading ? "Signing up..." : "Signup"}
                </button>
              </form>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-2 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={() => handleOAuth("oauth_google")}
                className="w-full py-2 border border-gray-400 flex items-center justify-center gap-2 rounded-md hover:bg-gray-100"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Already have an account?{" "}
                <a href="/sign-in" className="text-[#EB6A34] font-medium">
                  Login
                </a>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Verify Your Email
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                We sent a verification code to {form.email}
              </p>

              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
                    placeholder="Enter verification code"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#EB6A34] text-white rounded-md font-medium hover:bg-orange-600 transition"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
