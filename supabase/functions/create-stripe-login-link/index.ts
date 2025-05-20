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

console.log('Function create-stripe-login-link started.')

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST', // Changed to POST as it expects a body
    } });
  }

  try {
    // Expecting user_id in the body, or get from JWT if function is secured that way
    // For simplicity, let's assume client sends { user_id: '...' } or we extract from JWT
    // If using JWT, you'd get user from supabase.auth.api.getUserByCookie(req) or similar
    
    // For this example, let's assume the client will send the user ID in the body.
    // In a real app, you'd get this from the authenticated user session on the server-side
    // or verify the JWT from the Authorization header.
    const { user_id } = await req.json();

    if (!user_id) {
        return new Response(JSON.stringify({ error: 'User ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_account_details_submitted')
      .eq('id', user_id)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching merchant profile for login link:', profileError)
      return new Response(JSON.stringify({ error: 'Merchant profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { stripe_account_id, stripe_account_details_submitted } = profileData

    if (!stripe_account_id) {
      return new Response(JSON.stringify({ error: 'Stripe account not connected for this user.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
    
    // Optionally, you might only allow login link if details are submitted,
    // or always provide it so they can complete onboarding if needed.
    // if (!stripe_account_details_submitted) {
    //   return new Response(JSON.stringify({ error: 'Stripe account onboarding not complete.' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    //   })
    // }

    console.log(`Creating Stripe login link for account ${stripe_account_id}`)
    
    const loginLink = await stripe.accounts.createLoginLink(stripe_account_id, {
        // redirect_url: `${Deno.env.get('YOUR_APP_URL')}/dashboard` // Optional: redirect after login if needed
    });

    return new Response(JSON.stringify({ url: loginLink.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (error) {
    console.error('Error in create-stripe-login-link function:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
