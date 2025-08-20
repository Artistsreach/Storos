const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Initialize admin only once
try { admin.initializeApp(); } catch (_) {}

const getPlaidClient = () => {
  const clientId = functions.config().plaid?.client_id;
  const secret = functions.config().plaid?.secret;
  const env = (functions.config().plaid?.env || 'sandbox').toLowerCase();
  if (!clientId || !secret) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Plaid credentials are not configured. Set functions:config:set plaid.client_id=... plaid.secret=... [plaid.env=sandbox|development|production]'
    );
  }
  const basePath =
    env === 'production' ? PlaidEnvironments.production :
    env === 'development' ? PlaidEnvironments.development :
    PlaidEnvironments.sandbox;

  const configuration = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
    },
  });
  return new PlaidApi(configuration);
};

exports.createPlaidLinkToken = functions.https.onCall(async (data, context) => {
  const client = getPlaidClient();
  const uid = context.auth?.uid || 'anonymous';
  const products = Array.isArray(data?.products) && data.products.length ? data.products : ['transactions'];
  const country_codes = Array.isArray(data?.country_codes) && data.country_codes.length ? data.country_codes : ['US'];

  const resp = await client.linkTokenCreate({
    user: { client_user_id: uid },
    client_name: data?.client_name || 'FreshFront Bank',
    language: data?.language || 'en',
    products,
    country_codes,
  });
  return resp.data; // contains link_token
});

exports.exchangePlaidPublicToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  const public_token = data?.public_token;
  if (!public_token) {
    throw new functions.https.HttpsError('invalid-argument', 'public_token is required');
  }
  const client = getPlaidClient();
  const exchange = await client.itemPublicTokenExchange({ public_token });
  const access_token = exchange.data.access_token;

  // Store per-user securely in Firestore
  await admin
    .firestore()
    .collection('users')
    .doc(context.auth.uid)
    .set({ plaid_access_token: access_token }, { merge: true });

  return { ok: true };
});

exports.getPlaidTransactions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  const start_date = data?.start_date;
  const end_date = data?.end_date;
  if (!start_date || !end_date) {
    throw new functions.https.HttpsError('invalid-argument', 'start_date and end_date are required (YYYY-MM-DD)');
  }
  const snap = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const access_token = snap.get('plaid_access_token');
  if (!access_token) {
    throw new functions.https.HttpsError('failed-precondition', 'No Plaid access token stored for user');
  }
  const client = getPlaidClient();
  const resp = await client.transactionsGet({
    access_token,
    start_date,
    end_date,
    options: { count: 100, offset: 0 },
  });
  return resp.data; // contains accounts, transactions, etc.
});
