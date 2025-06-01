'use strict';

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();
const { Logging } = require('@google-cloud/logging');
const logging = new Logging({
  projectId: process.env.GCLOUD_PROJECT,
});

// Make sure to set your Stripe secret key in Firebase config:
// firebase functions:config:set stripe.secret="sk_test_YOUR_STRIPE_SECRET_KEY"
// OR for emulators, set in .runtimeconfig.json
const { Stripe } = require('stripe');
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2023-10-16', // Use a recent API version
});

/**
 * Creates a Stripe Product and a default Price for it.
 *
 * @param {object} data - The data passed to the function.
 * @param {string} data.productName - Name of the product.
 * @param {string} [data.description] - Optional description of the product.
 * @param {string[]} [data.images] - Optional array of image URLs for the product.
 * @param {number} data.unitAmount - Price in the smallest currency unit (e.g., cents).
 * @param {string} data.currency - Three-letter ISO currency code.
 * @param {string} [data.url] - Optional URL of the product page.
 * @param {object} [data.metadata] - Optional metadata for the product.
 * @param {functions.https.CallableContext} context - Callable function context.
 * @returns {Promise<{stripeProductId: string, stripePriceId: string} | {error: object}>}
 */
exports.createStripeProductAndPrice = functions.https.onCall(async (data, context) => {
  // Checking attribute.
  if (!(context.auth && context.auth.uid)) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { productName, description, images, unitAmount, currency, url, metadata } = data;

  if (!productName || !unitAmount || !currency) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: productName, unitAmount, or currency.'
    );
  }

  try {
    // Create a Product
    const product = await stripe.products.create({
      name: productName,
      description: description,
      images: images, // Stripe will fetch and store these
      url: url, // Add product URL
      default_price_data: {
        unit_amount: unitAmount, // Amount in cents
        currency: currency.toLowerCase(),
      },
      metadata: metadata,
    });

    if (!product.default_price) {
        await reportError(new Error('Product created but default_price was not set.'), {productData: data, stripeProduct: product});
        throw new functions.https.HttpsError('internal', 'Product created but default_price was not set by Stripe.');
    }

    functions.logger.log(`Stripe Product created: ${product.id}, Price: ${product.default_price}`);

    return {
      stripeProductId: product.id,
      stripePriceId: typeof product.default_price === 'string' ? product.default_price : product.default_price.id,
    };
  } catch (error) {
    functions.logger.error('Error creating Stripe product and price:', error);
    await reportError(error, { data });
    throw new functions.https.HttpsError('internal', userFacingMessage(error), error.message);
  }
});


/**
 * Creates a Stripe Checkout Session.
 *
 * @param {object} data - The data passed to the function.
 * @param {string} data.priceId - The ID of the Stripe Price.
 * @param {number} data.quantity - The quantity of the item.
 * @param {string} data.successUrl - URL to redirect to on successful payment.
 * @param {string} data.cancelUrl - URL to redirect to if payment is canceled.
 * @param {string} [data.customerEmail] - Optional customer email for prefill.
 * @param {functions.https.CallableContext} context - Callable function context.
 * @returns {Promise<{sessionId: string} | {error: object}>}
 */
exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
  // Checking attribute.
  // Checking attribute.
  if (!(context.auth && context.auth.uid)) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { priceId, quantity, successUrl, cancelUrl } = data; // customerEmail removed, will use authenticated user's email
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email; // Get email from authenticated user token

  if (!priceId || !quantity || !successUrl || !cancelUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: priceId, quantity, successUrl, or cancelUrl.'
    );
  }

  try {
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment', // Should be 'payment' for one-time purchases
      success_url: successUrl,
      cancel_url: cancelUrl,
      // automatic_tax: { enabled: true }, // Enable if you have Stripe Tax configured
    };

    // Get or create Stripe Customer ID
    const db = admin.firestore();
    const userProfileRef = db.collection("profiles").doc(userId);
    const userProfileSnap = await userProfileRef.get();
    let stripeCustomerId = userProfileSnap.data()?.stripe_customer_id;

    if (!stripeCustomerId) {
      if (!userEmail) {
        throw new functions.https.HttpsError('failed-precondition', 'User email is not available to create Stripe customer.');
      }
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      stripeCustomerId = customer.id;
      await userProfileRef.set({ stripe_customer_id: stripeCustomerId }, { merge: true });
      functions.logger.log(`Created Stripe customer ${stripeCustomerId} for Firebase user ${userId}`);
    } else {
      functions.logger.log(`Using existing Stripe customer ${stripeCustomerId} for Firebase user ${userId}`);
    }

    sessionParams.customer = stripeCustomerId;
    // sessionParams.customer_email = userEmail; // Not needed if customer ID is provided

    const session = await stripe.checkout.sessions.create(sessionParams);

    functions.logger.log(`Stripe Subscription Checkout Session created: ${session.id} for customer ${stripeCustomerId}`);
    return { sessionId: session.id };

  } catch (error) {
    functions.logger.error('Error creating Stripe Checkout session:', error);
    await reportError(error, { data });
    throw new functions.https.HttpsError('internal', userFacingMessage(error), error.message);
  }
});

/**
 * Creates a Stripe Connect Account for the authenticated user and generates an Account Link for onboarding.
 * Expects: { email: string } in the request data from the client.
 * Returns: { accountLinkUrl: string } or throws an HttpsError.
 */
exports.stripeCreateConnectAccount = functions.https.onCall(async (data, context) => {
  // Check if the function is called by an authenticated user.
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  // Validate that an email is provided in the data payload.
  if (!data.email || typeof data.email !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with an email argument (string).");
  }

  const userId = context.auth.uid;
  const userEmail = data.email;
  const db = admin.firestore(); // Get Firestore instance

  try {
    // Reference to the user's profile document in Firestore.
    const userProfileRef = db.collection("profiles").doc(userId);
    const userProfileSnap = await userProfileRef.get();
    const userProfileData = userProfileSnap.data();

    let accountId = userProfileData?.stripe_account_id;

    // If the user doesn't have a Stripe account ID yet, create one.
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express", // Express accounts are suitable for most platforms.
        country: "US",   // Defaulting to US, this might need to be dynamic based on user or platform settings.
        email: userEmail,
        capabilities: { // Request necessary capabilities.
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        // controller parameter removed as it's mutually exclusive with type: "express"
        // For Express accounts, Stripe manages the controller aspects.
      });
      accountId = account.id;

      // Save the new Stripe Account ID to the user's profile in Firestore.
      // Using { merge: true } to avoid overwriting other profile data.
      await userProfileRef.set({ stripe_account_id: accountId }, { merge: true });
    }

    // Create an Account Link for onboarding or updating the account.
    // refresh_url: Where to redirect if the link expires or is invalid.
    // return_url: Where to redirect after successful onboarding/update.
    // These URLs should point to pages in your frontend application.
    // Consider making these configurable via Firebase environment config.
    const baseUrl = functions.config().project?.base_url || 'http://localhost:5173'; // Default for local dev
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/stripe-onboarding-refresh`,
      return_url: `${baseUrl}/stripe-onboarding-return`,
      type: "account_onboarding", // For initial onboarding or if requirements change.
    });

    // Return the URL for the Account Link to the client.
    return { accountLinkUrl: accountLink.url };

  } catch (error) {
    functions.logger.error("Error creating Stripe Connect account or link:", error);
    await reportError(error, { userId, userEmail }); // Pass relevant context to reportError
    // Throw an HttpsError to be caught by the client.
    throw new functions.https.HttpsError("internal", userFacingMessage(error), error.message);
  }
});

/**
 * Creates a Login Link for an existing Stripe Connect Account.
 * Expects: { stripeAccountId: string } in the request data from the client.
 * Returns: { loginLinkUrl: string } or throws an HttpsError.
 */
exports.stripeCreateLoginLink = functions.https.onCall(async (data, context) => {
  // Check if the function is called by an authenticated user.
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  // Validate that stripeAccountId is provided.
  if (!data.stripeAccountId || typeof data.stripeAccountId !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'stripeAccountId' (string).");
  }

  const stripeAccountId = data.stripeAccountId;

  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return { loginLinkUrl: loginLink.url };
  } catch (error) {
    functions.logger.error("Error creating Stripe login link:", error);
    await reportError(error, { stripeAccountId }); // Pass relevant context
    throw new functions.https.HttpsError("internal", userFacingMessage(error), error.message);
  }
});

/**
 * Creates a Stripe Billing Portal session for the authenticated user.
 * Assumes stripe_customer_id is stored in the user's profile in Firestore.
 * Returns: { url: string } for redirecting to the portal or throws an HttpsError.
 */
exports.stripeCreatePortalSession = functions.https.onCall(async (data, context) => {
  // Check if the function is called by an authenticated user.
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const db = admin.firestore(); // Get Firestore instance

  try {
    // Reference to the user's profile document in Firestore.
    const userProfileRef = db.collection("profiles").doc(userId);
    const userProfileSnap = await userProfileRef.get();
    const userProfileData = userProfileSnap.data();

    const stripeCustomerId = userProfileData?.stripe_customer_id;

    if (!stripeCustomerId) {
      throw new functions.https.HttpsError("failed-precondition", "Stripe customer ID not found for this user. User may not have an active subscription or payment method.");
    }

    // The return_url should be a URL in your frontend application where users are sent after managing billing.
    // Consider making these configurable via Firebase environment config.
    const baseUrl = functions.config().project?.base_url || 'http://localhost:5173'; // Default for local dev
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard`, // Or a more specific settings/billing page
    });

    // Return the URL for the Billing Portal session to the client.
    return { url: portalSession.url };

  } catch (error) {
    functions.logger.error("Error creating Stripe Billing Portal session:", error);
    await reportError(error, { userId }); // Pass relevant context
    throw new functions.https.HttpsError("internal", userFacingMessage(error), error.message);
  }
});


// To keep on top of errors, we should raise a verbose error report with Error Reporting rather
// than simply relying on functions.logger.error. This will calculate users affected + send you email
// alerts, if you've opted into receiving them.
function reportError(err, context = {}) {
  const logName = 'errors';
  const log = logging.log(logName);
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: { function_name: process.env.FUNCTION_NAME || context.functionName || 'unknown' }, // Adjust if needed
    },
  };
  // Sanitize context to prevent oversized log entries, especially from image data
  const sanitizedContext = { ...context };
  if (sanitizedContext.data && sanitizedContext.data.images) {
    // Replace images array with a count or placeholder if it's too large or contains base64
    if (Array.isArray(sanitizedContext.data.images) && sanitizedContext.data.images.some(img => typeof img === 'string' && img.startsWith('data:'))) {
      sanitizedContext.data.images = `[${sanitizedContext.data.images.length} images, including base64 data - Truncated for logging]`;
    } else if (JSON.stringify(sanitizedContext.data.images).length > 1024) { // Arbitrary limit for logging
      sanitizedContext.data.images = `[${sanitizedContext.data.images.length} images - Truncated for logging due to size]`;
    }
  }
  if (sanitizedContext.productData && sanitizedContext.productData.images) {
     if (Array.isArray(sanitizedContext.productData.images) && sanitizedContext.productData.images.some(img => typeof img === 'string' && img.startsWith('data:'))) {
      sanitizedContext.productData.images = `[${sanitizedContext.productData.images.length} images, including base64 data - Truncated for logging]`;
    } else if (JSON.stringify(sanitizedContext.productData.images).length > 1024) {
      sanitizedContext.productData.images = `[${sanitizedContext.productData.images.length} images - Truncated for logging due to size]`;
    }
  }
  // Also consider truncating stripeProduct if it can be very large
  if (sanitizedContext.stripeProduct && JSON.stringify(sanitizedContext.stripeProduct).length > 2048) {
    sanitizedContext.stripeProduct = { id: sanitizedContext.stripeProduct.id, object: sanitizedContext.stripeProduct.object, message: "[Stripe product object truncated for logging]" };
  }


  const errorEvent = {
    message: err.stack || err.message || JSON.stringify(err),
    serviceContext: {
      service: process.env.FUNCTION_NAME || context.functionName || 'unknown', // Adjust if needed
      resourceType: 'cloud_function',
    },
    context: sanitizedContext, // Use the sanitized context
  };
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

// Sanitize the error message for the user.
function userFacingMessage(error) {
  return error.type && error.message
    ? error.message
    : 'An unexpected error occurred, our team has been alerted.';
}

/**
 * Checks the status of a user's Stripe Connect account and updates their profile in Firestore.
 * This is typically called after a user returns from the Stripe Connect onboarding flow.
 *
 * @param {object} data - The data passed to the function (can be empty).
 * @param {functions.https.CallableContext} context - Callable function context.
 * @returns {Promise<{success: boolean, details_submitted: boolean, charges_enabled: boolean, payouts_enabled: boolean} | {error: object}>}
 */
exports.checkStripeAccountStatusAndUpdateProfile = functions.https.onCall(async (data, context) => {
  if (!(context.auth && context.auth.uid)) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const userId = context.auth.uid;
  const db = admin.firestore();
  const userProfileRef = db.collection("profiles").doc(userId);

  try {
    const userProfileSnap = await userProfileRef.get();
    if (!userProfileSnap.exists()) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const userProfileData = userProfileSnap.data();
    const stripeAccountId = userProfileData?.stripe_account_id;

    if (!stripeAccountId) {
      throw new functions.https.HttpsError('failed-precondition', 'Stripe account ID not found in user profile.');
    }

    // Retrieve the Stripe account details
    const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);

    const { details_submitted, charges_enabled, payouts_enabled } = stripeAccount;

    // Prepare data for Firestore update
    const profileUpdateData = {
      stripe_account_details_submitted: !!details_submitted, // Ensure boolean
      stripe_charges_enabled: !!charges_enabled,       // Ensure boolean
      stripe_payouts_enabled: !!payouts_enabled,       // Ensure boolean
      stripe_account_status_last_checked: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the user's profile in Firestore
    await userProfileRef.update(profileUpdateData);

    functions.logger.log(`Stripe account status checked and profile updated for user ${userId}`, profileUpdateData);

    return {
      success: true,
      details_submitted: !!details_submitted,
      charges_enabled: !!charges_enabled,
      payouts_enabled: !!payouts_enabled,
    };

  } catch (error) {
    functions.logger.error(`Error checking Stripe account status for user ${userId}:`, error);
    await reportError(error, { userId, functionName: 'checkStripeAccountStatusAndUpdateProfile' });
    throw new functions.https.HttpsError('internal', userFacingMessage(error), error.message);
  }
});
