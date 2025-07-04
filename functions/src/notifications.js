const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  console.log('Re-initializing admin not required');
}

const db = admin.firestore();

exports.sendNotification = functions.firestore
  .document('users/{userId}/notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userId = context.params.userId;

    const userRef = db.collection('profiles').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('User profile not found');
      return;
    }

    const user = userDoc.data();
    const notificationSettings = user.notificationSettings || {
      follows: true,
      comments: true,
      upvotes: true,
      replies: true,
      comment_upvotes: true,
    };

    const notificationType = notification.type;

    if (notificationSettings[notificationType]) {
      console.log(`Sending ${notificationType} notification to ${userId}`);
    } else {
      console.log(`User ${userId} has disabled ${notificationType} notifications`);
      return snap.ref.delete();
    }
  });
