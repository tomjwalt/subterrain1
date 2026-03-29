// src/components/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../supabaseClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTION_BASE =
  SUPABASE_URL?.replace(".supabase.co", ".functions.supabase.co") || "";
const CREATE_PI_URL = `${FUNCTION_BASE}/create-payment-intent`;

const CheckoutPaymentForm = ({
  email,
  clientSecret,
  onBackToDelivery,
  subtotalPence,
  message,
  setMessage,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Payment form is still loading. Please wait a moment.");
      return;
    }

    if (!subtotalPence) {
      setMessage("Your basket is empty.");
      return;
    }

    setSubmitting(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error("Stripe elements.submit error:", submitError);
      setMessage(submitError.message || "Please check your payment details.");
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        receipt_email: email,
      },
    });

    if (error) {
      console.error("Stripe confirmPayment error:", error);
      setMessage(error.message || "Payment failed. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-zinc-800 rounded-2xl p-4 md:p-5 bg-black/30 min-h-[220px]">
        {!paymentReady && (
          <p className="text-xs text-zinc-500 mb-4">Loading payment fields…</p>
        )}

        <PaymentElement
          id="payment-element"
          options={{ layout: "tabs" }}
          onReady={() => setPaymentReady(true)}
          onError={(err) => {
            console.error("PaymentElement error:", err);
            setMessage(
              err.message || "Failed to load the payment form. Please refresh."
            );
            setPaymentReady(false);
          }}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBackToDelivery}
          className="flex-1 py-3 rounded-2xl font-semibold text-base border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition cursor-pointer"
        >
          Back to delivery
        </button>

        <button
          type="submit"
          disabled={submitting || !stripe || !elements}
          className={`flex-1 py-3 rounded-2xl font-semibold text-base transition ${
            submitting || !stripe || !elements
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-zinc-900 text-white border border-zinc-500 hover:bg-zinc-800 cursor-pointer"
          }`}
        >
          {submitting ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {message ? <p className="text-sm text-red-400 text-center">{message}</p> : null}
    </form>
  );
};

const Checkout = ({ onBack, cartItems = [], onRemoveFromCart, email, user }) => {
  const [message, setMessage] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  const [step, setStep] = useState("delivery");
  const [clientSecret, setClientSecret] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const [delivery, setDelivery] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    house_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom",
  });

  const subtotalPence = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const subtotalDisplay = (subtotalPence / 100).toFixed(2);

  useEffect(() => {
    const loadProfileAddress = async () => {
      if (!user) {
        setLoadingAddress(false);
        return;
      }

      setLoadingAddress(true);

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            `
            first_name,
            last_name,
            phone_number,
            house_number,
            street,
            city,
            state,
            postal_code,
            country
          `
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) console.error("Error loading profile address:", error);

        if (profile) {
          setDelivery((prev) => ({
            ...prev,
            first_name: profile.first_name ?? "",
            last_name: profile.last_name ?? "",
            phone_number: profile.phone_number ?? "",
            house_number: profile.house_number ?? "",
            street: profile.street ?? "",
            city: profile.city ?? "",
            state: profile.state ?? "",
            postal_code: profile.postal_code ?? "",
            country: profile.country ?? "United Kingdom",
          }));
        }
      } catch (err) {
        console.error("Unexpected address load error:", err);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadProfileAddress();
  }, [user]);

  const handleDeliveryChange = (field, value) => {
    setDelivery((prev) => ({ ...prev, [field]: value }));
  };

  const validateDelivery = () => {
    if (!delivery.first_name.trim()) return "Please enter your first name.";
    if (!delivery.last_name.trim()) return "Please enter your last name.";
    if (!delivery.house_number.trim())
      return "Please enter your house name or number.";
    if (!delivery.street.trim()) return "Please enter your street.";
    if (!delivery.city.trim()) return "Please enter your city.";
    if (!delivery.postal_code.trim()) return "Please enter your postcode.";
    if (!delivery.country.trim()) return "Please enter your country.";
    return "";
  };

  const handleContinueToPayment = async () => {
    setMessage("");

    const validationError = validateDelivery();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSavingAddress(true);

    try {
      // 1) Save delivery details into profile for logged-in users
      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          first_name: delivery.first_name,
          last_name: delivery.last_name,
          phone_number: delivery.phone_number || null,
          house_number: delivery.house_number,
          street: delivery.street,
          city: delivery.city,
          state: delivery.state || null,
          postal_code: delivery.postal_code,
          country: delivery.country,
        });

        if (profileError) {
          console.error("Error saving delivery details to profile:", profileError);
          setMessage("Failed to save delivery details.");
          setSavingAddress(false);
          return;
        }
      }

      // 2) Create order row first
      const deliveryDetails = {
        first_name: delivery.first_name,
        last_name: delivery.last_name,
        phone_number: delivery.phone_number || "",
        house_number: delivery.house_number,
        street: delivery.street,
        city: delivery.city,
        state: delivery.state || "",
        postal_code: delivery.postal_code,
        country: delivery.country,
      };

      // ✅ IMPORTANT: include colour inside items so webhook/admin email can show it
      const itemsPayload = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size ?? null,
        colour: item.colour ?? "", // ✅ add colour here
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          email,
          status: "pending_payment",
          total_amount: subtotalPence,
          currency: "gbp",
          items: itemsPayload,
          delivery_details: deliveryDetails,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        console.error("Order creation error:", orderError);
        setMessage("Failed to create order. Please try again.");
        setSavingAddress(false);
        return;
      }

      setCurrentOrderId(order.id);

      // 3) Create PaymentIntent using hosted function
      const res = await fetch(CREATE_PI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotalPence,
          currency: "gbp",
          email,
          orderId: order.id,
          userId: user?.id ?? null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.clientSecret) {
        console.error("Payment intent error:", data);
        setMessage(data.error || "Failed to start payment.");
        setSavingAddress(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err) {
      console.error("Checkout continue error:", err);
      setMessage("Something went wrong starting payment.");
    } finally {
      setSavingAddress(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-sm text-center">
          <p className="mb-3">Your basket is empty.</p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              ← Go back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
          >
            ← Go Back
          </button>
        )}

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-wide">Checkout</h1>
          <p className="mt-1 text-sm text-zinc-500">Secure payment for your order</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <span className={step === "delivery" ? "text-white" : ""}>Delivery</span>
          <span>•</span>
          <span className={step === "payment" ? "text-white" : ""}>Payment</span>
        </div>

        {/* Order summary */}
        <div className="border border-zinc-800 rounded-2xl p-4 md:p-5 bg-black/30">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-zinc-500 mb-4">
            Order Summary
          </p>

          <div className="space-y-3">
            {cartItems.map((item) => {
              const qty = item.quantity || 1;
              const lineTotalPence = (item.price || 0) * qty;
              const lineTotalDisplay = (lineTotalPence / 100).toFixed(2);

              const sizeText =
                typeof item.size === "string" && item.size.trim()
                  ? item.size
                  : item.size?.label
                  ? item.size.label
                  : "";

              const colourText =
                typeof item.colour === "string" && item.colour.trim()
                  ? item.colour
                  : "";

              return (
                <div
                  key={`${item.id}-${sizeText}-${colourText}`}
                  className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-base leading-tight">{item.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {sizeText ? `Size ${sizeText}` : "Size"} ·{" "}
                      {colourText ? `Colour ${colourText}` : "Colour"} · Qty {qty}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium">£{lineTotalDisplay}</span>
                    {onRemoveFromCart && (
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition cursor-pointer"
                        title="Remove from basket"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-zinc-800 mt-4 pt-4 flex items-center justify-between text-sm">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">
              £{subtotalDisplay}{" "}
              <span className="text-zinc-400 font-normal">(shipping free)</span>
            </span>
          </div>
        </div>

        {/* Delivery step */}
        {step === "delivery" && (
          <div className="border border-zinc-800 rounded-2xl p-4 md:p-5 bg-black/30 space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-zinc-500">
              Delivery Details
            </p>

            {loadingAddress ? (
              <p className="text-sm text-zinc-500">Loading saved details…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={delivery.first_name}
                    onChange={(e) => handleDeliveryChange("first_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={delivery.last_name}
                    onChange={(e) => handleDeliveryChange("last_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <input
                  type="tel"
                  placeholder="Phone number"
                  value={delivery.phone_number}
                  onChange={(e) => handleDeliveryChange("phone_number", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="House name / number"
                    value={delivery.house_number}
                    onChange={(e) => handleDeliveryChange("house_number", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="Street"
                    value={delivery.street}
                    onChange={(e) => handleDeliveryChange("street", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={delivery.city}
                    onChange={(e) => handleDeliveryChange("city", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="County / State"
                    value={delivery.state}
                    onChange={(e) => handleDeliveryChange("state", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={delivery.postal_code}
                    onChange={(e) => handleDeliveryChange("postal_code", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={delivery.country}
                    onChange={(e) => handleDeliveryChange("country", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={savingAddress}
                  className={`w-full py-3 rounded-2xl font-semibold text-base transition ${
                    savingAddress
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-zinc-900 text-white border border-zinc-500 hover:bg-zinc-800 cursor-pointer"
                  }`}
                >
                  {savingAddress ? "Saving details..." : "Continue to payment"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Payment step */}
        {step === "payment" && clientSecret && (
          <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutPaymentForm
              email={email}
              clientSecret={clientSecret}
              subtotalPence={subtotalPence}
              message={message}
              setMessage={setMessage}
              onBackToDelivery={() => setStep("delivery")}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Checkout;