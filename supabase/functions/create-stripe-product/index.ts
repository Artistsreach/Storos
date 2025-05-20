import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@10.17.0?target=deno'

// Initialize Stripe with your platform's secret key
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log('Function create-stripe-product started.')

interface ProductPayload {
  store_id: string;
  name: string;
  description?: string;
  images?: string[];
  priceAmount: number; // e.g., 10.99
  currency: string;    // e.g., 'usd'
  // TODO: Add priceType, recurringInterval for subscriptions later
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
    const payload: ProductPayload = await req.json()
    const { store_id, name, description, images, priceAmount, currency } = payload

    if (!store_id || !name || !priceAmount || !currency) {
      return new Response(JSON.stringify({ error: 'Missing required fields: store_id, name, priceAmount, currency.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Create a Supabase client with the service role key to bypass RLS for admin tasks
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 1. Get merchant's Stripe Account ID and connection status
    // We need to find the merchant_id associated with the store_id first
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('merchant_id')
      .eq('id', store_id)
      .single()

    if (storeError || !storeData) {
      console.error('Error fetching store or store not found:', storeError)
      return new Response(JSON.stringify({ error: 'Store not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
    const merchant_id = storeData.merchant_id;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_account_details_submitted')
      .eq('id', merchant_id)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching merchant profile:', profileError)
      return new Response(JSON.stringify({ error: 'Merchant profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { stripe_account_id, stripe_account_details_submitted } = profileData

    if (!stripe_account_id || !stripe_account_details_submitted) {
      console.log(`Merchant ${merchant_id} has not completed Stripe Connect onboarding or has no Stripe account ID. Skipping Stripe product creation.`);
      // Insert into platform_products without Stripe IDs, or handle as per your logic
      // For now, we'll just return a message. The client-side should decide if to store it locally.
      const { data: dbProductWithoutStripe, error: dbInsertError } = await supabaseAdmin
        .from('platform_products')
        .insert({
          store_id: store_id,
          name: name,
          description: description,
          images: images,
          // Not setting stripe_product_id or stripe_default_price_id
        })
        .select()
        .single();

      if (dbInsertError) {
        console.error('Error inserting product into platform_products (no Stripe):', dbInsertError);
        return new Response(JSON.stringify({ error: 'Failed to save product locally: ' + dbInsertError.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      
      return new Response(JSON.stringify({ 
        message: 'Stripe Connect not set up for this merchant. Product saved locally without Stripe IDs.',
        platform_product_id: dbProductWithoutStripe.id,
        stripe_skipped: true,
        product: dbProductWithoutStripe
      }), {
        status: 200, // Or a different status code like 202 Accepted if you want to signify partial processing
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    console.log(`Creating Stripe product for merchant ${merchant_id} on account ${stripe_account_id}`)
    // 2. Create the Stripe Product ON THE CONNECTED ACCOUNT
    const productParams: Stripe.ProductCreateParams = {
      name: name,
      description: description,
      images: images, // Must be URLs publicly accessible by Stripe
      default_price_data: {
        currency: currency.toLowerCase(),
        unit_amount: Math.round(parseFloat(priceAmount.toString()) * 100), // Convert to cents
        // TODO: Add recurring for subscriptions later
        // recurring: priceType === 'recurring' ? { interval: recurringInterval.toLowerCase() } : undefined,
      },
      // active: true, // Default is true
      // Add other product attributes: tax_code, shippable, etc.
    };

    const stripeProduct = await stripe.products.create(
      productParams,
      { stripeAccount: stripe_account_id } // IMPORTANT: Specify the connected account
    );

    if (!stripeProduct || !stripeProduct.default_price) {
        throw new Error('Stripe product creation succeeded but default_price was not returned.');
    }
    const stripeDefaultPriceId = typeof stripeProduct.default_price === 'string' 
        ? stripeProduct.default_price 
        : stripeProduct.default_price.id;


    console.log(`Stripe product ${stripeProduct.id} and price ${stripeDefaultPriceId} created for merchant ${merchant_id}.`)

    // 3. Store Stripe Product ID and Price ID in your Supabase 'platform_products' table
    const { data: dbProduct, error: dbError } = await supabaseAdmin
      .from('platform_products')
      .insert({
        store_id: store_id,
        name: stripeProduct.name,
        description: stripeProduct.description,
        images: stripeProduct.images,
        stripe_product_id: stripeProduct.id,
        stripe_default_price_id: stripeDefaultPriceId,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error inserting product into platform_products:', dbError)
      // Consider logic to delete the Stripe product if DB insert fails (rollback)
      throw dbError;
    }

    console.log(`Product ${dbProduct.id} stored in platform_products for store ${store_id}.`)

    return new Response(JSON.stringify({
      message: 'Product created successfully on Stripe and saved to platform!',
      platform_product_id: dbProduct.id,
      stripe_product_id: stripeProduct.id,
      stripe_default_price_id: stripeDefaultPriceId,
      stripe_skipped: false,
      product: dbProduct
    }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

  } catch (error) {
    console.error('Error in create-stripe-product function:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
