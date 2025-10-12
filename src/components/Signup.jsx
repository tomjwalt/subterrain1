import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faLocationCrosshairs,
} from "@fortawesome/free-solid-svg-icons";

const GETADDRESS_API_KEY = "mtWbhJyhyU6LW4ucv1SH9Q48183";

const AddressInput = ({
  address,
  setAddress,
  setHouseNumber,
  setStreet,
  setCity,
  setState,
  setPostalCode,
  setCountry,
}) => {
  const [postcode, setPostcode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Step 1 — get list of possible addresses for the postcode
  const findAddressesByPostcode = async () => {
    if (!postcode) {
      alert("Please enter a postcode");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/autocomplete/${encodeURIComponent(
          postcode
        )}?api-key=${GETADDRESS_API_KEY}`
      );
      const data = await response.json();

      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        alert("No addresses found for that postcode");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      alert("Failed to fetch addresses. Check API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  // 🏠 Step 2 — when user selects one address, fetch full details
  const handleSelectAddress = async (sug) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/get/${sug.id}?api-key=${GETADDRESS_API_KEY}`
      );
      const data = await response.json();

      if (data) {
        const buildingNumber = data.building_number || "";
        const thoroughfare = data.thoroughfare || "";
        const town = data.post_town || "";
        const county = data.county || "";
        const postcode = data.postcode || "";
        const formatted = data.formatted_address.join(", ");

        setHouseNumber(buildingNumber);
        setStreet(thoroughfare);
        setCity(town);
        setState(county);
        setPostalCode(postcode);
        setCountry("United Kingdom");
        setAddress(formatted);
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching address details:", err);
      alert("Unable to retrieve address details.");
    } finally {
      setLoading(false);
    }
  };

  // 📍 Step 3 — optional: use geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.getAddress.io/find/${latitude},${longitude}?api-key=${GETADDRESS_API_KEY}`
          );
          const data = await res.json();

          if (data && data.addresses && data.addresses[0]) {
            const addr = data.addresses[0];
            const formatted = Object.values(addr).filter(Boolean).join(", ");

            setAddress(formatted);
            setHouseNumber(addr.building_number || "");
            setStreet(addr.thoroughfare || "");
            setCity(addr.post_town || "");
            setState(addr.county || "");
            setPostalCode(addr.postcode || "");
            setCountry("United Kingdom");
          }
        } catch (err) {
          alert("Unable to retrieve location details");
          console.error(err);
        }
      },
      (err) => {
        alert("Location access denied or unavailable");
        console.error("Geolocation error:", err.message);
      }
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full relative">
      {/* Postcode field + Find button */}
      <div className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Enter postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          className="flex-grow input-field text-base px-4 py-3"
        />
        <button
          type="button"
          onClick={findAddressesByPostcode}
          disabled={loading}
          className="input-field bg-black border border-gray-700 text-white hover:border-white hover:shadow-white/40 cursor-pointer flex items-center justify-center whitespace-nowrap"
        >
          {loading ? "Loading..." : "Find My Address"}
        </button>
      </div>

      {/* Dropdown of addresses */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-md mt-2 z-10">
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => handleSelectAddress(sug)}
              className="block w-full text-left text-white px-3 py-2 hover:bg-gray-800 transition"
            >
              {sug.address}
            </button>
          ))}
        </div>
      )}

      {/* Use my location button */}
      <button
        type="button"
        onClick={handleUseLocation}
        className="input-field flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md cursor-pointer"
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} className="text-white" />
        Use My Location
      </button>
    </div>
  );
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Address fields
  const [address, setAddress] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          dob: dateOfBirth || null,
          gender,
          phone_number: phoneNumber,
          address,
          houseNumber,
          street,
          city,
          state,
          postal_code: postalCode,
          country,
          avatar_url: "",
        },
      ]);

      if (profileError) {
        setErrorMsg(profileError.message);
      } else {
        setSuccessMsg(
          "Successfully signed up. Check your email to confirm your account."
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black overflow-visible">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-md overflow-visible"
      >
        {/* Names */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Middle Name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input-field"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />

        {/* Date of Birth */}
        <div className="relative">
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="input-field"
          />
          <FontAwesomeIcon
            icon={faCalendarDays}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
          />
        </div>

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="input-field"
        />

        {/* Gender */}
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="input-field"
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* Address input */}
        <AddressInput
          address={address}
          setAddress={setAddress}
          setHouseNumber={setHouseNumber}
          setStreet={setStreet}
          setCity={setCity}
          setState={setState}
          setPostalCode={setPostalCode}
          setCountry={setCountry}
        />

        {/* Optional: show parsed values */}
        <div className="text-white text-sm space-y-1">
          {houseNumber && <p>House Number: {houseNumber}</p>}
          {street && <p>Street: {street}</p>}
          {city && <p>City: {city}</p>}
          {state && <p>County: {state}</p>}
          {postalCode && <p>Postcode: {postalCode}</p>}
          {country && <p>Country: {country}</p>}
        </div>

        {/* Passwords */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
        />

        {/* Terms */}
        <label className="text-white flex items-center gap-2">
          <input type="checkbox" /> I agree to the terms and conditions
        </label>
        <label className="text-white flex items-center gap-2">
          <input type="checkbox" /> I agree to marketing emails
        </label>

        {/* Submit */}
        <button type="submit" className="btn-submit">
          Sign Up
        </button>

        {/* Messages */}
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-green-500">{successMsg}</p>}
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background-color: black;
          border: 1px solid #374151;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          box-shadow: 0 0 2px white;
          border-color: white;
        }
        .btn-submit {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background-color: black;
          border: 1px solid #374151;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:hover {
          box-shadow: 0 0 2px white;
          border-color: white;
        }
      `}</style>
    </div>
  );
};

export default Signup;