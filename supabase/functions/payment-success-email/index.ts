// supabase/functions/payment-success-email/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16"
});

// Supabase service role client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    // We trigger ONLY on successful payments
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const email = paymentIntent.receipt_email;
      const amount = paymentIntent.amount;
      const currency = paymentIntent.currency;
      const orderId = paymentIntent.id;

      console.log(`💰 Payment succeeded for ${email}`);
      
      if (email) {
        // Use Supabase email API to send a confirmation email
        await supabase.functions.invoke("send-order-email", {
          body: {
            email,
            orderId,
            amount,
            currency
          },
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
