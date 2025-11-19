import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0";

// Load the Stripe secret key from the environment
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  const url = new URL(req.url);

  // Debug route to show whether env variables loaded
  if (url.searchParams.get("debug") === "env") {
    return new Response(
      JSON.stringify({
        hasStripeKey: !!STRIPE_SECRET_KEY,
        stripeKeyPreview: STRIPE_SECRET_KEY?.slice(0, 10) + "...",
        envKeys: Deno.env.toObject ? Object.keys(Deno.env.toObject()) : [],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      console.error(" Missing STRIPE_SECRET_KEY in environment");
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    const { amount, currency = "gbp" } = await req.json();

    if (!amount) {
      return new Response(
        JSON.stringify({ error: "Missing payment amount" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(` Creating payment intent for ${amount} ${currency}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("🔥 Payment intent error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
