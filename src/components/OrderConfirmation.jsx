import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const clientSecret = searchParams.get("payment_intent_client_secret");
  const paymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    if (!clientSecret) return;

    const fetchIntent = async () => {
      try {
        const res = await fetch(
          `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SK}`, // ⚠️ in production move to server
            },
          }
        );

        const data = await res.json();
        setPaymentIntent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [clientSecret, paymentIntentId]);

  if (loading) return <p className="text-white text-center mt-10">Loading order…</p>;

  return (
    <div className="text-white flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold">Order Confirmed 🎉</h1>
      <p className="mt-4 text-gray-300">Thank you for your purchase!</p>

      {paymentIntent && (
        <div className="mt-8 bg-[#121212] p-6 rounded-xl shadow-lg w-[400px]">
          <p><strong>Status:</strong> {paymentIntent.status}</p>
          <p><strong>Order ID:</strong> {paymentIntent.id}</p>
          <p><strong>Amount:</strong> £{paymentIntent.amount_received / 100}</p>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
