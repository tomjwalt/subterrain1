// supabase/functions/create-payment-intent/index.ts

import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (key: string) => Deno.env.get(key) ?? "";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  if (req.method !== "POST") {
    return json(405, { error: "Only POST allowed" });
  }

  try {
    const STRIPE_SECRET_KEY = getEnv("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) return json(500, { error: "Missing STRIPE_SECRET_KEY" });

    // Support BOTH naming schemes
    const SB_URL = getEnv("SB_URL") || getEnv("SUPABASE_URL");
    const SB_SERVICE = getEnv("SB_SERVICE_ROLE_KEY") || getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!SB_URL || !SB_SERVICE) return json(500, { error: "Missing Supabase service envs" });

    const supabase = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } });
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

    const body = await req.json().catch(() => ({}));
    const { amount, currency = "gbp", email, orderId, userId } = body ?? {};

    if (!orderId) return json(400, { error: "Missing orderId" });

    const amt = Number(amount);
    if (!Number.isInteger(amt) || amt <= 0) return json(400, { error: "Invalid amount" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amt,
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: email ?? undefined,
      metadata: {
        orderId: String(orderId),
        userId: userId ? String(userId) : "",
        email: email ? String(email) : "",
      },
    });

    // ✅ Write PI id onto BOTH columns so the webhook can match reliably
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        payment_intent_id: paymentIntent.id,
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending_payment",
      })
      .eq("id", orderId);

    if (updateErr) {
      console.error("❌ Failed to attach PI to order:", updateErr);
      return json(500, { error: "Failed to update order with payment_intent_id" });
    }

    return json(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId,
    });
  } catch (err) {
    console.error("❌ create-payment-intent error:", err);
    return json(400, { error: err instanceof Error ? err.message : String(err) });
  }
});