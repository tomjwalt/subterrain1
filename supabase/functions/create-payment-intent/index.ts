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
  // --- Handle CORS preflight ---
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST is allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY in environment");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const body = await req.json().catch(() => null);
    if (!body) {
      throw new Error("Invalid JSON body");
    }

    const { amount, currency, email, items } = body;

    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("amount (number, in pence) is required");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || "gbp",
      receipt_email: email || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...(email ? { email } : {}),
        ...(Array.isArray(items)
          ? {
              items: items
                .map((i: any) =>
                  `${i.id}:${i.quantity ?? 1}@${i.unit_price_pence ?? "?"}`,
                )
                .join("|"),
            }
          : {}),
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("Error in create-payment-intent:", err);
    return new Response(
      JSON.stringify({
        error:
          err instanceof Error ? err.message : "Unknown error creating payment intent",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
