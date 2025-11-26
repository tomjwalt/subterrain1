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

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Only POST allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Missing Stripe secrets", {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response("Missing Supabase config", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

  const signature = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;

  try {
    // ✅ async version required in Supabase Edge runtime
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return new Response("Bad signature", { status: 400, headers: corsHeaders });
  }

  console.log("[Info] ✅ Stripe event received:", event.type);

  // We only care about successful payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const emailFromMeta = paymentIntent.metadata?.email || "";
    const orderId = paymentIntent.metadata?.orderId || "";
    const userId = paymentIntent.metadata?.userId || "";

    const email =
      emailFromMeta || paymentIntent.receipt_email || "tomjwalton123@gmail.com";

    // --- Pull data from Supabase (orders, user, etc.) ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Example: fetch the order row. Change "orders" and fields to match your schema.
    let orderSummary = "";
    try {
      if (orderId) {
        const { data: order, error: orderError } = await supabase
          .from("orders")        // 👈 change to your table name
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) {
          console.error("Supabase order fetch error:", orderError);
        } else if (order) {
          // Build a simple summary string – customise this
          orderSummary = `Order #${order.id} – total £${(order.total / 100).toFixed(
            2,
          )}`;
        }
      }
    } catch (err) {
      console.error("Supabase fetch threw:", err);
    }

    // --- Send email via Resend ---
    if (RESEND_API_KEY) {
      const htmlBody = `
        <div>
          <h2>Thanks for your purchase!</h2>
          <p>Your payment was successful.</p>
          <p><strong>PaymentIntent:</strong> ${paymentIntent.id}</p>
          ${
            orderSummary
              ? `<p><strong>Order:</strong> ${orderSummary}</p>`
              : ""
          }
          <p>If you have any questions, just reply to this email.</p>
        </div>
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Subterrain <onboarding@resend.dev>",
          to: [email],
          subject: "Thanks for your purchase ✅",
          html: htmlBody,
        }),
      });

      const resendJson = await resendResponse.json().catch(() => ({}));
      console.log("[Info] 📧 Resend result:", resendJson);
    } else {
      console.warn("RESEND_API_KEY is not set, skipping email send.");
    }
  }

  // Always 200 so Stripe doesn’t retry endlessly
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
