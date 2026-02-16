import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();

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

    const verifyResponse = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
      },
    });

    if (!verifyResponse.ok) {
      console.error("Failed to verify webhook");
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.metadata?.session_id;
      const userIdentifier = session.metadata?.user_identifier;
      const paymentType = session.metadata?.payment_type;
      const userId = session.metadata?.user_id;

      if (!sessionId || !userIdentifier || !paymentType) {
        console.error("Missing metadata in webhook", { sessionId, userIdentifier, paymentType });
        return new Response(
          JSON.stringify({ error: "Invalid metadata" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      let existingSubscription = null;
      if (userId) {
        const { data, error: checkError } = await supabase
          .from("premium_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (checkError) {
          console.error("Error checking existing subscription:", checkError);
        }
        existingSubscription = data;
      }

      if (existingSubscription && paymentType === "subscription") {
        const { error: updateError } = await supabase
          .from("premium_subscriptions")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscription.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        }
      } else {
        const subscriptionData: any = {
          user_identifier: userIdentifier,
          subscription_type: paymentType === "one_time" ? "one_time" : "premium_monthly",
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: null,
        };

        if (userId) {
          subscriptionData.user_id = userId;
        }

        const { error: insertError } = await supabase
          .from("premium_subscriptions")
          .insert(subscriptionData);

        if (insertError) {
          console.error("Error creating subscription:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create subscription" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      const sessionUpdateData: any = {
        payment_completed: true,
        payment_type: paymentType,
        stripe_payment_id: session.id,
      };

      if (userId) {
        sessionUpdateData.user_id = userId;
      }

      const { error: sessionUpdateError } = await supabase
        .from("analysis_sessions")
        .update(sessionUpdateData)
        .eq("id", sessionId);

      if (sessionUpdateError) {
        console.error("Error updating analysis session:", sessionUpdateError);
      }

      console.log("Payment processed successfully", { sessionId, userIdentifier, paymentType, userId });
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
