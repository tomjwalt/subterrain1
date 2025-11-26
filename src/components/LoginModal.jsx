// src/components/LoginModal.jsx
import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient.js";
import GoogleSignInButton from "../assets/web_dark_rd_ctn.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LoginModal = ({ onClose, onSignupRedirect }) => {
  const modalRef = useRef(null);

  // auth / user state
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  // login-form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Get current user + listen for changes ---
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (error) {
          console.error("Error getting user:", error.message);
        }
        setUser(data?.user ?? null);
      } finally {
        if (isMounted) setCheckingUser(false);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Email / password login ---
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

      // Supabase listener will setUser() for us
      alert("Logged in successfully!");
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- OAuth login (Google / Facebook) ---
  const handleOAuthLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error(`OAuth login error: ${err.message}`);
      alert(`Login failed with ${provider}. Please try again.`);
    }
  };

  // --- Forgot password ---
  const handleForgotPassword = async () => {
    const email = prompt("Enter your email to reset your password");
    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password reset link sent. Please check your email.");
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      onClose && onClose();
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  // --- Auto-close hover behaviour (your existing logic) ---
  const handleMouseLeave = () => {
    window.closeLoginTimeout = setTimeout(() => {
      onClose && onClose();
    }, 0);
  };

  const handleMouseEnter = () => {
    if (window.closeLoginTimeout) {
      clearTimeout(window.closeLoginTimeout);
      window.closeLoginTimeout = null;
    }
  };

  return (
    <div
      className="absolute top-20 right-6 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

        {/* While we check Supabase */}
        {checkingUser ? (
          <p className="text-center text-gray-400 text-sm">Checking session…</p>
        ) : user ? (
          // ---------- LOGGED-IN VIEW ----------
          <>
            <h2 className="text-xl font-semibold mb-2 text-center">
              My Account
            </h2>
            <p className="text-xs text-gray-400 text-center mb-4">
              Signed in as <span className="text-white">{user.email}</span>
            </p>

            <div className="flex flex-col gap-2 mb-4 text-sm">
              <button className="w-full text-left px-3 py-2 rounded-md bg-black border border-gray-700 hover:border-white transition">
                Orders
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-black border border-gray-700 hover:border-white transition">
                Likes
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-black border border-gray-700 hover:border-white transition">
                Addresses
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-2 border border-red-500 text-red-400 py-2 rounded-md bg-black hover:bg-red-600 hover:text-white transition"
            >
              Log out
            </button>
          </>
        ) : (
          // ---------- NOT LOGGED-IN VIEW (your original form) ----------
          <>
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

              <p
                onClick={handleForgotPassword}
                className="text-sm text-gray-400 hover:text-white cursor-pointer text-right mt-1"
              >
                Forgot password?
              </p>

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
                  {/* your SVG unchanged */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
