import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentRequestButtonElement,
  CardElement,
} from "@stripe/react-stripe-js";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [totalAmount, setTotalAmount] = useState(2499);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [street, setStreet] = useState("");
  const [postCode, setPostCode] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: {
        label: "Total",
        amount: totalAmount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, totalAmount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Add your payment handling logic here
  };

  return (
    <div className="p-6 text-white">
      <h2>Checkout Page</h2>
      <h3>Total: £{totalAmount / 100}</h3>
      {paymentRequest && (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      )}

      {/* Name fields */}
      <div className="flex flex-col mb-4 justify-center items-center">
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="First Name*"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Middle Name(s)"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Last Name*"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      {/* Billing address */}
      <div className="flex flex-col items-center justify-center">
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Building Number/Name*"
          value={buildingNumber}
          onChange={(e) => setBuildingNumber(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Street*"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Postal Code*"
          value={postCode}
          onChange={(e) => setPostCode(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="City*"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="County*"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-50 p-2 rounded-lg mt-4 bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500"
          placeholder="Country*"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
      </div>

      {/* Stripe card fields */}
      <form className="flex flex-col items-center justify-center mt-5 text-white" onSubmit={handleSubmit}>
        <CardElement className="w-50 p-2 rounded-lg border border-gray-700" />
        <button className="text-white cursor-pointer w-80 p-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-white focus:outline-none focus:border-gray-500 mb-6" type="submit">Pay</button>
      </form>
    </div>
  );
};

export default Checkout;