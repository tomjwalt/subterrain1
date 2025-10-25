import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLocationCrosshairs, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ReCAPTCHA from "react-google-recaptcha";

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
  const dropdownRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setSuggestions(data?.suggestions || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      alert("Failed to fetch addresses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (sug) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.getAddress.io/get/${sug.id}?api-key=${GETADDRESS_API_KEY}`
      );
      const data = await response.json();

      console.log("GetAddress data:", data);

      if (data) {

        const getCity = (d) => d.post_town || d.district || d.town_or_city || d.locality || d.town || d.village || d.hamlet || "";

        setHouseNumber(data.building_number || data.building_name || "");
        setStreet(data.thoroughfare || "");
        setCity(getCity(data));
        setState(data.county || "");
        setPostalCode(data.postcode || "");
        setCountry("United Kingdom");
      }
      setSuggestions([]);
    } catch (err) {
      console.error("Error fetching address details:", err);
      alert("Unable to retrieve address details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
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
          const result = data.results[0];
          const components = result.address_components;
          const getComp = (type) => components.find((c) => c.types.includes(type))?.long_name || "";

          setHouseNumber(getComp("street_number"));
          setStreet(getComp("route"));
          setCity(getComp("postal_town") || getComp("locality"));
          setState(getComp("administrative_area_level_1"));
          setPostalCode(getComp("postal_code"));
          setCountry(getComp("country"));
        } catch (err) {
          console.error(err);
          alert("Failed to fetch location details.");
        }
      },
      (err) => {
        alert("Location access denied or unavailable");
        console.error(err.message);
      }
    );
  };

  return (
    <>
      <div ref={dropdownRef} className="relative w-full">
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
            onClick={findAddressesByPostcode}
            disabled={loading}
            className="input-field bg-black border border-gray-700 text-white hover:border-white hover:shadow-white/40 cursor-pointer px-4 py-3"
          >
            {loading ? "Loading..." : "Find Address"}
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-md mt-2 z-10 max-h-60 overflow-y-auto">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                onClick={() => handleSelectAddress(sug)}
                className="p-2 bg-gray-800 border border-transparent rounded-md cursor-pointer 
               hover:bg-gray-700 hover:border-white transition-all duration-200 ease-in-out text-white"
              >
                {sug.address}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseLocation}
        className="input-field flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md cursor-pointer px-4 py-3 mt-2"
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />
        Use My Location
      </button>
    </>
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
  const [captchaToken, setCaptchaToken] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA before signing up.");
      return;
    }

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

    setEmailSent(true);
    setSuccessMsg("Signup successful! Please check your email to verify your account.");
  };

  const resendVerification = async () => {
    if (!email) {
      setErrorMsg("Enter your email to resend verification.");
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) setErrorMsg(error.message);
    else setSuccessMsg("Verification email resent! Check your inbox.");
  };

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-md"
      >
        <input type="text" placeholder="First Name*" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="input-field" />
        <input type="text" placeholder="Last Name*" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
        <input type="email" placeholder="Email*" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />

        <div className="relative">
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input-field" />
          <FontAwesomeIcon icon={faCalendarDays} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
        </div>

        <input type="tel" placeholder="Phone Number*" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" />

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer-not-to-say">Prefer Not To Say</option>
        </select>

        <AddressInput setHouseNumber={setHouseNumber} setStreet={setStreet} setCity={setCity} setState={setState} setPostalCode={setPostalCode} setCountry={setCountry} />

        <input type="text" placeholder="House Name / Number*" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="input-field" />
        <input type="text" placeholder="Street*" value={street} onChange={(e) => setStreet(e.target.value)} className="input-field" />
        <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
        <input type="text" placeholder="County" value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
        <input type="text" placeholder="Postcode*" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input-field" />
        <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" />

        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="Password*" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" />

          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer transition-opacity duration-200"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="relative">
          <input type={showConfirmPassword ? "text" : "password" } placeholder="Confirm Password*" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pr-10" />

          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer transition-opacity duration-200"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <label className="text-white flex items-center gap-2">
          <input type="checkbox" />I agree to the terms and conditions
        </label>
        <label className="text-white flex items-center gap-2">
          <input type="checkbox" />I agree to marketing emails
        </label>

        <ReCAPTCHA
          sitekey="6Lcslu8rAAAAAMLjcMQ6ZZut5wODSgoxAK_zHy1S"
          onChange={(token) => setCaptchaToken(token)}
          theme="dark"
          style={{ transform: "scale(0.85)", transformOrigin: "0 0" }}
        />

        <button type="submit" className="btn-submit">Sign Up</button>

        {emailSent && (
          <button type="button" onClick={resendVerification} className="btn-submit bg-indigo-600 mt-2 hover:bg-indigo-700">
            Resend Verification Email
          </button>
        )}

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
