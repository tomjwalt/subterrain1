import React from "react";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-zinc-200 overflow-hidden bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left */}
        <div className="p-7 md:p-10 flex flex-col justify-center gap-4">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-zinc-500">
            Subterrain
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold leading-[1.05] tracking-tight">
            The Hardway is The Point.
          </h1>

          <p className="text-sm md:text-[0.95rem] text-zinc-600 max-w-md leading-6">
            Heavy fabrics. Clean silhouettes. Built for everyday wear with a
            tougher edge.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs tracking-[0.18em] uppercase hover:bg-zinc-800 transition"
            >
              View featured
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 rounded-full border border-zinc-300 text-zinc-900 text-xs tracking-[0.18em] uppercase hover:border-zinc-500 transition"
            >
              Shop all
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="h-44 md:h-auto min-h-[180px] bg-zinc-100 border-t md:border-t-0 md:border-l border-zinc-200 flex items-center justify-center">
          <span className="text-[0.7rem] tracking-[0.28em] uppercase text-zinc-500">
            Artwork / campaign image
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;