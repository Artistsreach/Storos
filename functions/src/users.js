const functions = require('firebase-functions');
const admin = require('firebase-admin');

// To prevent re-initialization issues
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    serviceAccountId: 'cloud-functions-sa@freshfront-89dc9.iam.gserviceaccount.com'
  });
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

exports.onUserFollow = functions.firestore
  .document('users/{userId}/followers/{followerId}')
  .onCreate(async (snap, context) => {
    const { userId, followerId } = context.params;
    const userRef = db.collection('users').doc(userId);
    const followerRef = db.collection('users').doc(followerId);

    const userDoc = await userRef.get();
    const followerDoc = await followerRef.get();

    if (!userDoc.exists || !followerDoc.exists) {
      console.log('User or follower not found');
      return;
    }

    const notification = {
      type: 'follow',
      followerId,
      userId,
      message: `You have a new follower.`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userId).collection('notifications').add(notification);
  });

exports.onPostUpvote = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const { postId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    if (after.upvotes.length > before.upvotes.length) {
      const userId = after.userId;
      const upvoterId = after.upvotes[after.upvotes.length - 1];

      const notification = {
        type: 'upvote',
        postId,
        upvoterId,
        userId,
        message: `Your post was upvoted.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(userId).collection('notifications').add(notification);
    }
  });

exports.onComment = functions.firestore
  .document('posts/{postId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    const { postId, commentId } = context.params;
    const comment = snap.data();
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log('Post not found');
      return;
    }

    const post = postDoc.data();
    const userId = post.userId;
    const commenterId = comment.userId;

    const notification = {
      type: 'comment',
      postId,
      commentId,
      commenterId,
      userId,
      message: `You have a new comment on your post.`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userId).collection('notifications').add(notification);
  });

exports.onReply = functions.firestore
  .document('posts/{postId}/comments/{commentId}/replies/{replyId}')
  .onCreate(async (snap, context) => {
    const { postId, commentId, replyId } = context.params;
    const reply = snap.data();
    const commentRef = db.collection('posts').doc(postId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      console.log('Comment not found');
      return;
    }

    const comment = commentDoc.data();
    const userId = comment.userId;
    const replierId = reply.userId;

    const notification = {
      type: 'reply',
      postId,
      commentId,
      replyId,
      replierId,
      userId,
      message: `You have a new reply to your comment.`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userId).collection('notifications').add(notification);
  });

exports.onCommentUpvote = functions.firestore
  .document('posts/{postId}/comments/{commentId}')
  .onUpdate(async (change, context) => {
    const { postId, commentId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    if (after.upvotes.length > before.upvotes.length) {
      const userId = after.userId;
      const upvoterId = after.upvotes[after.upvotes.length - 1];

      const notification = {
        type: 'comment_upvote',
        postId,
        commentId,
        upvoterId,
        userId,
        message: `Your comment was upvoted.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(userId).collection('notifications').add(notification);
    }
  });
