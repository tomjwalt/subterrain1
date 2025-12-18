// src/components/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const OrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setErrorMsg("");

      // 1) Who is logged in?
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

      // 2) Fetch this user’s orders
      const { data, error } = await supabase
        .from("orders") // <--- table name
        .select("id, created_at, total_amount, currency, status") // adjust if yours differ
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        setErrorMsg("Failed to load your orders.");
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    loadOrders();
  }, [navigate]);

  const goToShop = () => {
    navigate("/shop"); // change if your main product grid route is different
  };

  // Helper to show £ from pence (same as checkout 2499 etc.)
  const formatMoney = (amount, currency = "gbp") => {
    if (amount == null) return "-";
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return amount;

    const inUnits = numeric / 100; // assuming you store pence
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(inUnits);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold tracking-wide">Your Orders</h1>
          <button
            onClick={goToShop}
            className="text-sm px-3 py-1 rounded-full border border-gray-600 hover:border-gray-300 hover:bg-gray-900 transition"
          >
            Continue shopping
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-700/60 px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-8 text-center bg-[#101010]">
            <p className="text-lg mb-2">No orders yet.</p>
            <p className="text-sm text-gray-400 mb-6">
              When you place an order, it’ll show here with its status and
              total.
            </p>
            <button
              onClick={goToShop}
              className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
            >
              Shop now
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-800 bg-[#101010] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono text-xs break-all">{order.id}</p>

                  <p className="mt-2 text-xs text-gray-500">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Total</p>
                  <p className="text-lg font-semibold">
                    {formatMoney(order.total_amount, order.currency)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide">
                    <span
                      className={
                        order.status === "paid"
                          ? "text-emerald-400"
                          : order.status === "failed"
                          ? "text-red-400"
                          : "text-yellow-300"
                      }
                    >
                      {order.status || "pending"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
