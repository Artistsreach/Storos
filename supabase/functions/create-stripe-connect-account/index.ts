import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@10.17.0?target=deno' // Use Stripe's Deno version
// @ts-ignore: Deno compatibility for cors
import cors from 'https://esm.sh/cors@2.8.5'

// Initialize Stripe with your secret key
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // @ts-ignore: Deno aising issues with Stripe's anouncement, this is fine
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15', // Use a specific API version
})

// Get Supabase and App URLs from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
// Use the base App URL for constructing Stripe redirect URLs
const appUrl = Deno.env.get('YOUR_APP_URL')! // Example: https://your-app.com or http://localhost:3000

console.log('Function create-stripe-connect-account started.')

const handleCors = cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Or your specific origin
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get Supabase user data from the request body
    const { record: user } = await req.json()

    if (!user || !user.id || !user.email) {
      console.error('User data missing:', user)
      return new Response(JSON.stringify({ error: 'User ID and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    console.log(`Processing user: ${user.email} (ID: ${user.id})`)

    // 2. Initialize Supabase client with service_role key for admin operations
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user already has a Stripe account ID in their profile
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_account_details_submitted')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows, which is fine
        console.error('Error fetching profile:', profileError)
        throw profileError;
    }

    if (existingProfile && existingProfile.stripe_account_id) {
      console.log(`User ${user.email} already has Stripe account: ${existingProfile.stripe_account_id}`)
      
      // If account exists but onboarding not complete, generate new link
      // Or if you always want to provide a way to get to their dashboard via a link
      if (!existingProfile.stripe_account_details_submitted || true) { // Modify condition as needed
        console.log(`Generating new account link for existing account ${existingProfile.stripe_account_id}`);
        const accountLink = await stripe.accountLinks.create({
          account: existingProfile.stripe_account_id,
          refresh_url: `${appUrl}/stripe-onboarding/refresh`,
          return_url: `${appUrl}/stripe-onboarding/return`,
          type: 'account_onboarding',
        })
        return new Response(JSON.stringify({ stripe_account_id: existingProfile.stripe_account_id, account_link_url: accountLink.url, existing: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 200,
        })
      } else {
         // If onboarding is complete, you might just confirm or do nothing
        return new Response(JSON.stringify({ stripe_account_id: existingProfile.stripe_account_id, message: "Stripe account already exists and onboarding completed.", existing: true, onboarded: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 200,
        });
      }
    }

    console.log(`Creating Stripe Express account for ${user.email}`)
    // 3. Create a Stripe Express Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Default country, or get from user data
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      // The controller parameter is not allowed when type is 'express'
      // controller: {
      //   fees: {
      //     payer: 'application',
      //   },
      //   losses: {
      //     payments: 'application',
      //   },
      //   stripe_dashboard: {
      //     type: 'express',
      //   },
      // },
      metadata: {
        supabase_user_id: user.id,
      },
    })
    console.log(`Stripe account created: ${account.id} for ${user.email}`)

    // 4. Store the Stripe Account ID in the user's profile
    // Ensure the profile row was created by the handle_new_user trigger
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_account_id: account.id, stripe_account_details_submitted: false }) // Set submitted to false initially
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile with Stripe ID:', updateError)
      // Consider rolling back Stripe account creation or flagging for manual review
      // For now, we'll still try to return an account link if account was created
      if (account && account.id) {
         // If profile update fails, but account was created, still try to provide link
         // This situation needs careful handling in production (e.g. retry profile update)
         console.warn(`Stripe account ${account.id} created but profile update failed.`)
      } else {
        throw updateError; // If account creation also failed or no ID, throw original error
      }
    } else {
      console.log(`Profile updated for ${user.email} with Stripe ID: ${account.id}`)
    }
    

    // 5. Create an Account Link for onboarding
    console.log(`Creating Account Link for ${account.id}`)
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/stripe-onboarding/refresh`,
      return_url: `${appUrl}/stripe-onboarding/return`,
      type: 'account_onboarding',
    })
    console.log(`Account Link created for ${account.id}: ${accountLink.url}`)

    // 6. Return the Stripe Account ID and Account Link URL
    return new Response(JSON.stringify({ stripe_account_id: account.id, account_link_url: accountLink.url, existing: false }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in create-stripe-connect-account function:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
