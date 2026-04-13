import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, } from "@fortawesome/free-solid-svg-icons";

const PersonalDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      setAuthUser(user);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(`
          email,
          first_name,
          middle_name,
          last_name,
          dob,
          gender,
          phone_number,
          house_number,
          street,
          city,
          state,
          postal_code,
          country
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile load error:", profileError);
        setError("Unable to load profile.");
        setLoading(false);
        return;
      }

      setProfile({
        email: data?.email ?? user.email ?? "",
        first_name: data?.first_name ?? "",
        middle_name: data?.middle_name ?? "",
        last_name: data?.last_name ?? "",
        dob: data?.dob ?? "",
        gender: data?.gender ?? "",
        phone_number: data?.phone_number ?? "",
        house_number: data?.house_number ?? "",
        street: data?.street ?? "",
        city: data?.city ?? "",
        state: data?.state ?? "",
        postal_code: data?.postal_code ?? "",
        country: data?.country ?? "",
      });

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!authUser || !profile) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: authUser.id,
            email: profile.email,
            first_name: profile.first_name,
            middle_name: profile.middle_name,
            last_name: profile.last_name,
            dob: profile.dob || null,
            gender: profile.gender || null,
            phone_number: profile.phone_number || null,
            house_number: profile.house_number || null,
            street: profile.street || null,
            city: profile.city || null,
            state: profile.state || null,
            postal_code: profile.postal_code || null,
            country: profile.country || null,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        console.error("Profile save error:", upsertError);
        setError(upsertError.message || "Failed to save details. Please try again.");
        return;
      }

      setSuccess("Details updated successfully.");
    } catch (err) {
      console.error("Unexpected profile save error:", err);
      setError("Something went wrong while saving your details.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!authUser?.email) return;

    setError("");
    setSuccess("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      authUser.email,
      {
        redirectTo: "http://localhost:5173/reset-password",
      }
    );

    if (resetError) {
      console.error("Reset error:", resetError);
      setError(resetError.message || "Failed to send reset link.");
    } else {
      setSuccess("Password reset email sent. Please check your inbox.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading profile…
      </div>
    );
  }

  if (!profile || !authUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex items-start justify-center pt-24 px-4">
      <form
        onSubmit={handleSave}
        className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-gray-800 space-y-4"
      >
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Personal Details
        </h1>

        {error && (
          <p className="text-red-400 text-sm text-center mb-2">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm text-center mb-2">{success}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input-field"
            type="text"
            placeholder="First name"
            value={profile.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Middle name"
            value={profile.middle_name}
            onChange={(e) => handleChange("middle_name", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Last name"
            value={profile.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
          />
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input-field"
            type="date"
            value={profile.dob || ""}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          <select
            className="input-field"
            value={profile.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <input
          className="input-field"
          type="tel"
          placeholder="Phone number"
          value={profile.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input-field"
            type="text"
            placeholder="House name / number"
            value={profile.house_number}
            onChange={(e) => handleChange("house_number", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Street"
            value={profile.street}
            onChange={(e) => handleChange("street", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="City"
            value={profile.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="County / State"
            value={profile.state}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Postcode"
            value={profile.postal_code}
            onChange={(e) => handleChange("postal_code", e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Country"
            value={profile.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>

        <div className="mt-4 border-t border-gray-800 pt-4">
          <h2 className="text-sm font-semibold mb-2">Change password</h2>
          <p className="text-xs text-zinc-900 mb-3">
            We’ll email you a secure link to update your password.
          </p>

          <div className="relative mb-3">
            <input
              className="input-field pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Current password (optional visual only)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 cursor-pointer transition-opacity duration-200"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button
            type="button"
            onClick={handleSendPasswordReset}
            className="btn-submit bg-white border border-zinc-900 rounded-xl p-1 hover:border-zinc-400 cursor-pointer"
          >
            Send password reset email
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`btn-submit mt-2 ${
            saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default PersonalDetails;