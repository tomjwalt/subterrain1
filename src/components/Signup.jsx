import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

const GETADDRESS_API_KEY = "mtWbhJyhyU6LW4ucv1SH9Q48183";
const GOOGLE_API_KEY = "AIzaSyDBPnU6AYyPDTTwUWaMXliQ-HGJk2LqgWk";

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
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch list of addresses by postcode (GetAddress.io)
  const findAddressesByPostcode = async () => {
    if (!postcode.trim()) {
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

      if (data?.suggestions?.length) {
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

  // Fetch full address details from GetAddress.io
  const handleSelectAddress = async (sug) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/get/${sug.id}?api-key=${GETADDRESS_API_KEY}`
      );
      const data = await response.json();

      if (data) {
        setHouseNumber(data.building_number || "");
        setStreet(data.thoroughfare || "");
        setCity(data.post_town || "");
        setState(data.county || "");
        setPostalCode(data.postcode || "");
        setCountry("United Kingdom");
        setAddress(data.formatted_address.join(", "));
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching address details:", err);
      alert("Unable to retrieve address details.");
    } finally {
      setLoading(false);
    }
  };

  // Use My Location (Google Maps API)
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
          );
          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components;
            const get = (type) =>
              components.find((c) => c.types.includes(type))?.long_name || "";

            setHouseNumber(get("street_number"));
            setStreet(get("route"));
            setCity(get("postal_town") || get("locality"));
            setState(get("administrative_area_level_1"));
            setPostalCode(get("postal_code"));
            setCountry(get("country"));
            setAddress(result.formatted_address);
          } else {
            alert("Could not find address from your location.");
          }
        } catch (err) {
          console.error("Error fetching location:", err);
          alert("Unable to retrieve location details.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        alert("Location access denied or unavailable.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full relative" ref={dropdownRef}>
      {/* Postcode input and find button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          findAddressesByPostcode();
        }}
        className="flex gap-2 items-center w-full"
      >
        <input
          type="text"
          placeholder="Enter postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          className="input-field flex-grow text-base px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className={`input-field bg-black border border-gray-700 text-white hover:border-white hover:shadow-white/40 cursor-pointer flex items-center justify-center whitespace-nowrap px-4 py-3 transition ${
            loading ? "opacity-50 cursor-wait" : ""
          }`}
        >
          {loading ? "Loading..." : "Find My Address"}
        </button>
      </form>

      {/* Dropdown list */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-md mt-2 z-10 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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

      {/* Use my location */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={loading}
        className={`input-field flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md px-4 py-3 transition ${
          loading ? "opacity-50 cursor-wait" : "cursor-pointer"
        }`}
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />
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
        setSuccessMsg("Successfully signed up. Check your email to confirm your account.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-md"
      >
        {/* Basic inputs */}
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />

        {/* Date of birth */}
        <div className="relative">
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input-field" />
          <FontAwesomeIcon icon={faCalendarDays} className="absolute right-3 top-1/2 -translate-y-1/2 text-white" />
        </div>

        <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" />

        {/* Gender */}
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* Address block */}
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

        {/* Show parsed address */}
        <div className="text-white text-sm space-y-1">
          {houseNumber && <p>House Number: {houseNumber}</p>}
          {street && <p>Street: {street}</p>}
          {city && <p>City: {city}</p>}
          {state && <p>County: {state}</p>}
          {postalCode && <p>Postcode: {postalCode}</p>}
          {country && <p>Country: {country}</p>}
        </div>

        {/* Passwords */}
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />

        {/* Checkboxes */}
        <label className="text-white flex items-center gap-2">
          <input type="checkbox" /> I agree to the terms and conditions
        </label>
        <label className="text-white flex items-center gap-2">
          <input type="checkbox" /> I agree to marketing emails
        </label>

        {/* Submit */}
        <button type="submit" className="btn-submit">Sign Up</button>

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
          border-color: white;
          box-shadow: 0 0 2px white;
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
          border-color: white;
          box-shadow: 0 0 2px white;
        }
      `}</style>
    </div>
  );
};

export default Signup;
