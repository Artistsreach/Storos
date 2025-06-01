import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Get Stripe secret key from Firebase environment configuration
// User needs to set this: firebase functions:config:set stripe.secret_key="sk_test_YOUR_STRIPE_SECRET_KEY" (or live key)
const stripeSecretKey = functions.config().stripe.secret_key;
if (!stripeSecretKey) {
  console.error("Stripe secret key not set in Firebase Functions config. Use: firebase functions:config:set stripe.secret_key=\"YOUR_KEY\"");
}
// Initialize Stripe with the secret key. The API version will use Stripe's default.
const stripe = new Stripe(stripeSecretKey);

const db = admin.firestore();

/**
 * Creates a Stripe Connect Account for the authenticated user and generates an Account Link for onboarding.
 * Expects: { email: string } in the request data from the client.
 * Returns: { accountLinkUrl: string } or throws an HttpsError.
 */
export const stripeCreateConnectAccount = functions.https.onCall(async (data, context) => {
  // Check if the function is called by an authenticated user.
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  // Validate that an email is provided in the data payload.
  if (!data.email || typeof data.email !== 'string') {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with an email argument (string).");
  }

  const userId = context.auth.uid;
  const userEmail = data.email;

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
    const baseUrl = functions.config().project?.base_url || 'http://localhost:5173';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/stripe-onboarding-refresh`,
      return_url: `${baseUrl}/stripe-onboarding-return`,
      type: "account_onboarding", // For initial onboarding or if requirements change.
    });

    // Return the URL for the Account Link to the client.
    return { accountLinkUrl: accountLink.url };

  } catch (error: any) {
    console.error("Error creating Stripe Connect account or link:", error);
    // Throw an HttpsError to be caught by the client.
    throw new functions.https.HttpsError("internal", error.message || "Failed to create Stripe Connect account.");
  }
});

// Note: You will also need to create and export 'stripeCreateLoginLink' and 'stripeCreatePortalSession'
// functions when you are ready to implement those functionalities.
// For now, only 'stripeCreateConnectAccount' is defined as requested.
