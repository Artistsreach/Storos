import { serve } from "std/http/server.ts";
import Stripe from "stripe";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16", // Use a fixed API version, or consider aligning with import map version if it implies an API version
  // httpClient: Stripe.createFetchHttpClient(), // createFetchHttpClient is default for Deno in recent Stripe versions
});

const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173"; // Fallback for local dev

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { priceId, storeId, productId, quantity = 1 } = await req.json();

    if (!priceId || !storeId || !productId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: priceId, storeId, or productId." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    if (typeof quantity !== 'number' || quantity < 1) {
        return new Response(
            JSON.stringify({ error: "Invalid quantity." }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
    }

    // Basic validation for IDs (can be enhanced)
    if (typeof priceId !== 'string' || typeof storeId !== 'string' || typeof productId !== 'string') {
        return new Response(
            JSON.stringify({ error: "Invalid ID format." }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
    }


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}`,
      cancel_url: `${siteUrl}/store/${storeId}/product/${productId}`, // Or just back to product page
      metadata: {
        store_id: storeId,
        product_id: productId,
        // Add other relevant metadata if needed
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create checkout session." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
