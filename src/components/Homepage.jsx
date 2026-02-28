import React, { useState } from "react";
import HeroBanner from "./HeroBanner";
import ProductSubNav from "./ProductSubNav";
import FeaturedProductsSection from "./FeaturedProductsSection";

const Homepage = ({ onAddToCart, onLike }) => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 space-y-6">
        {/* Sub-nav directly under the navbar */}
        <div className="border-b border-zinc-900 pb-3 mt-2">
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