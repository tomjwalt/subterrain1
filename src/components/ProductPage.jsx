import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/products";

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <p className="text-xl mb-4">Product not found.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition"
        >
          Back to homepage
        </button>
      </div>
    );
  }

  const {
    name,
    price,         
    description,
    imageUrl,   
    badge,
    category,
    sizes,
    colours,
  } = product;

  const displayImage = imageUrl || null;
  const displayPrice = price != null ? (price / 100).toFixed(2) : "24.99";

  const handleAddToCart = () => {
    console.log("Add to cart:", {
      id: product.id,
      size: selectedSize,
      quantity,
    });
  };

  const handleBuyNow = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <button
          className="mb-6 text-xs text-gray-400 hover:text-gray-200"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* LEFT: IMAGE */}
          <div>
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">
                  Product image placeholder
                </span>
              )}
            </div>

            {/* Small details under image */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] mb-1">
                  Category
                </p>
                <p>{category || "Apparel"}</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] mb-1">
                  Tag
                </p>
                <p>{badge || "Drop 01"}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="space-y-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                SubTerrain • Drop 01
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide mb-2">
                {name || "SubTerrain Product"}
              </h1>
              <p className="text-xl font-semibold mt-2">£{displayPrice}</p>
            </div>

            <div className="text-sm text-gray-300 space-y-2">
              <p>
                {description ||
                  "Built for late-night sessions and heavy sets. Soft-touch fabric with subtle reflective detailing so it still hits under streetlights."}
              </p>
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
                <li>Moisture-wicking, quick-dry finish</li>
                <li>No-itch neck print, minimal branding</li>
                <li>Designed in the UK</li>
              </ul>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Colours */}
              {colours && colours.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-1">
                    Colour
                  </p>
                  <p className="text-sm text-gray-200">
                    {colours.join(" / ")}
                  </p>
                </div>
              )}

              {/* Sizes */}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {(sizes && sizes.length > 0
                    ? sizes
                    : ["S", "M", "L", "XL"]
                  ).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-full border text-xs tracking-wide ${
                        selectedSize === size
                          ? "border-white bg-white text-black"
                          : "border-gray-600 text-gray-200 hover:border-gray-300 hover:bg-gray-900"
                      } transition`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                  Quantity
                </p>
                <div className="inline-flex items-center rounded-full border border-gray-700 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-gray-900"
                  >
                    -
                  </button>
                  <span className="px-4">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 hover:bg-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 px-5 py-3 rounded-full bg-white text-black font-medium text-sm tracking-wide hover:bg-gray-200 transition"
              >
                Buy now
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 px-5 py-3 rounded-full border border-gray-600 text-sm text-gray-100 hover:border-gray-300 hover:bg-gray-900 transition"
              >
                Add to cart
              </button>
            </div>

            <p className="text-[11px] text-gray-500">
              Secure checkout via Stripe. Orders ship from the UK. Duties &
              taxes calculated at checkout where applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
