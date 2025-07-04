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
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleSubscriptionPaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      //... handle other event types
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

async function handleCheckoutSessionCompleted(session) {
  const db = admin.firestore();
  const storeId = session.metadata.storeId;
  const userId = session.metadata.firebaseUID;

  if (!storeId) {
    console.error('No storeId in checkout session metadata');
    return;
  }

  const orderData = {
    total: session.amount_total / 100, // Convert from cents
    currency: session.currency,
    customer_email: session.customer_details.email,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    userId: userId,
    line_items: session.line_items,
  };

  await db.collection('stores').doc(storeId).collection('orders').add(orderData);
  console.log(`Order created for store ${storeId}`);
}

async function handleSubscriptionPaymentSucceeded(invoice) {
  const db = admin.firestore();
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  // Retrieve the subscription to access its metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.firebaseUID;

  if (!userId) {
    console.error('No firebaseUID in subscription metadata');
    return;
  }

  const userCreditsRef = db.collection('users').doc(userId);

  // Add 500 credits to the user's account
  await userCreditsRef.update({
    credits: admin.firestore.FieldValue.increment(500)
  });

  console.log(`500 credits granted to user ${userId} for subscription ${subscriptionId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const db = admin.firestore();
  // Retrieve preOrder document using metadata from PaymentIntent
  const preOrderId = paymentIntent.metadata.preOrderId;
  if (!preOrderId) {
    console.warn(`PaymentIntent ${paymentIntent.id} succeeded but no preOrderId in metadata.`);
    return;
  }

  const preOrderRef = db.collection('preOrders').doc(preOrderId);
  const preOrderSnap = await preOrderRef.get();

  if (!preOrderSnap.exists) {
    console.warn(`PreOrder ${preOrderId} not found for PaymentIntent ${paymentIntent.id}.`);
    return;
  }

  // Only update status if the PaymentIntent was for manual capture
  if (paymentIntent.capture_method === 'manual') {
    await preOrderRef.update({
      status: 'authorized', // Funds are held
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      stripePaymentIntentStatus: paymentIntent.status // Store Stripe's status for reference
    });
    console.log(`Pre-order ${preOrderId} status updated to 'authorized' for PI ${paymentIntent.id}.`);
    // Current quantity was already incremented in createPreOrderPaymentIntent
  } else {
    // This case might be for regular product checkouts, handle as needed
    console.log(`PaymentIntent ${paymentIntent.id} succeeded with automatic capture.`);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const db = admin.firestore();
  const preOrderId = paymentIntent.metadata.preOrderId;
  if (!preOrderId) {
    console.warn(`PaymentIntent ${paymentIntent.id} failed but no preOrderId in metadata.`);
    return;
  }

  const preOrderRef = db.collection('preOrders').doc(preOrderId);
  const preOrderSnap = await preOrderRef.get();

  if (!preOrderSnap.exists) {
    console.warn(`PreOrder ${preOrderId} not found for PaymentIntent ${paymentIntent.id}.`);
    return;
  }

  await preOrderRef.update({
    status: 'failed',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    stripePaymentIntentStatus: paymentIntent.status,
    failureReason: paymentIntent.last_payment_error?.message || 'Unknown failure'
  });
  console.log(`Pre-order ${preOrderId} status updated to 'failed' for PI ${paymentIntent.id}.`);

  // Decrement product quantity if it was incremented on initial creation
  const productId = preOrderSnap.data().productId;
  if (productId) {
    const productRef = db.collection('products').doc(productId);
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (productDoc.exists && productDoc.data().currentQuantity > 0) {
        transaction.update(productRef, { currentQuantity: admin.firestore.FieldValue.increment(-1) });
      }
    });
    console.log(`Product ${productId} currentQuantity decremented due to failed pre-order.`);
  }
}

async function handlePaymentIntentCanceled(paymentIntent) {
  const db = admin.firestore();
  const preOrderId = paymentIntent.metadata.preOrderId;
  if (!preOrderId) {
    console.warn(`PaymentIntent ${paymentIntent.id} canceled but no preOrderId in metadata.`);
    return;
  }

  const preOrderRef = db.collection('preOrders').doc(preOrderId);
  const preOrderSnap = await preOrderRef.get();

  if (!preOrderSnap.exists) {
    console.warn(`PreOrder ${preOrderId} not found for PaymentIntent ${paymentIntent.id}.`);
    return;
  }

  await preOrderRef.update({
    status: 'canceled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    stripePaymentIntentStatus: paymentIntent.status
  });
  console.log(`Pre-order ${preOrderId} status updated to 'canceled' for PI ${paymentIntent.id}.`);

  // Decrement product quantity as authorization is no longer valid
  const productId = preOrderSnap.data().productId;
  if (productId) {
    const productRef = db.collection('products').doc(productId);
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (productDoc.exists && productDoc.data().currentQuantity > 0) {
        transaction.update(productRef, { currentQuantity: admin.firestore.FieldValue.increment(-1) });
      }
    });
    console.log(`Product ${productId} currentQuantity decremented due to canceled pre-order authorization.`);
  }
}

exports.captureOrRefundPreOrders = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).pubsub.schedule('0 0 * * *') // Runs daily at midnight UTC
 .timeZone('America/New_York') // Example: run at midnight Eastern Time
 .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // 1. Query for products where releaseDate has passed and status is preOrderActive
      const productsToProcessSnap = await db.collection('products')
       .where('status', '==', 'preOrderActive')
       .where('releaseDate', '<=', now)
       .get();

      if (productsToProcessSnap.empty) {
        console.log('No pre-order campaigns to process today.');
        return null;
      }

      for (const productDoc of productsToProcessSnap.docs) {
        const productId = productDoc.id;
        const productData = productDoc.data();
        const { targetQuantity, currentQuantity } = productData;

        console.log(`Processing product: ${productId}. Current: ${currentQuantity}, Target: ${targetQuantity}`);

        const preOrdersSnap = await db.collection('preOrders')
         .where('productId', '==', productId)
         .where('status', '==', 'authorized')
         .get();

        if (currentQuantity >= targetQuantity) {
          // GOAL MET: Capture funds
          console.log(`Goal met for product ${productId}. Capturing payments...`);
          const batch = db.batch();
          for (const preOrderDoc of preOrdersSnap.docs) {
            const preOrderData = preOrderDoc.data();
            const paymentIntentId = preOrderData.paymentIntentId;
            const preOrderId = preOrderDoc.id;

            try {
              // Capture the PaymentIntent
              const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
                // Use idempotencyKey for capture operations as well
              }, { idempotencyKey: `capture-${preOrderId}` });

              // Update preOrder status to captured
              batch.update(preOrderDoc.ref, {
                status: 'captured',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                stripePaymentIntentStatus: capturedPaymentIntent.status
              });
              console.log(`Captured PI ${paymentIntentId} for pre-order ${preOrderId}.`);
            } catch (error) {
              console.error(`Error capturing PI ${paymentIntentId} for pre-order ${preOrderId}:`, error);
              // Mark pre-order as failed/capture_failed if capture fails
              batch.update(preOrderDoc.ref, {
                status: 'capture_failed',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                failureReason: error.message
              });
            }
          }
          // Update product status to released
          batch.update(productDoc.ref, { status: 'released', updatedAt: now });
          await batch.commit();
          console.log(`Product ${productId} released and payments captured.`);

        } else {
          // GOAL NOT MET: Cancel authorizations (release funds)
          console.log(`Goal NOT met for product ${productId}. Cancelling authorizations...`);
          const batch = db.batch();
          for (const preOrderDoc of preOrdersSnap.docs) {
            const preOrderData = preOrderDoc.data();
            const paymentIntentId = preOrderData.paymentIntentId;
            const preOrderId = preOrderDoc.id;

            try {
              // Cancel the PaymentIntent to release funds
              const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
                // Use idempotencyKey for cancel operations
              }, { idempotencyKey: `cancel-${preOrderId}` });

              // Update preOrder status to canceled
              batch.update(preOrderDoc.ref, {
                status: 'canceled',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                stripePaymentIntentStatus: canceledPaymentIntent.status
              });
              console.log(`Canceled PI ${paymentIntentId} for pre-order ${preOrderId}.`);
            } catch (error) {
              console.error(`Error canceling PI ${paymentIntentId} for pre-order ${preOrderId}:`, error);
              // Mark pre-order as cancel_failed if cancellation fails
              batch.update(preOrderDoc.ref, {
                status: 'cancel_failed',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                failureReason: error.message
              });
            }
          }
          // Update product status to goalFailed
          batch.update(productDoc.ref, { status: 'goalFailed', updatedAt: now });
          await batch.commit();
          console.log(`Product ${productId} goal failed and authorizations canceled.`);
        }
      }
      return null;
    } catch (error) {
      console.error("Error in captureOrRefundPreOrders scheduled function:", error);
      return null;
    }
  });

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
      subscription_data: {
        metadata: {
          firebaseUID: userId,
        }
      }
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
    } else {
      console.warn(`Store owner ${storeOwnerId} does not have a valid Stripe account. Skipping transfer.`);
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
        storeId: data.storeId,
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

exports.createPaymentLinkForProduct = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { productName, productDescription, productImage, amount, currency, storeId, productId } = data;

  try {
    const db = admin.firestore();
    const productRef = db.collection("stores").doc(storeId).collection("products").doc(productId);
    const productSnap = await productRef.get();
    const productData = productSnap.data();

    if (productData.paymentLink) {
      return { url: productData.paymentLink };
    }

    let stripeProductId = productData.stripeProductId;

    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: productName,
        description: productDescription,
        images: [productImage],
      });
      stripeProductId = product.id;
    }

    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: amount,
      currency: currency,
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
    });

    await productRef.update({
      stripeProductId: stripeProductId,
      stripePriceId: price.id,
      paymentLink: paymentLink.url,
    });

    return { url: paymentLink.url };
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while creating the payment link.");
  }
});

exports.createPreOrderPaymentIntent = functions.runWith({ secrets: ["STRIPE_SECRET_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const { productId, amount, currency, paymentMethodId, returnUrl } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email; // Assuming email is in token

  if (!productId || !amount || !currency || !paymentMethodId || !returnUrl) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required pre-order details.");
  }

  const db = admin.firestore();
  const preOrderId = db.collection('preOrders').doc().id; // Generate unique ID for pre-order

  try {
    const customerId = await getOrCreateStripeCustomer(userId, userEmail);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method: paymentMethodId,
      customer: customerId,
      capture_method: 'manual', // Hold funds, don't capture immediately
      confirm: true, // Confirm the PaymentIntent immediately
      setup_future_usage: 'off_session', // Save payment method for future off-session use
      return_url: returnUrl,
      metadata: {
        firebaseUID: userId,
        productId: productId,
        preOrderId: preOrderId,
      },
    }, { idempotencyKey: preOrderId }); // Use preOrderId as idempotency key

    // Store pre-order details in Firestore
    await db.collection('preOrders').doc(preOrderId).set({
      userId: userId,
      productId: productId,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: 'authorized', // Funds are held
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Increment pre-order count for the product (using a transaction for safety)
    const productRef = db.collection('products').doc(productId);
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Product not found.");
      }
      const currentQuantity = (productDoc.data().currentQuantity || 0) + 1;
      transaction.update(productRef, { currentQuantity: currentQuantity });
    });

    return { clientSecret: paymentIntent.client_secret, preOrderId: preOrderId };

  } catch (error) {
    console.error("Error creating pre-order Payment Intent:", error);
    throw new functions.https.HttpsError("internal", "Failed to create pre-order. " + error.message);
  }
});
