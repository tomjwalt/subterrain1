// src/components/Checkout.jsx
import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const Checkout = ({ onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!stripe || !elements) return;

    setSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) {
      setMessage(error.message || "Payment failed. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <div className="w-[400px]">
        {/* “Back” just returns to the email/guest step, not out of checkout entirely */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 text-sm text-gray-300 hover:text-white"
          >
            ← Change email / go back
          </button>
        )}

        <h1 className="text-3xl mb-6 font-semibold text-center">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#121212] p-8 rounded-2xl shadow-lg w-full"
        >
          <PaymentElement id="payment-element" />

          <button
            disabled={!stripe || submitting}
            className={`mt-6 w-full py-2 rounded-lg font-medium transition-all ${
              submitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Processing..." : "Pay Now"}
          </button>

          {message && (
            <p className="mt-4 text-red-400 text-center text-sm">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;
