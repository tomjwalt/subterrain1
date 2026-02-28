// src/components/ProductSubNav.jsx
import React from "react";

const TABS = ["All", "T-Shirts", "Hoodies", "Shorts", "New Arrivals"];

const ProductSubNav = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="flex items-center gap-3 text-s">
      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
        Categories
      </span>

      <div className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-1">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeTab(tab)}
              className={`px-3 py-1 rounded-full text-[0.7rem] transition ${
                isActive
                  ? "bg-white text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ProductSubNav;
