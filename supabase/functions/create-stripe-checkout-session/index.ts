import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@10.17.0?target=deno'

// Initialize Stripe with your PLATFORM'S secret key
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const appBaseUrl = Deno.env.get('YOUR_APP_URL')! // Your platform's base URL e.g., http://localhost:5173 or https://storegen.app

console.log('Function create-stripe-checkout-session started.')

interface CheckoutPayload {
  platform_product_id: string; // Your internal product ID from platform_products table
  store_id: string;            // Your internal store ID
  quantity?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST',
    } });
  }

  try {
    const payload: CheckoutPayload = await req.json()
    const { platform_product_id, store_id, quantity = 1 } = payload

    if (!platform_product_id || !store_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields: platform_product_id, store_id.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 1. Fetch merchant's stripe_account_id and the product's stripe_default_price_id
    const { data: productData, error: productErr } = await supabaseAdmin
      .from('platform_products')
      .select(`
        stripe_default_price_id,
        store:stores (
          merchant_id,
          profiles ( stripe_account_id, stripe_account_details_submitted )
        )
      `)
      .eq('id', platform_product_id)
      .eq('store_id', store_id)
      .single()

    if (productErr || !productData) {
      console.error('Error fetching product/store details:', productErr)
      return new Response(JSON.stringify({ error: 'Product or store details not found.' }), {
        status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
    
    // @ts-ignore TODO: Fix type later if Supabase client typing for nested selects is off
    const connectedAccountId = productData.store?.profiles?.stripe_account_id;
    // @ts-ignore
    const stripeAccountDetailsSubmitted = productData.store?.profiles?.stripe_account_details_submitted;
    const stripePriceId = productData.stripe_default_price_id;

    if (!connectedAccountId || !stripeAccountDetailsSubmitted) {
      return new Response(JSON.stringify({ error: 'Merchant Stripe account is not connected or onboarding is not complete.' }), {
        status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    if (!stripePriceId) {
      return new Response(JSON.stringify({ error: 'Stripe Price ID for the product is missing. Product may not have been synced with Stripe.' }), {
        status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Define success and cancel URLs (relative to your app's domain)
    // These URLs should ideally be on your platform, perhaps showing an order confirmation page.
    // The store_id can be used to redirect back to the specific merchant's store context.
    const successUrl = `${appBaseUrl}/store/${store_id}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appBaseUrl}/store/${store_id}/checkout/cancel`; // Or back to product page

    console.log(`Creating Stripe Checkout session for price ${stripePriceId} on account ${connectedAccountId}`);

    // 2. Create a Stripe Checkout Session ON THE CONNECTED ACCOUNT
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment', // For one-time payments. Use 'subscription' for recurring.
      line_items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // (Optional) Collect an application fee for your platform
      // This fee is deducted from the payment and transferred to your platform's Stripe account.
      // Ensure the connected account has the 'card_payments' capability and your platform is registered for application fees.
      payment_intent_data: {
        application_fee_amount: 100, // Example: 100 cents ($1.00 USD if currency is USD)
        // The `transfer_data[destination]` is implicitly the connectedAccountId
        // when creating the charge on the connected account (direct charge).
      },
      // To associate the checkout session with the merchant for reconciliation or platform fee display
      // metadata: { 
      //   platform_store_id: store_id,
      //   platform_product_id: platform_product_id 
      // }
    };

    const checkoutSession = await stripe.checkout.sessions.create(
      sessionParams,
      { stripeAccount: connectedAccountId } // IMPORTANT: Specify the connected account
    );

    return new Response(JSON.stringify({ sessionId: checkoutSession.id, checkoutUrl: checkoutSession.url }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Error in create-stripe-checkout-session function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
