// src/components/Checkout.jsx
import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:54321/functions/v1/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 2499, currency: "gbp" }),
          }
        );

        const data = await res.json();
        console.log("🔹 Supabase response:", data);

        if (!res.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret returned from server");
        }
      } catch (err) {
        console.error("❌ Checkout error:", err);
        setMessage("Failed to load payment form. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  if (loading) {
    return <p className="text-white text-center mt-10">Loading payment form...</p>;
  }

  if (!clientSecret) {
    return <p className="text-red-400 text-center mt-10">{message}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#121212] p-8 rounded-2xl shadow-lg w-[400px]"
      >
        <PaymentElement id="payment-element" />
        <button
          disabled={!stripe || loading}
          className={`mt-6 w-full py-2 rounded-lg transition-all ${
            loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && <p className="mt-4 text-red-400 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default Checkout;
