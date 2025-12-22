// src/components/Homepage.jsx
import React from "react";
import HeroBanner from "./HeroBanner";
import FeaturedProductsSection from "./FeaturedProductsSection";

const Homepage = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <main>
        <HeroBanner />
        <FeaturedProductsSection variant="compact" showSubNav={false} />
      </main>
    </div>
  );
};

export default Homepage;
