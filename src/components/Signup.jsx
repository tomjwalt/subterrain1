import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Link, Routes, Route } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          dob: dateOfBirth,
          gender,
          avatar_url: "",
        },
      ]);

      if (profileError) {
        console.error("Profile insert error:", profileError);
        setErrorMsg(profileError.message);
      } else {
        setSuccessMsg(
          "Sucessfully signed up check email to authenticate account."
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 rounded-lg shadow-md"
      >
        <input
          type="first name"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
        />
        <input
          type="last name"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition focus:ring-blue-400"
        />
        <div className="relative">
          <input
            id="dob"
            type="date"
            className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
          />
          <FontAwesomeIcon
            icon={faCalendarDays}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="gender" className="text-gray-300 text-sm">
            Gender
          </label>
          <select
            value={gender}
            id="gender"
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="faggot">Faggot</option>
          </select>
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
        />

        <button
          type="submit"
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white 
             focus:outline-none focus:ring-2 focus:ring-white hover:ring-2 hover:ring-white 
             focus:drop-shadow-[0_0_1px_white] hover:drop-shadow-[0_0_1px_white] 
             transition"
        >
          Sign Up
        </button>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-green-500">{successMsg}</p>}
      </form>
    </div>
  );
};

export default Signup;
