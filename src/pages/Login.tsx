import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import marketImg from "../assets/booths.png";

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

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
      setError(err.errors ? err.errors[0].message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // OAuth login (Google)
  const handleOAuth = async (provider: "oauth_google") => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors ? err.errors[0].message : "Google login failed");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#FFE9CC] items-center justify-center">
      <div className="flex w-full max-w-5xl h-[550px] shadow-lg bg-white">
        {/* Left side */}
        <div className="w-1/2 bg-[#FFE9CC] flex flex-col justify-center items-start p-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-left">
            Welcome Back to BoothEase
          </h2>
          <h1 className="text-6xl font-bold text-[#1a1a1a] text-left">
            Login <br /> to Manage <br /> Your Booths
          </h1>
          <div className="mt-6">
            <img
              src={marketImg}
              alt="Booth market"
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="w-1/2 p-16 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <p className="text-sm text-gray-500 mb-6">Access your account</p>

          <form onSubmit={handleSubmit} className="space-y-2">
            <span className="text-l text-gray-500">Email</span>
            <input
              type="email"
              name="email"
              aria-label="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
            />

            <span className="text-l text-gray-500">Password</span>
            <input
              type="password"
              name="password"
              aria-label="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 bg-[#D9D9D9] rounded-md"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#EB6A34] text-white rounded-md font-medium hover:bg-orange-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
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
            Don’t have an account?{" "}
            <a href="/sign-up" className="text-[#EB6A34] font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
