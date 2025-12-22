// src/components/FeaturedProductsSection.jsx
import React, { useMemo, useState } from "react";
import ProductSubNav from "./ProductSubNav";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

const FeaturedProductsSection = ({
  variant = "compact",      // "compact" for homepage, "full" for /shop later
  showSubNav = false,       // no tabs on homepage by default
}) => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredProducts = useMemo(() => {
    let base = products;

    if (variant === "compact") {
      // Only featured on homepage
      base = base.filter((p) => p.featured);
      return base.slice(0, 3); // show top 3
    }

    // Full mode – category tabs etc
    if (activeTab === "Featured") {
      return base.filter((p) => p.featured);
    }
    if (activeTab === "All") return base;
    return base.filter((p) => p.category === activeTab);
  }, [variant, activeTab]);

  return (
    <section
      id="featured-products"
      className={`bg-black text-white px-4 ${
        variant === "compact" ? "mt-12 mb-16" : "py-16"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-2">
              Featured pieces
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-wide">
              Essentials for the underground.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              // if you add a /shop page later, point this there
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="hidden sm:inline-flex text-xs px-4 py-2 rounded-full border border-gray-600 hover:border-gray-300 hover:bg-gray-900 transition"
          >
            View all products
          </button>
        </div>

        {showSubNav && (
          <div className="mb-6">
            <ProductSubNav activeTab={activeTab} onChange={setActiveTab} />
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
