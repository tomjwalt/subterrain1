import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

const ProductPage = ({ onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === productId);

  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const [liked, setLiked] = useState(false);
  const [likeRowId, setLikeRowId] = useState(null);
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    const loadLikeState = async () => {
      if (!product?.id) return;

      setLikeError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user for likes:", userError);
          return;
        }

        if (!user) {
          setLiked(false);
          setLikeRowId(null);
          return;
        }

        const { data, error } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking like state:", error);
          setLikeError("Could not load like state.");
          return;
        }

        if (data) {
          setLiked(true);
          setLikeRowId(data.id);
        } else {
          setLiked(false);
          setLikeRowId(null);
        }
      } catch (err) {
        console.error("Unexpected error loading like state:", err);
        setLikeError("Could not load like state.");
      }
    };

    loadLikeState();
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="mb-4">Product not found.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-full border border-zinc-700 text-sm hover:border-white"
        >
          Back to home
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!onAddToCart) return;

    onAddToCart(product, {
      size,
      colour: "Black / Reflective",
      quantity,
    });
  };

  const handleToggleLike = async () => {
    if (liking || !product?.id) return;

    setLiking(true);
    setLikeError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error checking user for like:", userError);
        setLikeError("Please try again.");
        return;
      }

      if (!user) {
        navigate("/signup");
        return;
      }

      const { data: existingLike, error: existingError } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing like:", existingError);
        setLikeError("Could not update like.");
        return;
      }

      if (existingLike?.id) {
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("Error removing like:", deleteError);
          setLikeError("Failed to remove like.");
          return;
        }

        setLiked(false);
        setLikeRowId(null);
        return;
      }

      const { data: insertedLike, error: insertError } = await supabase
        .from("likes")
        .insert({
          user_id: user.id,
          product_id: product.id,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting like:", insertError);
        setLikeError("Failed to save like.");
        return;
      }

      setLiked(true);
      setLikeRowId(insertedLike.id);
    } catch (err) {
      console.error("Unexpected like toggle error:", err);
      setLikeError("Something went wrong.");
    } finally {
      setLiking(false);
    }
  };

  const displayPrice =
    typeof product.price === "number" && product.price > 100
      ? (product.price / 100).toFixed(2)
      : product.price.toFixed(2);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-6xl mx-auto px-4 pt-10 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* LEFT: IMAGE */}
          <div className="border border-zinc-800 rounded-3xl h-80 md:h-[34rem] flex items-center justify-center bg-[#050507]">
            <span className="text-xs tracking-[0.25em] uppercase text-zinc-600">
              Product image
            </span>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col gap-7">
            <div className="space-y-3">
              <p className="text-[0.72rem] tracking-[0.28em] uppercase text-zinc-400">
                {product.category}
              </p>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white leading-tight">
                {product.name}
              </h1>

              <p className="text-base text-zinc-300 max-w-lg leading-7">
                {product.description}
              </p>

              <p className="text-2xl font-semibold text-white">
                £{displayPrice}
              </p>
            </div>

            {/* SIZE */}
            <div>
              <p
                className="text-xs uppercase tracking-[0.24em] text-zinc-400"
                style={{ marginBottom: "5px" }}
              >
                Size
              </p>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[42px] px-3 py-2 rounded-full border text-sm transition ${
                      s === size
                        ? "bg-white/10 text-white border-white font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
                        : "bg-transparent border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            <div>
              <p
                className="text-xs uppercase tracking-[0.24em] text-zinc-400"
                style={{ marginBottom: "5px" }}
              >
                Quantity
              </p>

              <div className="inline-flex items-center rounded-full border border-zinc-600 bg-transparent overflow-hidden px-3 py-1.5">
                <button
                  type="button"
                  className="w-5 flex items-center justify-center text-lg leading-none text-zinc-100 hover:text-white transition"
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                >
                  −
                </button>

                <span className="mx-4 min-w-[14px] text-center text-sm font-semibold text-white leading-none">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="w-5 flex items-center justify-center text-lg leading-none text-zinc-100 hover:text-white transition"
                  onClick={() => setQuantity((q) => (q < 9 ? q + 1 : 9))}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleAdd}
                className="min-w-[126px] px-4 py-2 rounded-full border border-zinc-600 bg-transparent text-zinc-100 text-sm font-semibold hover:border-white hover:text-white transition"
              >
                Add to cart
              </button>

              <button
                type="button"
                disabled={liking}
                onClick={handleToggleLike}
                className={`inline-flex items-center justify-center gap-2 min-w-[92px] px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-[0.04em] transition ${
                  liked
                    ? "border-white text-white bg-zinc-800"
                    : "border-zinc-600 bg-transparent text-zinc-100 hover:border-white hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />
                <span>{liking ? "..." : liked ? "Liked" : "Like"}</span>
              </button>
            </div>

            {likeError && (
              <p className="text-xs text-red-400 -mt-3">{likeError}</p>
            )}

            {/* DESCRIPTION BLOCK */}
            <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 mb-3">
                Description
              </p>

              <div className="space-y-3 text-sm text-zinc-300 leading-7">
                <p>{product.description}</p>
                <p>
                  Built for a clean, technical streetwear feel with a heavier
                  silhouette and a more structured drape.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Oversized fit</li>
                  <li>Streetwear-inspired shape</li>
                  <li>Designed for everyday wear and layering</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
