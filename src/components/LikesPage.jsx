import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const LikesPage = () => {
  const navigate = useNavigate();

  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadLikes = async () => {
      setLoading(true);
      setErrorMsg("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setErrorMsg("Unable to load your account. Please log in again.");
        setLoading(false);
        return;
      }

      if (!user) {
        
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("likes")
        .select("id, product_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading likes:", error);
        setErrorMsg("Failed to load your liked items.");
        setLoading(false);
        return;
      }

      setLikes(data || []);
      setLoading(false);
    };

    loadLikes();
  }, [navigate]);

  const handleUnlike = async (likeId) => {
    setErrorMsg("");

    const { error } = await supabase.from("likes").delete().eq("id", likeId);

    if (error) {
      console.error("Error unliking:", error);
      setErrorMsg("Failed to remove like. Please try again.");
      return;
    }

    setLikes((prev) => prev.filter((like) => like.id !== likeId));
  };

  const goToShop = () => {
   
    navigate("/shop");
  };

  const goToProduct = (productId) => {
    
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading your likes…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold tracking-wide">Your Likes</h1>
          <button
            onClick={goToShop}
            className="text-sm px-3 py-1 rounded-full border border-gray-600 hover:border-gray-300 hover:bg-gray-900 transition"
          >
            Browse products
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-700/60 px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        {likes.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-8 text-center bg-[#101010]">
            <p className="text-lg mb-2">You haven’t liked anything yet.</p>
            <p className="text-sm text-gray-400 mb-6">
              Tap the heart icon on a product to save it here.
            </p>
            <button
              onClick={goToShop}
              className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
            >
              Discover products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {likes.map((like) => (
              <div
                key={like.id}
                className="border border-gray-800 bg-[#101010] rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-500 transition cursor-pointer"
                onClick={() => goToProduct(like.product_id)}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Product ID</p>
                  <p className="font-mono text-sm break-all">
                    {like.product_id}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Liked on{" "}
                    {new Date(like.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlike(like.id);
                  }}
                  className="self-end text-xs px-3 py-1 rounded-full border border-red-600 text-red-400 hover:bg-red-900/40 transition"
                >
                  Remove like
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
