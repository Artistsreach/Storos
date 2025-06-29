'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const { Stripe } = require('stripe');

// Initialize Stripe with the secret key from Secret Manager
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Creates a Stripe Connect Account for the authenticated user and generates an Account Link for onboarding.
 * This function is the entry point for a user to become a seller/provider on the platform.
 */
exports.createConnectAccount = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
  // 1. Check for authentication
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  if (!data.email || typeof data.email !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a user's email.");
  }

  const userId = context.auth.uid;
  const userEmail = data.email;
  const db = admin.firestore();
  const userProfileRef = db.collection("profiles").doc(userId);

  try {
    const userProfileSnap = await userProfileRef.get();
    let accountId = userProfileSnap.data()?.stripe_account_id;

    // 2. Create a Stripe Account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // Or make this dynamic based on user input
        email: userEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      // 3. Save the new account ID to the user's profile in Firestore
      await userProfileRef.set({ stripe_account_id: accountId }, { merge: true });
    }

    // 4. Create the Account Link
    // This is a temporary, single-use URL to onboard the user.
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.BASE_URL}/onboarding-refresh`,
      return_url: `${process.env.BASE_URL}/onboarding-return`,
      type: "account_onboarding",
    });

    // 5. Return the URL to the client
    return { accountLinkUrl: accountLink.url };

  } catch (error) {
    console.error("Error creating Stripe Connect account or link:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the Stripe account link.");
  }
});

/**
 * A webhook handler for receiving and processing events from Stripe.
 */
exports.stripeWebhookHandler = functions.runWith({ secrets: ["STRIPE_WEBHOOK_SECRET"] }).https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 1. Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 2. Handle the specific event type
  try {
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      //... handle other event types like 'checkout.session.completed' if needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Error handling webhook event', { eventId: event.id, error });
    res.status(500).send({ error: 'Internal server error.' });
  }
});

/**
 * Handles the 'account.updated' event to sync Connect account status with Firestore.
 * @param {object} account The Stripe Account object from the event.
 */
async function handleAccountUpdated(account) {
  const accountId = account.id;
  const db = admin.firestore();
  
  // Find the user profile associated with this Stripe account ID
  const profilesQuery = await db.collection('profiles').where('stripe_account_id', '==', accountId).limit(1).get();

  if (profilesQuery.empty) {
    console.warn(`Received account.updated webhook for an unknown account: ${accountId}`);
    return;
  }

  const userDoc = profilesQuery.docs[0];
  const { details_submitted, charges_enabled, payouts_enabled } = account;

  // Prepare the data to update in Firestore
  const profileUpdateData = {
    stripe_account_details_submitted: !!details_submitted,
    stripe_charges_enabled: !!charges_enabled,
    stripe_payouts_enabled: !!payouts_enabled,
  };

  // Update the user's profile
  await userDoc.ref.update(profileUpdateData);
  console.log(`Connect account status updated for user ${userDoc.id}`, profileUpdateData);
}

/**
 * Creates a Login Link for an existing Stripe Connect Account.
 * This allows an onboarded user to access their Express Dashboard.
 */
exports.createLoginLink = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  if (!data.stripeAccountId || typeof data.stripeAccountId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'stripeAccountId'.");
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(data.stripeAccountId);
    return { loginLinkUrl: loginLink.url };
  } catch (error) {
    console.error("Error creating Stripe login link:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the login link.");
  }
});

async function getOrCreateStripeCustomer(userId, email) {
  const db = admin.firestore();
  const userProfileRef = db.collection("profiles").doc(userId);
  const userProfileSnap = await userProfileRef.get();
  const stripeCustomerId = userProfileSnap.data()?.stripeCustomerId;

  if (stripeCustomerId) {
    return stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email,
    metadata: { firebaseUID: userId },
  });

  await userProfileRef.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

exports.createSubscriptionCheckout = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;
  const priceId = data.priceId;

  try {
    const customerId = await getOrCreateStripeCustomer(userId, userEmail);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/`,
      cancel_url: `${process.env.BASE_URL}/`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating subscription checkout session:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the subscription checkout session.");
  }
});

exports.createProductCheckoutSession = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { productName, productDescription, productImage, amount, currency, storeOwnerId } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    const db = admin.firestore();
    const storeOwnerProfileRef = db.collection("profiles").doc(storeOwnerId);
    const storeOwnerProfileSnap = await storeOwnerProfileRef.get();
    const storeOwnerProfile = storeOwnerProfileSnap.data();

    let stripeAccountId = null;
    if (storeOwnerProfile && storeOwnerProfile.stripe_account_id && storeOwnerProfile.stripe_charges_enabled) {
      stripeAccountId = storeOwnerProfile.stripe_account_id;
    }

    const product = await stripe.products.create({
      name: productName,
      description: productDescription,
      images: [productImage],
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: currency,
    });

    const sessionOptions = {
      payment_method_types: ['card'],
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/`,
      metadata: {
        firebaseUID: userId,
        productId: product.id,
      }
    };

    if (stripeAccountId) {
      sessionOptions.payment_intent_data = {
        application_fee_amount: Math.round(amount * 0.1), // 10% platform fee
        transfer_data: {
          destination: stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return { url: session.url };
  } catch (error) {
    console.error("Error creating product checkout session:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the product checkout session.");
  }
});
