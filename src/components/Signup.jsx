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
      // Insert user into profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, email }]);

      if (profileError) {
        setErrorMsg("Signed up but failed to create profile.");
        console.error(profileError.message);
      } else {
        setSuccessMsg(
          "Sucessfully signed up check email to authenticate account."
        );
      }
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <input
        type="first name"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setfirstName(e.target.value)}
        className="text-white border border-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="last name"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="text-white border border-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="relative">
        <input
          id="dob"
          type="date"
          className="dob-input border border-gray-400 p-2 rounded text-white w-full pr-10"
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
          className="text-white border border-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        className="text-white border border-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="border border-gray-400 bg-green-600 text-gray-300 py-2 rounded hover:text-white transition cursor-pointer"
      >
        Sign Up
      </button>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
    </form>
  );
};

export default Signup;
