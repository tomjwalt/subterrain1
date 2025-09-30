import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import Autocomplete from "react-google-autocomplete";

// Extract street, city, state, postal, country
const parseAddressComponents = (components) => {
  const result = {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };

  components.forEach((component) => {
    if (component.types.includes("street_number")) {
      result.street = component.long_name + " " + result.street;
    }
    if (component.types.includes("route")) {
      result.street += component.long_name;
    }
    if (component.types.includes("locality")) {
      result.city = component.long_name;
    }
    if (component.types.includes("administrative_area_level_1")) {
      result.state = component.long_name;
    }
    if (component.types.includes("postal_code")) {
      result.postalCode = component.long_name;
    }
    if (component.types.includes("country")) {
      result.country = component.long_name;
    }
  });

  return result;
};

const AddressInput = ({
  address,
  setAddress,
  setStreet,
  setCity,
  setState,
  setPostalCode,
  setCountry,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "gb" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      const parsed = parseAddressComponents(place.address_components);

      setAddress(place.formatted_address);
      setStreet(parsed.street);
      setCity(parsed.city);
      setState(parsed.state);
      setPostalCode(parsed.postalCode);
      setCountry(parsed.country);
    });
  }, []);

  return (
    <input
      type="text"
      ref={inputRef}
      placeholder="Start typing your address..."
      defaultValue={address}
      className="input-field"
    />
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
  const [phoneNumber, setPhoneNumber] = ("");

  // Address fields
  const [address, setAddress] = useState("");
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
          address, // full formatted address
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

          <input
          type="phoneNumber"
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

        {/* Google Address Input */}
        <AddressInput className="text-white"
          address={address}
          setAddress={setAddress}
          setStreet={setStreet}
          setCity={setCity}
          setState={setState}
          setPostalCode={setPostalCode}
          setCountry={setCountry}
        />

        {/* Show parsed fields (optional, remove if not needed) */}
        <div className="text-white text-sm space-y-1">
          {street && <p>Street: {street}</p>}
          {city && <p>City: {city}</p>}
          {state && <p>State: {state}</p>}
          {postalCode && <p>Postal Code: {postalCode}</p>}
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
        <label className="text-white flex items-center">
          <input type="checkbox" className="mr-2" />
          I agree to the terms and conditions
        </label>
        <label className="text-white flex items-center">
          <input type="checkbox" className="mr-2" />
          I agree to marketing emails
        </label>

        {/* Submit */}
        <button type="submit" className="btn-submit">
          Sign Up
        </button>

        {/* Messages */}
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-green-500">{successMsg}</p>}
      </form>

      <style jsx>{`
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