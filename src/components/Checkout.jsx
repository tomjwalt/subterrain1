import React, { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch client secret from backend
    fetch("http://localhost:4242/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1999, currency: "usd" }), // Example: $19.99
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
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

    if (error) setMessage(error.message);
    setLoading(false);
  };

  if (!clientSecret) return <p className="text-white">Loading payment form...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <h1 className="text-3xl mb-6 font-semibold">Checkout</h1>

      <form onSubmit={handleSubmit} className="bg-[#121212] p-8 rounded-2xl shadow-lg w-[400px]">
        <PaymentElement />
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
