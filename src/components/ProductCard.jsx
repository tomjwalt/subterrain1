// src/components/ProductCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const formatMoney = (amount, currency = "GBP") => {
  if (amount == null) return "-";
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return amount;

  const inUnits = numeric / 100; // pence -> pounds
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(inUnits);
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 🔧 later: hook this to your product detail route
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="group bg-[#0b0b0b] border border-gray-800 rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:border-gray-500 transition"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-[#151515] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 tracking-wide">
            IMAGE COMING SOON
          </div>
        )}

        {product.badge && (
          <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/10 border border-white/30 backdrop-blur">
            {product.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-3 gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">
              {product.category}
            </p>
            <h3 className="text-sm font-medium leading-snug line-clamp-2">
              {product.name}
            </h3>
          </div>
          <div className="text-right whitespace-nowrap text-sm font-semibold">
            {formatMoney(product.price, "GBP")}
          </div>
        </div>

        {product.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px]">
          <button
            type="button"
            className="px-3 py-1 rounded-full border border-gray-700 group-hover:border-gray-300 group-hover:bg-gray-900 transition"
          >
            View details
          </button>
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              // 🔧 this is where you’ll call your Supabase "like" insert later
              console.log("TODO: like product", product.id);
            }}
          >
            ♡ Like
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
