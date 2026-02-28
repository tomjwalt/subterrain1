// src/components/HeroBanner.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: copy */}
        <div className="p-6 md:p-8 flex flex-col justify-center gap-3 bg-black">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-zinc-500">
            Subterrain
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            The Hardway is The Point.
          </h1>

          <p className="text-sm text-zinc-400 max-w-md">
            Hevay fabrics keeping you dry and looking <br /> really gay when youre running
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate("/product/tee-1")}
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition"
            >
              View featured
            </button>
          </div>
        </div>

        {/* Right: artwork strip – full width but short */}
        <div className="h-40 md:h-48 w-full bg-[radial-gradient(circle_at_top,_#27272a,_#020617)]">
          <div className="h-full w-full flex items-center justify-center text-[0.7rem] tracking-[0.25em] uppercase text-zinc-500">
            Artwork / campaign image
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
