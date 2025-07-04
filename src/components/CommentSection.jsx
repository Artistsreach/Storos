import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseClient';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import { Send, ArrowUp } from 'lucide-react';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const commentsCollection = collection(db, 'posts', postId, 'comments');
    const q = query(commentsCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text: newComment,
      userId: user.uid,
      username: profile.username,
      profilePhoto: profile.profilePhoto,
      timestamp: Timestamp.now(),
      replyToId: replyTo ? replyTo.id : null,
      upvotes: [],
    });

    if (postAuthorId !== user.uid) {
      const notificationsCollection = collection(db, 'users', postAuthorId, 'notifications');
      await addDoc(notificationsCollection, {
        type: 'comment',
        message: `${profile.username} commented on your post.`,
        timestamp: Timestamp.now(),
        fromUserId: user.uid,
        postId: postId,
      });
    }

    setNewComment('');
    setReplyTo(null);
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleAddComment}>
        <div className="flex items-center">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? `Replying to ${replyTo.username}...` : 'Add a comment...'}
            className="w-full p-2 border rounded-lg"
          />
          <button type="submit" className="ml-2 bg-black text-white p-2 rounded-lg">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
      <div className="mt-4 space-y-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((comment) => (
            <Comment key={comment.id} postId={postId} comment={comment} allComments={comments} setReplyTo={setReplyTo} level={0} />
          ))}
      </div>
    </div>
  );
};

const Comment = ({ postId, comment, allComments, setReplyTo, level }) => {
  const { user } = useAuth();
  const replies = allComments.filter((c) => c.replyToId === comment.id);

  const handleUpvote = async () => {
    if (!user) return;
    const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
    if (comment.upvotes?.includes(user.uid)) {
      await updateDoc(commentRef, {
        upvotes: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(commentRef, {
        upvotes: arrayUnion(user.uid)
      });

      if (comment.userId !== user.uid) {
        const notificationsCollection = collection(db, 'users', comment.userId, 'notifications');
        await addDoc(notificationsCollection, {
          type: 'upvote',
          message: `${profile.username} upvoted your comment.`,
          timestamp: Timestamp.now(),
          fromUserId: user.uid,
          postId: postId,
        });
      }
    }
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div key={comment.id} className="flex items-start">
        <Link to={`/${comment.username}`}>
          <img
            src={comment.profilePhoto || 'https://via.placeholder.com/150'}
            alt={comment.username}
            className="w-8 h-8 rounded-full mr-3"
          />
        </Link>
        <div className="flex-1">
          <p className="font-bold">{comment.username}</p>
          <p>{comment.text}</p>
          <div className="flex items-center mt-1">
            <button onClick={handleUpvote} className="flex items-center space-x-1 text-gray-500 hover:text-green-600 text-xs">
              <ArrowUp className={`h-4 w-4 ${comment.upvotes?.includes(user?.uid) ? 'text-green-600' : ''}`} />
              <span>{comment.upvotes?.length || 0}</span>
            </button>
            <button
              onClick={() => setReplyTo(comment)}
              className="text-xs text-gray-500 ml-4"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {replies.map((reply) => (
          <Comment key={reply.id} postId={postId} comment={reply} allComments={allComments} setReplyTo={setReplyTo} level={level + 1} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
