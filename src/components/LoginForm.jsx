import React, { useState } from "react";
import { supabase } from "../../supabaseClient.js";

const LoginForm = ({ onSignupRedirect }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 text-red-400 p-2 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-500"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
            type="submit"
            className="mt-2 border border-gray-700 hover:border-white text-white py-2 rounded-md bg-black transition"
          >
            Log In
          </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p className="text-sm text-center text-gray-400 mt-2">
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={onSignupRedirect}
          className="text-white underline hover:text-gray-300 cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
