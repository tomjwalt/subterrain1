import React, { useMemo, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const Checkout = ({ onBack, cartItems = [], onRemoveFromCart, email }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);

  // prices are in pence
  const subtotalPence = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const subtotalDisplay = (subtotalPence / 100).toFixed(2);

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

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-sm text-center">
          <p className="mb-3">Your basket is empty.</p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-zinc-400 hover:text-white"
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
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            ← Go Back
          </button>
        )}

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-wide">Checkout</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Secure payment for your order
          </p>
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

              let sizeLabel = "Size";
              if (typeof item.size === "string" && item.size.trim()) {
                sizeLabel = `Size ${item.size}`;
              } else if (item.size?.label) {
                sizeLabel = `Size ${item.size.label}`;
              }

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-base leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {sizeLabel} · Qty {qty}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium">
                      £{lineTotalDisplay}
                    </span>
                    {onRemoveFromCart && (
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition"
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

        {/* Payment section */}
        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="border border-zinc-800 rounded-2xl p-4 md:p-5 bg-black/30 min-h-[220px]">
            {!paymentReady && (
              <p className="text-xs text-zinc-500 mb-4">
                Loading payment fields…
              </p>
            )}

            <PaymentElement
              id="payment-element"
              options={{ layout: "tabs" }}
              onReady={() => {
                console.log("✅ PaymentElement ready");
                setPaymentReady(true);
              }}
              onError={(err) => {
                console.error("PaymentElement error:", err);
                setMessage(
                  err.message ||
                    "Failed to load the payment form. Please refresh."
                );
                setPaymentReady(false);
              }}
            />
          </div>
          <div
  style={{
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(63, 63, 70, 0.9)",
  }}
>
  <button
    type="submit"
    disabled={submitting || !stripe || !elements}
    className={`w-full py-3 rounded-2xl font-semibold text-base transition ${
      submitting || !stripe || !elements
        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
        : "bg-zinc-900 text-white border border-zinc-500 hover:bg-zinc-800 cursor-pointer"
    }`}
  >
    {submitting ? "Processing..." : "Pay Now"}
  </button>
</div>
          

          {message && (
            <p className="text-sm text-red-400 text-center">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;