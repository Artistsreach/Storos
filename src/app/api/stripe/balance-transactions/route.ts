import Stripe from 'stripe';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const account = url.searchParams.get('account') || undefined;
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 5, 1), 25) : 5;

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

    const txns = await stripe.balanceTransactions.list(
      { limit },
      { stripeAccount: account }
    );

    return new Response(JSON.stringify({ transactions: txns.data }), { headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    console.error('GET /api/stripe/balance-transactions error', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
