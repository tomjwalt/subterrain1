import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

const CATEGORY_LABELS = {
  men: "Men's Clothing",
  women: "Women's Clothing",
  accessories: "Accessories",
  outlet: "Outlet",
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const CategoryPage = ({ onAddToCart, onLike }) => {
  const { gender } = useParams(); // e.g. "men", "women"

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);

  // Derive categories available for this gender
  const genderProducts = useMemo(
    () => products.filter((p) => !gender || p.gender === gender),
    [gender]
  );

  const categories = useMemo(() => {
    const cats = [...new Set(genderProducts.map((p) => p.category))];
    return ["All", ...cats];
  }, [genderProducts]);

  const filtered = useMemo(() => {
    let result = genderProducts;

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    result = result.filter((p) => {
      const price = p.price > 100 ? p.price / 100 : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "newest":
        return [...result].filter((p) => p.badge === "New").concat(
          result.filter((p) => p.badge !== "New")
        );
      default:
        return [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [genderProducts, activeCategory, sortBy, priceRange]);

  const pageTitle = CATEGORY_LABELS[gender] || "All Products";
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  const resetFilters = () => {
    setActiveCategory("All");
    setPriceRange([0, 200]);
    setSortBy("featured");
  };

  const hasActiveFilters = activeCategory !== "All" || priceRange[0] > 0 || priceRange[1] < 200;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 pt-10 pb-16">

        {/* Breadcrumb */}
        <p className="text-[0.68rem] tracking-[0.2em] uppercase text-zinc-400 mb-4">
          Home / {pageTitle}
        </p>

        {/* Page title */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide text-zinc-900 mb-8">
          {pageTitle}
        </h1>

        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap mb-6 border-b border-zinc-200 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[0.72rem] tracking-[0.2em] uppercase transition border-b-2 -mb-[1px] ${
                activeCategory === cat
                  ? "border-zinc-900 text-zinc-900 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar: filter toggle + count + sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase text-zinc-600 hover:text-zinc-900 transition"
            >
              <FontAwesomeIcon icon={faSlidersH} />
              {showFilters ? "Hide filters" : "Show filters"}
            </button>

            <span className="text-[0.72rem] tracking-[0.18em] uppercase text-zinc-400">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[0.68rem] tracking-[0.14em] uppercase text-zinc-400 hover:text-zinc-900 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                Reset
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortDropdown((v) => !v)}
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase text-zinc-600 hover:text-zinc-900 transition"
            >
              Sort by {currentSortLabel}
              <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-8 z-20 bg-white border border-zinc-200 rounded-xl shadow-sm w-48 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[0.72rem] tracking-[0.14em] uppercase transition ${
                      sortBy === opt.value
                        ? "text-zinc-900 font-semibold"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-8 p-5 border border-zinc-200 rounded-2xl bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price range */}
              <div>
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-zinc-400 mb-3">
                  Price range
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-900">£{priceRange[0]}</span>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="flex-1 accent-zinc-900"
                  />
                  <span className="text-sm text-zinc-900">£{priceRange[1]}</span>
                </div>
              </div>

              {/* Category quick-select */}
              <div>
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-zinc-400 mb-3">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full border text-[0.68rem] tracking-[0.14em] uppercase transition ${
                        activeCategory === cat
                          ? "border-zinc-900 text-zinc-900 font-semibold"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm tracking-[0.2em] uppercase text-zinc-400">
              No products found
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[0.72rem] tracking-[0.18em] uppercase text-zinc-900 underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;