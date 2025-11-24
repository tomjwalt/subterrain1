import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) setMessage(error.message);
    setLoading(false);
  };

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

        {message && (
          <p className="mt-4 text-red-400 text-center">{message}</p>
        )}
      </form>
    </div>
  );
};

export default Checkout;
