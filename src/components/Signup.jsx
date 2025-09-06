import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (user) {
      // Insert user into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, email }]);

      if (profileError) {
        setErrorMsg("Signed up but failed to create profile.");
        console.error(profileError.message);
      } else {
        setSuccessMsg("Sucessfully signed up check email to authenticate account.");
      }
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-white border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="text-white border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition cursor-pointer"
      >
        Sign Up
      </button>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
    </form>
  );
};

export default Signup;
