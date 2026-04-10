// src/components/FeaturedProductsSection.jsx
import React, { useMemo } from "react";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

const FeaturedProductsSection = ({
  activeTab = "All",
  onAddToCart,
  onLike,
}) => {
  const filteredProducts = useMemo(() => {
    let base = products.filter((p) => p.featured);

    if (activeTab === "All") return base;
    return base.filter((p) => p.category === activeTab);
  }, [activeTab]);

  return (
    <section className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-900">
            Featured
          </p>
          <h2 className="text-xl font-semibold tracking-wide text-zinc-900">
            Essentials for the underground.
          </h2>
        </div>

        <button
          type="button"
          className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-900 hover:text-white border border-zinc-200 hover:border-zinc-400 rounded-full px-3 py-1 transition"
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onLike={onLike}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;