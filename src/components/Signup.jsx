import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import ReCAPTCHA from "react-google-recaptcha";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA before signing up.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must agree to the terms and conditions.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter your first and last name.");
      return;
    }

    if (!dateOfBirth) {
      setErrorMsg("Please enter your date of birth.");
      return;
    }

    if (!gender) {
      setErrorMsg("Please select your gender.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            middle_name: middleName.trim() || null,
            last_name: lastName.trim(),
            dob: dateOfBirth,
            gender,
            marketing_opt_in: agreeMarketing,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      const userId = data?.user?.id;

      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            email,
            first_name: firstName.trim(),
            middle_name: middleName.trim() || null,
            last_name: lastName.trim(),
            dob: dateOfBirth || null,
            gender: gender || null,
          },
          { onConflict: "id" }
        );

        if (profileError) {
          console.error("Profile upsert error during signup:", profileError);
        }
      }

      setEmailSent(true);
      setSuccessMsg(
        "Signup successful! Please check your email to verify your account."
      );
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setErrorMsg("Something went wrong during signup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Enter your email to resend verification.");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Verification email resent! Check your inbox.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-md border border-gray-800"
      >
        <h1 className="text-zinc-900 text-2xl font-semibold text-center mb-2">
          Create account
        </h1>

        <input
          type="text"
          placeholder="First Name*"
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
          placeholder="Last Name*"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input-field"
        />

        <input
          type="email"
          placeholder="Email*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />

        <div className="relative">
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="input-field"
          />
          <FontAwesomeIcon
            icon={faCalendarDays}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none"
          />
        </div>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="input-field"
        >
          <option value="">Select Gender*</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer-not-to-say">Prefer Not To Say</option>
        </select>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pr-10"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 cursor-pointer transition-opacity duration-200"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password*"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field pr-10"
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 cursor-pointer transition-opacity duration-200"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <label className="text-zinc-900 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          I agree to the terms and conditions
        </label>

        <label className="text-zinc-900 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreeMarketing}
            onChange={(e) => setAgreeMarketing(e.target.checked)}
          />
          I agree to marketing emails
        </label>

        <ReCAPTCHA
          sitekey="6Lcslu8rAAAAAMLjcMQ6ZZut5wODSgoxAK_zHy1S"
          onChange={(token) => setCaptchaToken(token)}
          theme="light"
          style={{ transform: "scale(0.85)", transformOrigin: "0 0" }}
        />

        <button
          type="submit"
          disabled={submitting}
          className={`btn-submit ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {submitting ? "Signing Up..." : "Sign Up"}
        </button>

        {emailSent && (
          <button
            type="button"
            onClick={resendVerification}
            className="btn-submit bg-white mt-2 hover:bg-white"
          >
            Resend Verification Email
          </button>
        )}

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background-color: white;
          border: 1px solid #374151;
          color: #18181b;
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
          background-color: white;
          border: 1px solid #374151;
          color: #18181b;
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