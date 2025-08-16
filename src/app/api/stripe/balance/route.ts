import Stripe from 'stripe';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const account = url.searchParams.get('account') || undefined;

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

    const balance = await stripe.balance.retrieve(
      undefined,
      { stripeAccount: account }
    );

    return new Response(JSON.stringify({ balance }), { headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    console.error('GET /api/stripe/balance error', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
