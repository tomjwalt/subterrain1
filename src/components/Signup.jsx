import React from "react";
import { supabase } from "../../supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUperror, setSignUpError } = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.SignUp({
      email,
      password,
    });
  };
  if (error) {
    setError(error.message);
  } else {
    setMessage("Check your email to authenticate account");
  }
  return (
    <div>
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg"
      >
        <h2 className="text-white text-xl font-bold">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
        {error && <p className="text-red-400">{error}</p>}
        {message && <p className="text-green-400">{message}</p>}
      </form>
    </div>
  );
};

export default Signup;
