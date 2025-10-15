import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

const GETADDRESS_API_KEY = "mtWbhJyhyU6LW4ucv1SH9Q48183";
const GOOGLE_API_KEY = "AIzaSyDBPnU6AYyPDTTwUWaMXliQ-HGJk2LqgWk";

const AddressInput = ({
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

  // Fetch addresses via GetAddress.io
  const findAddressesByPostcode = async () => {
    if (!postcode) {
      alert("Please enter a postcode");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/autocomplete/${encodeURIComponent(postcode)}?api-key=${GETADDRESS_API_KEY}`
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

  // Select from dropdown
  const handleSelectAddress = async (sug) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/get/${sug.id}?api-key=${GETADDRESS_API_KEY}`
      );
      const data = await response.json();

      if (data) {
        setHouseNumber(data.building_number || data.building_name || "");
        setStreet(data.thoroughfare || "");
        setCity(data.post_town || "");
        setState(data.county || "");
        setPostalCode(data.postcode || "");
        setCountry("United Kingdom");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching address details:", err);
      alert("Unable to retrieve address details.");
    } finally {
      setLoading(false);
    }
  };

  // Use My Location (Google)
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
          );
          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components;

            const getComponent = (type) => {
              const comp = components.find((c) => c.types.includes(type));
              return comp ? comp.long_name : "";
            };

            setHouseNumber(getComponent("street_number"));
            setStreet(getComponent("route"));
            setCity(
              getComponent("postal_town") ||
              getComponent("locality") ||
              getComponent("administrative_area_level_2")
            );
            setState(getComponent("administrative_area_level_1"));
            setPostalCode(getComponent("postal_code"));
            setCountry(getComponent("country"));
          } else {
            alert("Could not find address from your location.");
          }
        } catch (err) {
          console.error("Error fetching location details:", err);
          alert("Unable to retrieve location details.");
        }
      },
      (err) => {
        alert("Location access denied or unavailable");
        console.error("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full relative">
      {/* Postcode + Find Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          findAddressesByPostcode();
        }}
        className="flex gap-2 w-full"
      >
        <input
          type="text"
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              findAddressesByPostcode();
            }

          }}
          className="input-field flex-grow px-4 py-3"
        />
        <button
          type="button"
          disabled={loading}
          onClick={findAddressesByPostcode}
          className="input-field bg-black border border-gray-700 text-white hover:border-white hover:shadow-white/40 cursor-pointer px-4 py-3"
        >
          {loading ? "Loading..." : "Find My Address"}
        </button>
      </form>

      {/* Dropdown */}
      {suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-md mt-2 z-10 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
          style={{
            maxHeight: "240px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => handleSelectAddress(sug)}
              className="block w-full text-left text-white px-3 py-2 hover:bg-gray-600 transition cursor-pointer hover:bg-gray-800 hover:text-gray-400 transition-colors duration-150 ease-in-out"
            >
              {sug.address}
            </button>
          ))}
        </div>
      )}

      {/* Use My Location */}
      <button
        type="button"
        onClick={handleUseLocation}
        className="input-field flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md cursor-pointer px-4 py-3"
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />
        Use My Location
      </button>
    </div>
  );
};

// ---------------------- SIGNUP FORM ----------------------
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

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
          house_number: houseNumber,
          street,
          city,
          state,
          postal_code: postalCode,
          country,
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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-md"
      >
        {/* Basic Info */}
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />

        <div className="relative">
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input-field" />
          <FontAwesomeIcon icon={faCalendarDays} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
        </div>

        <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" />

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* Address */}
        <AddressInput
          setHouseNumber={setHouseNumber}
          setStreet={setStreet}
          setCity={setCity}
          setState={setState}
          setPostalCode={setPostalCode}
          setCountry={setCountry}
        />

        <input type="text" placeholder="House Name / Number" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="input-field" />
        <input type="text" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} className="input-field" />
        <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
        <input type="text" placeholder="County" value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
        <input type="text" placeholder="Postcode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input-field" />
        <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" />

        {/* Passwords */}
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />

        <button type="submit" className="btn-submit">Sign Up</button>

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