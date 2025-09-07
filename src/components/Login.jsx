import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const Login = ({ onSignupRedirect }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      console.log("Logged in:", data);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-white border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-white border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded cursor-pointer"
      >
        Log In
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      {/* 👇 Clicking this will close modal + navigate to /signup */}
      <button
        type="button"
        onClick={onSignupRedirect}
        className="text-blue-400 underline cursor-pointer bg-transparent"
      >
        Or Sign Up
      </button>
    </form>
  );
};

export default Login;
