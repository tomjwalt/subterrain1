// src/components/CheckoutModal.jsx
import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const CheckoutModal = ({
  cartItems = [],
  shippingCost = 0,
  onClose,
  onGoToCheckout,
  onRemoveFromCart,
}) => {
  const hasItems = cartItems.length > 0;

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const total = subtotal + shippingCost;

  return (
    <div className="w-80 bg-[#111] text-white rounded-2xl shadow-lg border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold">Your Basket</h2>
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 max-h-80 overflow-y-auto text-sm">
        {!hasItems ? (
          <p className="text-zinc-400">Your basket is currently empty.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-xs">{item.name}</p>
                    {item.size && (
                      <p className="text-[0.7rem] text-zinc-400">
                        Size M · Qty {item.quantity || 1}
                      </p>
                    )}
                    <p className="text-[0.7rem] text-zinc-500">
                      £{(item.price || 0).toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveFromCart && onRemoveFromCart(item.id)
                    }
                    className="text-[0.75rem] text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="border-t border-zinc-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `£${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <button
          disabled={!hasItems}
          onClick={onGoToCheckout}
          className={`w-full py-2 rounded-lg text-xs font-medium uppercase tracking-[0.18em] ${
            hasItems
              ? "bg-white text-gray hover:bg-zinc-200"
              : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
          }`}
        >
          Go to checkout
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;
