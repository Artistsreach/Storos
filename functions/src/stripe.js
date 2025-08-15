const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret);
const admin = require('firebase-admin');

admin.initializeApp();

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
