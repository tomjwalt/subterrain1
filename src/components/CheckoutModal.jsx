// src/components/CheckoutModal.jsx
import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const CheckoutModal = ({
  onClose,
  onGoToCheckout,
  cartItems = [],
  shippingCost = 0,
}) => {
  const { subtotal, totalItems } = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;

    cartItems.forEach((item) => {
      const qty = item.quantity ?? 1;
      const price = item.price ?? 0;
      subtotal += price * qty;
      totalItems += qty;
    });

    return { subtotal, totalItems };
  }, [cartItems]);

  const total = subtotal + shippingCost;

  return (
    <div className="bg-[#111] text-white rounded-2xl shadow-2xl w-[360px] max-w-[90vw] relative p-6 border border-gray-800">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <h2 className="text-lg font-semibold text-center mb-3">Your Basket</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-400 py-6 text-sm">
          Your basket is currently empty.
        </p>
      ) : (
        <>
          {/* Items */}
          <div className="max-h-56 overflow-y-auto pr-1 mb-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {item.name ?? "Product"}
                  </span>
                  {item.size && (
                    <span className="text-xs text-gray-500">
                      Size: {item.size}
                    </span>
                  )}
                  {item.colour && (
                    <span className="text-xs text-gray-500">
                      Colour: {item.colour}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    £{(item.price ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Qty: {item.quantity ?? 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-800 pt-3 text-sm space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Items ({totalItems})</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipping</span>
              <span>
                {shippingCost > 0 ? `£${shippingCost.toFixed(2)}` : "Free"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons – stacked vertically, same styling */}
          <div className="flex flex-col gap-2 mt-2 w-full">
            <button
              onClick={onClose}
              className="w-full py-2 cursor-pointer rounded-lg border border-gray-600 text-gray-200 hover:border-white hover:text-white text-sm transition"
            >
              Continue shopping
            </button>

            <button
              onClick={onGoToCheckout}
              className="w-full py-2 cursor-pointer rounded-lg border border-gray-600 text-gray-200 hover:border-white hover:text-white text-sm transition"
            >
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutModal;
