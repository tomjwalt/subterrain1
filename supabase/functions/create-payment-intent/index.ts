// supabase/functions/create-payment-intent/index.ts

import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      console.error("❌ Missing STRIPE_SECRET_KEY");
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15",
    });

    const body = await req.json().catch(() => ({}));

    const {
      amount,
      currency = "gbp",
      email,
      orderId,  // e.g. your orders.id from Supabase
      userId,   // optional: supabase auth user id
    } = body ?? {};

    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(Number(amount)) ||
      !Number.isInteger(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid or missing 'amount'. Must be a positive integer in smallest currency unit (e.g. pence).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      // store stuff we’ll read in the webhook
      metadata: {
        email: email ?? "",
        orderId: orderId ?? "",
        userId: userId ?? "",
      },
      // optional but handy: Stripe can send its own receipt too
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
    console.error("STRIPE ERROR (create-payment-intent):", err);
    const message = err instanceof Error ? err.message : String(err);

    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
