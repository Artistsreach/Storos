const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret);
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  // prevent re-initialization
}


exports.createStripeAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

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

  const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

  return { loginLinkUrl: loginLink.url };
});


exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
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
