import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Checkout from "./Checkout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const CheckoutWrapper = () => {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchIntent = async () => {
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
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Failed to load clientSecret:", error);
      }
    };

    fetchIntent();
  }, []);

  if (!clientSecret) {
    return <p className="text-white text-center mt-10">Loading payment form...</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Checkout />
    </Elements>
  );
};

export default CheckoutWrapper;
