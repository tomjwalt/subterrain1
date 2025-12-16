// src/components/CheckoutWrapper.jsx
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import Checkout from "./Checkout";
import { supabase } from "../../supabaseClient";

// Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

// TEMP: hard-coded to the working Edge Function URL
const CREATE_PI_URL =
  "https://nyebwdvhkgiumqswbrfb.functions.supabase.co/create-payment-intent";

const CheckoutWrapper = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState(null);

  // "decide" = choose login vs guest
  // "guest-email" = enter email for guest
  // "payment" = Stripe PaymentElement
  const [step, setStep] = useState("decide");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1) Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
      }

      if (data?.user) {
        setUser(data.user);
        if (data.user.email) {
          setEmail(data.user.email);
        }
      }
      setAuthChecked(true);
    };

    checkUser();
  }, []);

  // Helper: create a PaymentIntent for a given email
  const createPaymentIntent = async (emailForPI) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const trimmed = (emailForPI || "").trim();

      if (!trimmed) {
        throw new Error("Missing email address for checkout.");
      }

      console.log("🔹 Calling Edge Function:", CREATE_PI_URL);

      // NOTE: no custom headers → simple POST → avoids preflight CORS
      const res = await fetch(CREATE_PI_URL, {
        method: "POST",
        body: JSON.stringify({
          amount: 2499, // in pence
          currency: "gbp",
          email: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("🔹 Supabase response (checkout):", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      if (!data.clientSecret) {
        throw new Error("No clientSecret returned from server");
      }

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err) {
      console.error("❌ Error creating payment intent:", err);
      setErrorMsg(err.message || "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  // 2) If user is logged in, automatically create PI with their email
  useEffect(() => {
    if (!authChecked) return;
    if (!user) return;
    if (clientSecret) return; // already have one

    // logged-in flow – skip guest options
    createPaymentIntent(user.email || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user]);

  // Still checking auth?
  if (!authChecked) {
    return <p className="text-white text-center mt-10">Loading checkout...</p>;
  }

  // ---- NOT LOGGED IN: Step 1 – choose login vs guest ----
  if (!user && step === "decide") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

        <div className="bg-[#121212] p-8 rounded-2xl shadow-lg w-[420px] space-y-5">
          <p className="text-sm text-gray-300">
            Choose how you’d like to continue:
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-2 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-all"
          >
            Sign in or create an account
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <button
            onClick={() => setStep("guest-email")}
            className="w-full py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Continue as guest
          </button>

          <p className="mt-2 text-xs text-gray-400">
            If you continue as a guest, we’ll email your order confirmation to
            the address you provide.
          </p>
        </div>
      </div>
    );
  }

  // ---- NOT LOGGED IN: Step 2 – guest email input ----
  if (!user && step === "guest-email") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

        <div className="bg-[#121212] p-8 rounded-2xl shadow-lg w-[420px]">
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setStep("decide");
            }}
            className="mb-4 text-sm text-gray-300 hover:text-white"
          >
            ← Back
          </button>

          <label className="block mb-2 text-sm font-medium">
            Email address (guest)
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg bg-[#1c1c1c] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <p className="mt-2 text-xs text-gray-400">
            We’ll send your order confirmation to this email address.
          </p>

          {errorMsg && (
            <p className="mt-3 text-sm text-red-400 text-center">{errorMsg}</p>
          )}

          <button
            onClick={() => createPaymentIntent(email)}
            disabled={loading}
            className={`mt-6 w-full py-2 rounded-lg font-medium transition-all ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Starting checkout..." : "Continue to payment"}
          </button>
        </div>
      </div>
    );
  }

  // ---- PAYMENT STEP (logged in OR guest) ----
  if (!clientSecret) {
    return (
      <p className="text-white text-center mt-10">
        Something went wrong loading the payment form.
        {errorMsg && (
          <span className="block text-red-400 mt-2">{errorMsg}</span>
        )}
      </p>
    );
  }

  const handleBackFromPayment = () => {
    if (user) {
      navigate("/");
    } else {
      setClientSecret(null);
      setStep("guest-email");
    }
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Checkout onBack={handleBackFromPayment} />
    </Elements>
  );
};

export default CheckoutWrapper;
