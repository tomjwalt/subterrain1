// src/components/ProductCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faCartShopping } from "@fortawesome/free-solid-svg-icons";

const ProductCard = ({ product, onAddToCart, onLike }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product, {
        size: "M",
        colour: "Black / Reflective",
        quantity: 1,
      });
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();

    if (onLike) {
      onLike(product);
    }
  };

  return (
    <article
      className="group bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-zinc-500 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200 flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      {/* Image area */}
      <div className="relative h-64 w-full rounded-t-3xl overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_rgba(24,24,27,1)_45%,_rgba(0,0,0,1)_100%)] flex items-center justify-center px-4">
        <span className="text-[0.72rem] text-zinc-500 tracking-[0.28em] uppercase">
          Product image
        </span>

        {product.badge && (
          <span className="absolute top-4 right-4 text-[0.65rem] uppercase tracking-[0.18em] px-3 py-1 rounded-full border border-zinc-600 bg-black/40 text-zinc-200 backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pb-8 flex flex-col gap-5">
        {/* Meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-zinc-500">
              {product.category}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-wide text-white leading-tight">
              {product.name}
            </h3>
          </div>

          <span className="text-2xl font-semibold text-white shrink-0 pt-1">
            £{(product.price / 100).toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p className="text-base text-zinc-400 leading-8 min-h-[64px]">
          {product.description}
        </p>

        {/* Actions */}
        <div className="pt-6 mt-auto px-1 pb-1 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleAddToCart}
            className="cursor-pointer inline-flex h-11 min-w-[148px] items-center justify-center gap-2 px-5 rounded-full border border-zinc-600 bg-transparent text-zinc-100 text-sm font-semibold leading-none hover:border-white hover:text-white transition"
          >
            <FontAwesomeIcon icon={faCartShopping} className="text-xs" />
            <span>Add to cart</span>
          </button>

          <button
            type="button"
            onClick={handleLike}
            className="cursor-pointer inline-flex h-11 min-w-[148px] items-center justify-center gap-2 px-5 rounded-full border border-zinc-600 bg-transparent text-zinc-100 text-sm font-semibold leading-none hover:border-white hover:text-white transition"
          >
            <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />
            <span>Like</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;