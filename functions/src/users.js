const functions = require('firebase-functions');
const admin = require('firebase-admin');

// To prevent re-initialization issues
try {
  admin.initializeApp();
} catch (e) {
  console.log('Re-initializing admin not required');
}


const db = admin.firestore();

exports.initializeUser = functions.auth.user().onCreate(async (user) => {
  console.log('New user detected, initializing credits and profile:', user.uid);

  // Initialize credits
  const userCreditsRef = db.collection('users').doc(user.uid);
  const userCreditsSnap = await userCreditsRef.get();

  if (!userCreditsSnap.exists) {
    await userCreditsRef.set({ credits: 100 });
    console.log(`100 credits initialized for user: ${user.uid}`);
  }

  // Initialize profile
  const profileRef = db.collection('profiles').doc(user.uid);
  const profileSnap = await profileRef.get();

  if (!profileSnap.exists) {
    await profileRef.set({
      email: user.email,
      role: 'store_owner',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Profile created for user: ${user.uid}`);
  }
});
