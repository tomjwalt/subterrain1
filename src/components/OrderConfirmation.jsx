import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const succeeded = redirectStatus === "succeeded";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <div className="text-5xl mb-6">{succeeded ? "🎉" : "⚠️"}</div>

        <h1 className="text-2xl font-semibold tracking-wide text-zinc-900 mb-2">
          {succeeded ? "Order Confirmed" : "Payment Unsuccessful"}
        </h1>

        <p className="text-sm text-zinc-500 tracking-wide mb-8">
          {succeeded
            ? "Thank you for your purchase. You'll receive a confirmation email shortly."
            : "Something went wrong with your payment. Please try again."}
        </p>

        {paymentIntentId && (
          <div className="border border-zinc-200 rounded-2xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-[0.68rem] uppercase tracking-[0.2em] text-zinc-400">Status</span>
              <span className={`text-sm font-semibold ${succeeded ? "text-green-600" : "text-red-500"}`}>
                {succeeded ? "Succeeded" : redirectStatus ?? "Unknown"}
              </span>
            </div>
            <div className="border-t border-zinc-100" />
            <div className="flex justify-between items-center">
              <span className="text-[0.68rem] uppercase tracking-[0.2em] text-zinc-400">Order ID</span>
              <span className="text-xs text-zinc-600 font-mono">{paymentIntentId}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-full border border-zinc-900 text-zinc-900 text-sm font-semibold tracking-wide hover:bg-zinc-900 hover:text-white transition"
          >
            Continue Shopping
          </button>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="w-full py-3 rounded-full border border-zinc-200 text-zinc-500 text-sm font-semibold tracking-wide hover:border-zinc-400 hover:text-zinc-900 transition"
          >
            View Orders
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;