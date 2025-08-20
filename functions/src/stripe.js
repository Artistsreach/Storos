const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  // prevent re-initialization
}

// Lazily obtain Stripe client to avoid deploy-time crashes when config is not set
const getStripe = () => {
  const secret = functions.config()?.stripe?.secret;
  if (!secret) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Stripe secret is not configured. Run: firebase functions:config:set stripe.secret=sk_***'
    );
  }
  return require('stripe')(secret);
};


exports.createStripeAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
  });

  await admin.firestore().collection('users').doc(context.auth.uid).update({
    stripe_account_id: account.id,
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://freshfront.co/onboarding-return',
    return_url: 'https://freshfront.co/onboarding-return',
    type: 'account_onboarding',
  });

  return { accountLinkUrl: accountLink.url };
});

exports.createLoginLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { stripeAccountId } = data;
  if (!stripeAccountId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "stripeAccountId" argument.');
  }

  const stripe = getStripe();
  const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

  return { loginLinkUrl: loginLink.url };
});


exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config()?.stripe?.webhook_secret;

  let event;

  try {
    const stripe = getStripe();
    if (!endpointSecret) {
      console.warn('Stripe webhook secret is not configured. Set functions config stripe.webhook_secret');
    }
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.client_reference_id;
      const userRef = admin.firestore().collection('users').doc(userId);

      await userRef.update({
        hasPaid: true,
        paymentDate: admin.firestore.FieldValue.serverTimestamp()
      });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
