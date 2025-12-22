// src/components/ProductSubNav.jsx
import React from "react";

const tabs = ["All", "T-Shirts", "Hoodies", "Shorts", "Accessories"];

const ProductSubNav = ({ activeTab, onChangeTab }) => {
  return (
    <div className="w-full border-b border-gray-900/70 bg-black/80 backdrop-blur sticky top-16 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gray-500">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>Subterrain Studio</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500">
            <span className="uppercase tracking-[0.16em]">Filter</span>
            <div className="w-1 h-4 bg-gray-700" />
            <span className="text-gray-400/80">Clothing</span>
          </div>
        </div>

        <div className="flex gap-2 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onChangeTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition
                ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "border-gray-700 text-gray-300 hover:border-gray-400 hover:bg-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductSubNav;
