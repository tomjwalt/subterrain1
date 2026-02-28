import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "../../supabaseClient";
import Checkout from "./Checkout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const CheckoutWrapper = ({ cartItems = [], onRemoveFromCart }) => {
  const [stage, setStage] = useState("loading"); // 'loading' | 'email' | 'payment' | 'empty'
  const [clientSecret, setClientSecret] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [creatingIntent, setCreatingIntent] = useState(false);

  const hasItems = cartItems.length > 0;

  // prices are stored in pence (e.g. 2499)
  const totalAmountPence = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  // 🔍 On mount: if we have items, check if user is logged in
  useEffect(() => {
    const init = async () => {
      if (!hasItems) {
        setStage("empty");
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error checking auth in checkout:", error);
        }

        const user = data?.user;
        if (user?.email) {
          // Logged in → use their email automatically
          setUserEmail(user.email);
          await createPaymentIntent(user.email);
        } else {
          // Not logged in → show guest email step
          setStage("email");
        }
      } catch (err) {
        console.error("Unexpected auth check error:", err);
        setStage("email");
      }
    };

    init();
  }, [hasItems]); // runs once for this visit

  const createPaymentIntent = async (email) => {
    if (!totalAmountPence) {
      setErrorMessage("Your basket is empty.");
      setStage("empty");
      return;
    }

    try {
      setCreatingIntent(true);
      setErrorMessage("");

      console.log("Creating PaymentIntent for:", totalAmountPence, "pence");
      console.log("Line items:", cartItems);

      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: totalAmountPence, // already in pence
            currency: "gbp",
            receipt_email: email,
          },
        }
      );

      if (error) {
        console.error("Supabase response (checkout) error:", error);
        throw new Error(
          error.message || "Failed to create payment session."
        );
      }

      console.log("Supabase response (checkout):", data);

      const secret = data?.clientSecret || data?.client_secret;
      if (!secret) {
        throw new Error("No clientSecret returned from edge function.");
      }

      setClientSecret(secret);
      setStage("payment");
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setErrorMessage(
        err.message ||
          "Something went wrong starting your payment. Please try again."
      );
      setStage("email"); // fall back to email step
    } finally {
      setCreatingIntent(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestEmail) return;
    await createPaymentIntent(guestEmail);
  };

  const effectiveEmail = userEmail || guestEmail;

  // ---------- RENDER STATES ----------

  if (!hasItems || stage === "empty") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm text-sm text-center">
          <p className="mb-2">Your basket is empty.</p>
          <p className="text-xs text-zinc-500">
            Add something to your cart to start checkout.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-zinc-400">
          Preparing your checkout…
        </p>
      </div>
    );
  }

  // Guest email step (for not-logged-in users)
  if (stage === "email") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-4">
            Checkout
          </h1>
          <p className="text-xs text-zinc-400 mb-4 text-center">
            Enter your email to receive your receipt. You can continue
            as a guest.
          </p>

          <form onSubmit={handleGuestSubmit} className="space-y-3 pb-6">
            <div>
              <label className="block text-[0.7rem] uppercase tracking-[0.25em] text-zinc-500 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={creatingIntent}
              className={`w-full py-2 rounded-lg text-xs font-medium uppercase tracking-[0.2em] ${
                creatingIntent
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {creatingIntent ? "Starting checkout…" : "Continue as guest"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Payment stage – MUST be wrapped in <Elements>
  if (stage === "payment" && clientSecret) {
    const options = {
  clientSecret,
  appearance: {
    theme: "night",
    variables: {
      colorText: "#ffffff",
      colorTextSecondary: "#cfcfcf",
      colorPrimary: "#ffffff",
      colorBackground: "#000000",
      colorDanger: "#ef4444",
      borderRadius: "16px",
      fontSizeBase: "16px",
    },
    rules: {
      ".Label": {
        color: "#e5e7eb",
        fontWeight: "500",
      },
      ".Input": {
        color: "#ffffff",
        backgroundColor: "#111111",
        border: "1px solid #3f3f46",
      },
      ".Input::placeholder": {
        color: "#9ca3af",
      },
      ".Tab": {
        backgroundColor: "#ffffff",
        color: "#111111",
      },
      ".Tab--selected": {
        backgroundColor: "#ffffff",
        color: "#111111",
      },
      ".Block": {
        backgroundColor: "#000000",
      },
    },
  },
};

    return (
      <Elements stripe={stripePromise} options={options}>
        <Checkout
          cartItems={cartItems}
          onRemoveFromCart={onRemoveFromCart}
          onBack={() => {
            // Back to email step for guests; logged-in users can’t change email here.
            if (userEmail) {
              // If you want logged-in users to be able to change email too, just:
              // setUserEmail("");
              // and setStage("email");
              window.history.back();
            } else {
              setClientSecret(null);
              setStage("email");
            }
          }}
          email={effectiveEmail}
        />
      </Elements>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-sm text-red-400">
        Something went wrong loading the payment form.
      </p>
    </div>
  );
};

export default CheckoutWrapper;
