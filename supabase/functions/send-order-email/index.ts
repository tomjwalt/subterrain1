
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend";

// Read env vars
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Load HTML email template
const template = await Deno.readTextFile(
  new URL("./send-order-email.html", import.meta.url),
);

// Webhook handler
serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    // Verify the webhook via Stripe CLI
    if (!signature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    // The event is already validated by Stripe CLI
    const event = JSON.parse(body);

    if (event.type === "payment_intent.succeeded") {
      const email = event.data.object?.receipt_email ||
                    event.data.object?.charges?.data?.[0]?.billing_details?.email;

      if (!email) {
        console.log("⚠ No email found on event.");
        return new Response("No email found", { status: 400 });
      }

      console.log("📧 Sending order email to:", email);

      // Send email with Resend
      const resend = new Resend(RESEND_API_KEY);
      const resp = await resend.emails.send({
        from: "Subterrain <orders@subterrain.store>",
        to: email,
        subject: "Your Subterrain Order Confirmation",
        html: template,
      });

      console.log("Email sent:", resp);

      return new Response("ok", { status: 200 });
    }

    return new Response("Unhandled event", { status: 200 });

  } catch (err) {
    console.error(" Error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
