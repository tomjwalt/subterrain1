// src/components/HeroBanner.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-black text-white pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[2fr,1.3fr] items-center">
        {/* Left: copy */}
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-4">
            SubTerrain / Drop 01
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-wide mb-4">
            Built for basements, <br className="hidden md:block" />
            car parks & 2 a.m. sessions.
          </h1>

          <p className="text-sm md:text-base text-gray-300 max-w-xl mb-8">
            Technical streetwear for people who train when everyone else has
            gone home. Heavy fabrics, clean geometry, zero noise.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium tracking-wide hover:bg-gray-200 transition"
            >
              Shop the drop
            </button>

            <button
              onClick={() => {
                const section = document.getElementById("featured-products");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-full border border-gray-600 text-sm text-gray-100 hover:border-gray-300 hover:bg-gray-900 transition"
            >
              View featured pieces
            </button>
          </div>
        </div>

        {/* Right: placeholder artwork area */}
        <div className="relative">
          <div className="aspect-[4/5] rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 overflow-hidden">
            {/* Replace this whole inner block with your final artwork later */}
            <div className="w-full h-full flex flex-col items-center justify-between p-6">
              <div className="w-full flex justify-between text-[11px] text-gray-500">
                <span>STN-01</span>
                <span>PERFORMANCE / STUDIO</span>
              </div>

              <div className="text-center">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-3">
                  Visual Placeholder
                </p>
                <p className="text-lg font-medium">
                  Drop artwork goes here.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Swap this block for your finished promo image or video.
                </p>
              </div>

              <div className="w-full flex justify-between text-[10px] text-gray-600">
                <span>SubTerrain / London</span>
                <span>24·7 / 365</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
