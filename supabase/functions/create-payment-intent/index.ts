// supabase/functions/create-payment-intent/index.ts

import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";

// CORS headers so the browser is allowed to call this function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request): Promise<Response> => {
  // --- Handle CORS preflight ---
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 204,
      headers: corsHeaders,
    });
  }

  // --- Only POST is allowed for real work ---
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      console.error("❌ Missing STRIPE_SECRET_KEY in Supabase secrets");
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY on server" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      amount,
      currency = "gbp",
      email,
      orderId,
      userId,
    } = body ?? {};

    const parsedAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(parsedAmount) ||
      !Number.isInteger(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid or missing 'amount'. Must be a positive integer in the smallest currency unit (e.g. pence).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parsedAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        email: email ?? "",
        orderId: orderId ?? "",
        userId: userId ?? "",
      },
      receipt_email: email ?? undefined,
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("❌ STRIPE ERROR (create-payment-intent):", err);
    const message = err instanceof Error ? err.message : String(err);

    return new Response(
      JSON.stringify({ error: message || "Failed to create payment intent" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
