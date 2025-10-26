import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- Restore session from recovery link ---
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    const handleRecovery = async () => {
      if (type === "recovery" && access_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("Error restoring session:", error.message);
          setError("Invalid or expired reset link.");
        } else {
          setSessionRestored(true);
        }
      } else {
        setError("Invalid reset link.");
      }
    };

    handleRecovery();
  }, []);

  // --- Handle password update ---
  const handleResetPassword = async () => {
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2500);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 w-96 shadow-lg text-center"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className="bg-gray-800 p-3 rounded-full">
                  <FontAwesomeIcon icon={faLock} className="text-white text-xl" />
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-6">
                {sessionRestored
                  ? "Enter your new password below."
                  : "Validating your reset link..."}
              </p>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded-md mb-4">
                  {error}
                </p>
              )}

              {sessionRestored && (
                <>
                  <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-3 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleResetPassword();
                        }
                    }}
                    className="w-full p-2 mb-4 rounded-md bg-black border border-gray-700 focus:border-white outline-none text-sm"
                  />
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={`w-full py-2 rounded-md border border-gray-700 transition bg-black hover:border-white ${
                      loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-400 text-5xl mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm mb-2">
                You’ll be redirected to login shortly.
              </p>
              <p className="text-gray-500 text-xs">Redirecting...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
