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

const getBaseUrl = () => {
  // Prefer config, fallback to localhost for dev
  const base = functions.config()?.app?.base_url || 'http://localhost:5173';
  return base.replace(/\/$/, '');
};

// Create or reuse a connected account and return an onboarding Account Link
exports.createConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = getStripe();
  const uid = context.auth.uid;
  const email = (data && data.email) || undefined;

  const userRef = admin.firestore().collection('users').doc(uid);
  const userSnap = await userRef.get();
  const existingAccountId = userSnap.exists ? userSnap.data()?.stripe_account_id : undefined;

  let accountId = existingAccountId;
  if (!accountId) {
    // Create Express connected account and request common capabilities
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        // Prefill optional info where appropriate
        url: data?.businessUrl || undefined,
        product_description: data?.productDescription || undefined,
      },
      // Attach user reference so webhooks can map back without storing account id prematurely
      metadata: { user_id: uid },
    });
    accountId = account.id;
    // Do NOT set stripe_account_id yet; only once onboarding is completed.
    await userRef.set({ stripe_onboarding_started: true }, { merge: true });
  }

  // Create an onboarding Account Link
  const baseUrl = getBaseUrl();
  const refresh_url = `${baseUrl}/onboarding-return?refresh=1`;
  const return_url = `${baseUrl}/onboarding-return`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url,
    return_url,
    type: 'account_onboarding',
    collection_options: {
      fields: 'eventually_due',
    },
  });

  return { accountId, accountLinkUrl: accountLink.url };
});


exports.createStripeAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = getStripe();
  const uid = context.auth.uid;
  const account = await stripe.accounts.create({
    type: 'express',
    metadata: { user_id: uid },
  });

  // Do not set stripe_account_id yet; wait for details_submitted via webhook
  await admin.firestore().collection('users').doc(uid).set({ stripe_onboarding_started: true }, { merge: true });

  const baseUrl = getBaseUrl();
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/onboarding-return?refresh=1`,
    return_url: `${baseUrl}/onboarding-return`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, accountLinkUrl: accountLink.url };
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
    case 'account.updated': {
      const account = event.data.object;
      const accountId = account.id;
      try {
        // Prefer mapping via metadata set on account creation
        let userRefToUpdate;
        const metaUserId = account.metadata?.user_id;
        if (metaUserId) {
          userRefToUpdate = admin.firestore().collection('users').doc(metaUserId);
        } else {
          // Fallback to legacy mapping via stored stripe_account_id
          const snap = await admin.firestore().collection('users').where('stripe_account_id', '==', accountId).limit(1).get();
          if (!snap.empty) {
            userRefToUpdate = snap.docs[0].ref;
          }
        }

        if (userRefToUpdate) {
          const updates = {
            stripe_account_details_submitted: !!account.details_submitted,
            stripe_charges_enabled: !!account.charges_enabled,
            stripe_payouts_enabled: !!account.payouts_enabled,
            stripe_requirements_currently_due: account.requirements?.currently_due || [],
            stripe_requirements_eventually_due: account.requirements?.eventually_due || [],
          };
          // Only persist account id after onboarding completed
          if (account.details_submitted) {
            updates.stripe_account_id = accountId;
          }
          await userRefToUpdate.set(updates, { merge: true });
        }
      } catch (e) {
        console.error('Failed to update user after account.updated', e);
      }
      break;
    }
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
