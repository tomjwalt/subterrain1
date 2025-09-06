import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // clear before login attempt

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message); // ✅ only set inside handler
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
      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        Log In
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <Link to="/signup" className="text-blue-400 underline cursor-pointer">
        Or Sign Up
      </Link>
    </form>
  );
};

export default Login;