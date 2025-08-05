import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: {
        label: "Total",
        amount: 2499, // price in pence (e.g. £24.99)
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe]);

  return (
    <div className="p-6">
      {paymentRequest ? (
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
        /> ) : null}
    </div>
  );
};

export default Checkout;
