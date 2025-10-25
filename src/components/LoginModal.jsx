import React, { useRef, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import GoogleSignInButton from "../assets/web_dark_rd_ctn.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ onClose, onSignupRedirect }) => {
  const modalRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Email/Password Login ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      alert("Logged in successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- OAuth Login (Google, Facebook) ---
  const handleOAuthLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {prompt: "select_account"},
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url; // ✅ redirect user to OAuth flow
    } catch (err) {
      console.error(`OAuth login error: ${err.message}`);
      alert(`Login failed with ${provider}. Please try again.`);
    }
  };

  return (
    <div
      className="absolute top-20 right-6 z-50"
      onMouseEnter={() => clearTimeout(window.closeLoginTimeout)}
      onMouseLeave={() => {
        window.closeLoginTimeout = setTimeout(onClose, 0);
      }}
    >
      <div
        ref={modalRef}
        className="relative bg-gray-900 text-white rounded-xl p-6 w-80 shadow-lg border border-gray-800"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">Log In</h2>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm hover:border-white transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm hover:border-white transition"
            required
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 border border-gray-700 text-white py-2 rounded-md bg-black transition hover:border-white ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* --- OAUTH BUTTONS --- */}
          <div className="flex flex-col gap-4 mt-6 py-2 items-center">
            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center w-full h-10 cursor-pointer hover:opacity-80 transition"
            >
              <img
                src={GoogleSignInButton}
                alt="Sign in with Google"
                className="h-full"
              />
            </button>

            {/* FACEBOOK BUTTON */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("facebook")}
              className="flex items-center justify-center w-full h-10 cursor-pointer hover:opacity-80 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="240"
                height="40"
                viewBox="0 0 240 40"
                fill="none"
                className="h-full"
              >
                <rect
                  width="240"
                  height="40"
                  rx="20"
                  fill="#131314"
                  stroke="#8E918F"
                  strokeWidth="1"
                />
                <g transform="translate(22, 8)">
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path
                    d="M14.8 12.6h-2.4v8.2h-3.3v-8.2H7.8v-2.9h1.3V8.7c0-2.2 0.9-3.7 3.7-3.7h2.3v2.9h-1.4c-1 0-1.1 0.4-1.1 1.1v1.7h2.6l-0.4 2.9z"
                    fill="white"
                  />
                </g>
                <text
                  x="55"
                  y="25"
                  fill="#E3E3E3"
                  fontFamily="Roboto, sans-serif"
                  fontWeight="500"
                  fontSize="14"
                >
                  Continue with Facebook
                </text>
              </svg>
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            New customer?{" "}
            <button
              onClick={onSignupRedirect}
              className="text-white underline hover:text-gray-300 cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
