// supabase/functions/stripe-webhook/index.ts
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (k: string) => Deno.env.get(k) ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Only POST allowed", { status: 405, headers: corsHeaders });

  const STRIPE_SECRET_KEY = getEnv("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = getEnv("STRIPE_WEBHOOK_SECRET");
  const RESEND_API_KEY = getEnv("RESEND_API_KEY");

  // You’re using SB_* because SUPABASE_* gets blocked by your CLI/environment rules
  const SB_URL = getEnv("SB_URL") || getEnv("SUPABASE_URL");
  const SB_SERVICE = getEnv("SB_SERVICE_ROLE_KEY") || getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const ADMIN_EMAIL = getEnv("ADMIN_EMAIL") || "tomjwalton123@gmail.com"; // change if you want

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Missing Stripe secrets", { status: 500, headers: corsHeaders });
  }
  if (!SB_URL || !SB_SERVICE) {
    console.error("❌ Missing SB_URL or SB_SERVICE_ROLE_KEY");
    return new Response("Missing Supabase config", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
  const supabase = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } });

  const signature = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return new Response("Bad signature", { status: 400, headers: corsHeaders });
  }

  console.log("[Info] ✅ Stripe event received:", event.type);

  // -------------------------------
  // PAYMENT SUCCEEDED
  // -------------------------------
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const orderId = paymentIntent.metadata?.orderId || "";
    const userId = paymentIntent.metadata?.userId || "";
    const emailFromMeta = paymentIntent.metadata?.email || "";

    const customerEmail =
      emailFromMeta || paymentIntent.receipt_email || ADMIN_EMAIL;

    console.log("[Info] 🎉 Payment succeeded:", paymentIntent.id);
    console.log("[Info] orderId:", orderId);
    console.log("[Info] userId:", userId);
    console.log("[Info] customerEmail:", customerEmail);

    // 1) Fetch order (best effort)
    let order: any = null;
    try {
      if (orderId) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();

        if (error) console.error("❌ order fetch by id error:", error);
        order = data ?? null;
      }

      // If no orderId (or fetch failed), try by payment intent id
      if (!order) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          // IMPORTANT: cover both column names
          .or(
            `payment_intent_id.eq.${paymentIntent.id},stripe_payment_intent_id.eq.${paymentIntent.id}`,
          )
          .maybeSingle();

        if (error) console.error("❌ order fetch by PI error:", error);
        order = data ?? null;
      }
    } catch (e) {
      console.error("❌ order fetch threw:", e);
    }

    // 2) Update order to paid (robust: try orderId, fallback to PI id)
try {
  let updatedCount = 0;

  // A) Prefer updating by orderId (metadata)
  if (orderId) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_intent_id: paymentIntent.id,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("id", orderId)
      .select("id"); // returns updated rows

    if (error) {
      console.error("❌ Failed to update order by id:", error);
    } else {
      updatedCount = data?.length ?? 0;
      console.log("[Info] ✅ Updated by orderId:", orderId, "rows:", updatedCount);
    }
  }

  // B) Fallback: update by PI id (covers both columns)
  if (updatedCount === 0) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_intent_id: paymentIntent.id,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .or(
        `payment_intent_id.eq.${paymentIntent.id},stripe_payment_intent_id.eq.${paymentIntent.id}`,
      )
      .select("id");

    if (error) {
      console.error("❌ Failed to update order by PI:", error);
    } else {
      updatedCount = data?.length ?? 0;
      console.log("[Info] ✅ Updated by PI:", paymentIntent.id, "rows:", updatedCount);
    }
  }

  if (updatedCount === 0) {
    console.warn(
      "[Warn] ⚠️ No order row matched orderId or paymentIntent.id. Check metadata + columns.",
      { orderId, paymentIntentId: paymentIntent.id },
    );
  }
} catch (e) {
  console.error("❌ order update threw:", e);
}

    // 3) Build summary for emails
    const totalPence = Number(order?.total_amount ?? order?.total ?? 0);
    const totalGBP = totalPence ? `£${(totalPence / 100).toFixed(2)}` : "";
    const orderSummary = order?.id
      ? `Order #${order.id}${totalGBP ? ` – total ${totalGBP}` : ""}`
      : "";

    // 4) Send emails (customer + admin)
    if (RESEND_API_KEY) {
      const customerHtml = `
        <div>
          <h2>Thanks for your purchase!</h2>
          <p>Your payment was successful.</p>
          <p><strong>PaymentIntent:</strong> ${paymentIntent.id}</p>
          ${orderSummary ? `<p><strong>Order:</strong> ${orderSummary}</p>` : ""}
          <p>If you have any questions, just reply to this email.</p>
        </div>
      `;

      const adminHtml = `
        <div>
          <h2>New order paid ✅</h2>
          <p><strong>PaymentIntent:</strong> ${paymentIntent.id}</p>
          ${orderSummary ? `<p><strong>Order:</strong> ${orderSummary}</p>` : ""}
          <p><strong>Customer email:</strong> ${customerEmail}</p>
          <p><strong>UserId:</strong> ${userId || "(guest)"}</p>
        </div>
      `;

      // Customer email
      const r1 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Subterrain <onboarding@resend.dev>",
          to: [customerEmail],
          subject: "Thanks for your purchase ✅",
          html: customerHtml,
        }),
      });
      console.log("[Info] 📧 Customer email:", await r1.json().catch(() => ({})));

      // Admin email
      const r2 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Subterrain <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: "New paid order ✅",
          html: adminHtml,
        }),
      });
      console.log("[Info] 📧 Admin email:", await r2.json().catch(() => ({})));
    } else {
      console.warn("RESEND_API_KEY is not set, skipping email send.");
    }
  }

  // -------------------------------
  // PAYMENT FAILED
  // -------------------------------
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId || "";

    console.log("[Info] ❌ Payment failed:", paymentIntent.id, "orderId:", orderId);

    try {
      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "payment_failed",
            payment_intent_id: paymentIntent.id,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq("id", orderId);

        if (error) console.error("❌ Failed to mark order payment_failed:", error);
      } else {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "payment_failed",
            payment_intent_id: paymentIntent.id,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .or(
            `payment_intent_id.eq.${paymentIntent.id},stripe_payment_intent_id.eq.${paymentIntent.id}`,
          );

        if (error) console.error("❌ Failed to mark order payment_failed by PI:", error);
      }
    } catch (e) {
      console.error("❌ payment_failed update threw:", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});