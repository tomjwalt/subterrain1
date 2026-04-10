import React, { useState } from "react";
import HeroBanner from "./HeroBanner";
import ProductSubNav from "./ProductSubNav";
import FeaturedProductsSection from "./FeaturedProductsSection";

const Homepage = ({ onAddToCart, onLike }) => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="bg-white min-h-screen text-zinc-900 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 space-y-8">
        {/* Sub-nav directly under the navbar */}
        <div className="border-b border-zinc-200 pb-4 pt-3">
          <ProductSubNav activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        {/* Hero section */}
        <HeroBanner />

        {/* Featured products */}
        <FeaturedProductsSection
          activeTab={activeTab}
          onAddToCart={onAddToCart}
          onLike={onLike}
        />
      </div>
    </div>
  );
};

export default Homepage;