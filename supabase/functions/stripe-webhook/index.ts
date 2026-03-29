// supabase/functions/stripe-webhook/index.ts
import Stripe from "https://esm.sh/stripe@12.17.0?target=deno";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --------------------
// CORS
// --------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (k: string) => Deno.env.get(k) ?? "";

// --------------------
// Helpers
// --------------------
function escHtml(v: unknown) {
  const s = String(v ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type OrderItem = {
  id?: string;
  name?: string;
  size?: string;
  colour?: string; // your field
  color?: string; // just in case
  price?: number; // pence
  quantity?: number;
  qty?: number;
};

function normalizeItems(itemsRaw: unknown): OrderItem[] {
  if (!itemsRaw) return [];
  if (Array.isArray(itemsRaw)) return itemsRaw as OrderItem[];

  if (typeof itemsRaw === "string") {
    try {
      const parsed = JSON.parse(itemsRaw);
      return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function buildAddressLines(delivery: Record<string, any>) {
  const hn = delivery.house_number ?? delivery.houseNumber ?? "";
  const street = delivery.street ?? "";
  const city = delivery.city ?? "";
  const state = delivery.state ?? delivery.county ?? "";
  const post = delivery.postal_code ?? delivery.postcode ?? "";
  const country = delivery.country ?? "";

  return [
    [hn, street].filter(Boolean).join(" ").trim(),
    city,
    state,
    post,
    country,
  ].filter((x) => String(x ?? "").trim().length > 0);
}

function buildAddressHtml(delivery: Record<string, any>) {
  const lines = buildAddressLines(delivery);
  if (!lines.length) return escHtml("(not provided)");
  return lines.map((l) => escHtml(l)).join("<br/>");
}

function moneyGBP(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function renderInvoice(items: OrderItem[]) {
  if (!items.length) {
    return { html: `<p><strong>Items:</strong> (none found)</p>`, itemsSubtotalPence: 0, totalQty: 0 };
  }

  let itemsSubtotalPence = 0;
  let totalQty = 0;

  const rows = items
    .map((it) => {
      const name = it.name ?? it.id ?? "Item";
      const size = (it.size ?? "-") || "-";
      const colour = (it.colour ?? it.color ?? "-") || "-";
      const qty = safeNumber(it.quantity ?? it.qty ?? 1, 1);

      const unitPence = safeNumber(it.price ?? 0, 0);
      const linePence = unitPence * qty;

      totalQty += qty;
      itemsSubtotalPence += linePence;

      const unit = unitPence ? moneyGBP(unitPence) : "-";
      const line = unitPence ? moneyGBP(linePence) : "-";

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${escHtml(name)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">${escHtml(size)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">${escHtml(colour)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${escHtml(qty)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${escHtml(unit)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${escHtml(line)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <table style="border-collapse:collapse;width:100%;max-width:780px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Item</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Size</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Colour</th>
          <th style="text-align:center;padding:10px;border-bottom:2px solid #ddd;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #ddd;">Unit</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #ddd;">Line total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  return { html, itemsSubtotalPence, totalQty };
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("❌ Resend error:", res.status, json);
  }
  return json;
}

// --------------------
// Server
// --------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405, headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = getEnv("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = getEnv("STRIPE_WEBHOOK_SECRET");
  const RESEND_API_KEY = getEnv("RESEND_API_KEY");

  const SB_URL = getEnv("SB_URL") || getEnv("SUPABASE_URL");
  const SB_SERVICE = getEnv("SB_SERVICE_ROLE_KEY") || getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const ADMIN_EMAIL = getEnv("ADMIN_EMAIL") || "tomjwalton123@gmail.com";
  const EMAIL_FROM = getEnv("EMAIL_FROM") || "Subterrain <onboarding@resend.dev>";

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

  // Verify signature
  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET);
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

    const orderIdMeta = paymentIntent.metadata?.orderId || "";
    const userIdMeta = paymentIntent.metadata?.userId || "";
    const emailFromMeta = paymentIntent.metadata?.email || "";

    const receiptEmail = emailFromMeta || paymentIntent.receipt_email || "";

    // 1) Fetch order (prefer orderId, fallback by PI)
    let order: any = null;
    try {
      if (orderIdMeta) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderIdMeta)
          .maybeSingle();
        if (error) console.error("❌ order fetch by id error:", error);
        order = data ?? null;
      }

      if (!order) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
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

    // 2) Update order to paid (robust)
    try {
      let updated = 0;

      if (orderIdMeta) {
        const { data, error } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_intent_id: paymentIntent.id,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq("id", orderIdMeta)
          .select("id");

        if (error) console.error("❌ Failed to update order by id:", error);
        updated = data?.length ?? 0;
      }

      if (updated === 0) {
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

        if (error) console.error("❌ Failed to update order by PI:", error);
        updated = data?.length ?? 0;
      }

      if (updated === 0) {
        console.warn("[Warn] ⚠️ No order row matched", {
          orderIdMeta,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (e) {
      console.error("❌ order update threw:", e);
    }

    // 3) Build invoice + customer details
    const items = normalizeItems(order?.items);
    const { html: itemsHtml, itemsSubtotalPence, totalQty } = renderInvoice(items);

    const delivery = (order?.delivery_details ?? {}) as Record<string, any>;
    const firstName = delivery.first_name ?? "";
    const lastName = delivery.last_name ?? "";
    const phone = delivery.phone_number ?? "";

    const customerName = `${firstName} ${lastName}`.trim() || "(not provided)";
    const addressHtml = buildAddressHtml(delivery);

    const orderIdSafe = order?.id ? String(order.id) : orderIdMeta || "(unknown)";
    const orderTotalPence = safeNumber(order?.total_amount ?? 0, 0);
    const orderTotalGBP = orderTotalPence ? moneyGBP(orderTotalPence) : "(unknown)";

    const shippingPence = safeNumber(order?.shipping_amount ?? 0, 0);
    const shippingGBP = moneyGBP(shippingPence);

    const itemsSubtotalGBP = itemsSubtotalPence ? moneyGBP(itemsSubtotalPence) : "(unknown)";

    const finalCustomerEmail =
      (order?.email ?? receiptEmail ?? "").trim() || "";

    const invoiceHtml = `
      <div style="font-family:Arial,sans-serif;max-width:820px;">
        <h2 style="margin:0 0 10px;">Order paid ✅</h2>

        <p style="margin:0 0 6px;"><strong>Order:</strong> ${escHtml(orderIdSafe)}</p>
        <p style="margin:0 0 6px;"><strong>PaymentIntent:</strong> ${escHtml(paymentIntent.id)}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

        <h3 style="margin:0 0 8px;">Customer</h3>
        <p style="margin:0 0 6px;"><strong>Name:</strong> ${escHtml(customerName)}</p>
        <p style="margin:0 0 6px;"><strong>Email:</strong> ${escHtml(finalCustomerEmail || "(not provided)")}</p>
        <p style="margin:0 0 14px;"><strong>Phone:</strong> ${escHtml(phone || "(not provided)")}</p>

        <h3 style="margin:0 0 8px;">Delivery address</h3>
        <p style="margin:0 0 14px;">${addressHtml}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

        <h3 style="margin:0 0 10px;">Items</h3>
        ${itemsHtml}

        <div style="margin-top:12px;max-width:780px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;">Items subtotal (${escHtml(totalQty)} items)</td>
              <td style="padding:8px 0;text-align:right;"><strong>${escHtml(itemsSubtotalGBP)}</strong></td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Shipping</td>
              <td style="padding:8px 0;text-align:right;">${escHtml(shippingGBP)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-top:2px solid #ddd;"><strong>Total</strong></td>
              <td style="padding:10px 0;border-top:2px solid #ddd;text-align:right;"><strong>${escHtml(orderTotalGBP)}</strong></td>
            </tr>
          </table>
        </div>

        <p style="color:#666;font-size:12px;margin-top:16px;">
          userId(meta): ${escHtml(userIdMeta || "(guest)")} • orderId(meta): ${escHtml(orderIdMeta || "(none)")}
        </p>
      </div>
    `;

    // 4) Send emails
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set, skipping email send.");
    } else {
      // Customer email (invoice style) — only if we have an email
      if (finalCustomerEmail) {
        const r1 = await sendResendEmail({
          apiKey: RESEND_API_KEY,
          from: EMAIL_FROM,
          to: [finalCustomerEmail],
          subject: "Thanks for your purchase ✅",
          html: invoiceHtml, // ✅ same invoice style, no JSON
        });
        console.log("[Info] 📧 Customer email:", r1);
      } else {
        console.warn("[Warn] No customer email available, skipping customer email.");
      }

      // Admin email
      const r2 = await sendResendEmail({
        apiKey: RESEND_API_KEY,
        from: EMAIL_FROM,
        to: [ADMIN_EMAIL],
        subject: "New paid order ✅",
        html: invoiceHtml,
      });
      console.log("[Info] 📧 Admin email:", r2);
    }
  }

  // -------------------------------
  // PAYMENT FAILED
  // -------------------------------
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderIdMeta = paymentIntent.metadata?.orderId || "";

    console.log("[Info] ❌ Payment failed:", paymentIntent.id, "orderId:", orderIdMeta);

    try {
      if (orderIdMeta) {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "payment_failed",
            payment_intent_id: paymentIntent.id,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq("id", orderIdMeta);

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

  // Always 200 so Stripe doesn’t keep retrying once we handled it
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});