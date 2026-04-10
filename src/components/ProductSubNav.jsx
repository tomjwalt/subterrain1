// src/components/ProductSubNav.jsx
import React from "react";

const TABS = ["All", "T-Shirts", "Hoodies", "Shorts", "New Arrivals"];

const ProductSubNav = ({ activeTab, onChangeTab }) => {
  return (
    <div className="w-full">
      {/* Top row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.68rem] tracking-[0.34em] uppercase text-zinc-500">
            Categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChangeTab("All")}
          className="text-[0.68rem] tracking-[0.28em] uppercase text-zinc-500 hover:text-zinc-900 transition"
        >
          View all
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3">
        <div className="flex items-center gap-6 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onChangeTab(tab)}
                className={[
                  "relative whitespace-nowrap",
                  "text-[0.72rem] tracking-[0.22em] uppercase",
                  "transition",
                  isActive
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900",
                ].join(" ")}
              >
                {tab}

                {/* underline */}
                <span
                  className={[
                    "absolute left-0 right-0 -bottom-[9px] h-[2px]",
                    "transition",
                    isActive ? "bg-zinc-900" : "bg-transparent",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        {/* Optional little helper line (very Montirex-ish spacing) */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[0.72rem] text-zinc-500">
            Showing: <span className="text-zinc-900">{activeTab}</span>
          </p>

          <button
            type="button"
            onClick={() => onChangeTab("All")}
            className="text-[0.72rem] text-zinc-500 hover:text-zinc-900 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSubNav;