// src/components/CheckoutWrapper.jsx
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import Checkout from "./Checkout";
import { supabase } from "../../supabaseClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

// ✅ hosted function base (prod)
const FUNCTION_URL =
  "https://nyebwdvhkgiumqswbrfb.functions.supabase.co/create-payment-intent";

const CheckoutWrapper = ({ cartItems = [], onRemoveFromCart }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [step, setStep] = useState("decide"); // decide | guest-email | checkout
  const [errorMsg, setErrorMsg] = useState("");

  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loadingPI, setLoadingPI] = useState(false);

  // 1) Check auth
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setEmail(data.user.email || "");
        setStep("checkout");
      }
      setAuthChecked(true);
    };
    checkUser();
  }, []);

  // helper: subtotal in pence
  const subtotalPence = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // 2) Create order row + PaymentIntent
  const startHostedCheckout = async () => {
    setErrorMsg("");
    setLoadingPI(true);

    try {
      const trimmedEmail = (email || "").trim();
      if (!trimmedEmail) throw new Error("Missing email address.");
      if (!subtotalPence) throw new Error("Your basket is empty.");

      // A) create order row first
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          email: trimmedEmail,
          currency: "gbp",
          total_amount: subtotalPence,
          status: "pending_payment",
          items: cartItems, // make sure your column type supports json
        })
        .select("id")
        .single();

      if (orderErr) throw orderErr;

      setOrderId(order.id);

      // B) call hosted function with that orderId
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotalPence,
          currency: "gbp",
          email: trimmedEmail,
          orderId: order.id,
          userId: user?.id ?? null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.error || "Failed to create payment intent");
      if (!json.clientSecret) throw new Error("No clientSecret returned");

      setClientSecret(json.clientSecret);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Checkout failed to start.");
    } finally {
      setLoadingPI(false);
    }
  };

  // auto-start for logged in users once we're on checkout step
  useEffect(() => {
    if (step !== "checkout") return;
    if (!authChecked) return;
    if (!email?.trim()) return;
    if (clientSecret) return;
    if (loadingPI) return;

    // only auto-start if user exists (optional)
    if (user) startHostedCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, authChecked, user, email]);

  if (!authChecked) {
    return <p className="text-white text-center mt-10">Loading checkout...</p>;
  }

  // decide step (not logged in)
  if (!user && step === "decide") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900">
        <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

        <div className="bg-white p-8 rounded-2xl shadow-lg w-[420px] space-y-5">
          <p className="text-sm text-zinc-900">Choose how you’d like to continue:</p>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-2 rounded-lg font-medium bg-white text-zinc-900 hover:bg-white transition-all"
          >
            Sign in or create an account
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white" />
            <span className="text-xs text-zinc-900">or</span>
            <div className="flex-1 h-px bg-white" />
          </div>

          <button
            onClick={() => setStep("guest-email")}
            className="w-full py-2 rounded-lg font-medium bg-white hover:bg-white transition-all"
          >
            Continue as guest
          </button>
        </div>
      </div>
    );
  }

  // guest email step
  if (!user && step === "guest-email") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900">
        <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

        <div className="bg-white p-8 rounded-2xl shadow-lg w-[420px]">
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setStep("decide");
            }}
            className="mb-4 text-sm text-zinc-900 hover:text-zinc-800"
          >
            ← Back
          </button>

          <label className="block mb-2 text-sm font-medium">Email address (guest)</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-700 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errorMsg && <p className="mt-3 text-sm text-red-400 text-center">{errorMsg}</p>}

          <button
            onClick={() => {
              if (!email.trim()) return setErrorMsg("Please enter an email address.");
              setErrorMsg("");
              setStep("checkout");
              // guest flow: start checkout when they proceed
              setTimeout(() => startHostedCheckout(), 0);
            }}
            className="mt-6 w-full py-2 rounded-lg font-medium bg-white hover:bg-white transition-all"
          >
            Continue to checkout
          </button>
        </div>
      </div>
    );
  }

  // checkout step (needs clientSecret)
  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-zinc-800 rounded-2xl p-6 text-sm text-center">
          <p className="mb-3">
            {loadingPI ? "Starting checkout…" : "Preparing payment…"}
          </p>
          {errorMsg && <p className="text-red-400">{errorMsg}</p>}
          {!loadingPI && (
            <button
              onClick={startHostedCheckout}
              className="mt-4 w-full py-2 rounded-lg bg-white border border-zinc-600 hover:border-zinc-300 cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Checkout
        email={email}
        user={user}
        cartItems={cartItems}
        onRemoveFromCart={onRemoveFromCart}
        orderId={orderId}
        onBack={() => navigate("/")}
      />
    </Elements>
  );
};

export default CheckoutWrapper;