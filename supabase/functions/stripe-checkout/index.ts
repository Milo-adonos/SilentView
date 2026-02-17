import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  sessionId: string;
  paymentType: "one_time" | "subscription";
  userIdentifier: string;
  userId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { sessionId, paymentType, userIdentifier, userId }: CheckoutRequest = await req.json();

    if (!sessionId || !paymentType || !userIdentifier) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const priceId = paymentType === "one_time"
      ? Deno.env.get("STRIPE_PRICE_ONE_TIME")
      : Deno.env.get("STRIPE_PRICE_SUBSCRIPTION");

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const baseUrl = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${baseUrl}/dashboard?payment=success&session_id=${sessionId}&payment_type=${paymentType}`;
    const cancelUrl = `${baseUrl}/dashboardfree?payment=cancelled`;

    const checkoutSession = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": paymentType === "one_time" ? "payment" : "subscription",
        "success_url": successUrl,
        "cancel_url": cancelUrl,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "metadata[session_id]": sessionId,
        "metadata[user_identifier]": userIdentifier,
        "metadata[payment_type]": paymentType,
        ...(userId ? { "metadata[user_id]": userId } : {}),
      }),
    });

    if (!checkoutSession.ok) {
      const error = await checkoutSession.text();
      console.error("Stripe error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const session = await checkoutSession.json();

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
