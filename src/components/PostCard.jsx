import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp, Share2, Trash2, MessageCircle, Pin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseClient';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, collection, query, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import CommentSection from './CommentSection';
import { useToast } from './ui/use-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postData, setPostData] = useState(post);
  const { id, userId, username, profilePhoto, text, imageUrls, store, upvotes, products, timestamp, pinned } = postData;
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (!post.id) return;
    const postRef = doc(db, 'posts', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        setPostData({ id: doc.id, ...doc.data() });
      }
    });
    return () => unsubscribe();
  }, [post.id]);

  useEffect(() => {
    if (!post.id) return;
    const commentsCollection = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsCollection);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommentCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleUpvote = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', id);
    if (upvotes?.includes(user.uid)) {
      await updateDoc(postRef, {
        upvotes: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(postRef, {
        upvotes: arrayUnion(user.uid)
      });

      if (userId !== user.uid) {
        const notificationsCollection = collection(db, 'users', userId, 'notifications');
        await addDoc(notificationsCollection, {
          type: 'upvote',
          message: `${user.displayName} upvoted your post.`,
          timestamp: Timestamp.now(),
          fromUserId: user.uid,
          postId: id,
        });
      }
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Copied to clipboard!",
      description: "The post link has been copied to your clipboard.",
    });
  };

  const handleDelete = () => {
    if (user && user.uid === userId) {
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (user && user.uid === userId) {
      const postRef = doc(db, 'posts', id);
      await deleteDoc(postRef);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      setIsDeleteModalOpen(false);
      setIsDeleted(true);
    }
  };

  const handlePin = async () => {
    if (user && user.uid === userId) {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        pinned: !pinned
      });
    }
  };

  const timeAgo = timestamp ? formatDistanceToNow(timestamp.toDate(), { addSuffix: true }) : null;

  if (isDeleted) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-4 mb-4 relative">
      {user && user.uid === userId && (
        <button onClick={handlePin} className={`absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white ${pinned ? 'text-yellow-500' : ''}`}>
          <Pin className={`h-5 w-5 ${pinned ? 'fill-current' : ''}`} />
        </button>
      )}
      <div className="flex items-center mb-4">
        <Link to={`/${username}`}>
          <img src={profilePhoto || 'https://via.placeholder.com/150'} alt={username} className="h-10 w-10 rounded-full mr-4" />
        </Link>
        <div className="flex-grow">
          <span className="font-bold dark:text-white">{username}</span>
          {timeAgo && <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>}
        </div>
      </div>
      <Link to={`/post/${id}`}>
        <p className="mb-4 dark:text-gray-300">{text}</p>
        {imageUrls && imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Post image ${index + 1}`} className="rounded-lg object-cover w-full" />
            ))}
          </div>
        )}
      </Link>
      {store && (
        <Link to={`/${store.urlSlug}`} className="block bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700">
          <div className="flex items-center">
            <img src={store.logo_url || 'https://via.placeholder.com/150'} alt={store.name} className="h-12 w-12 rounded-md mr-4" />
            <div>
              <h3 className="font-bold dark:text-white">{store.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{store.description}</p>
            </div>
          </div>
        </Link>
      )}
      {products && products.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2 dark:text-white">Featured Products</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link to={`/${store.urlSlug}/product/${product.id}`} key={product.id} className="border dark:border-neutral-800 rounded-lg p-2 block hover:bg-gray-50 dark:hover:bg-neutral-700">
                <img src={product.images[0]} alt={product.name} className="w-full h-24 object-cover rounded-md" />
                <p className="text-sm mt-2 dark:text-gray-300">{product.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-end mt-4">
        <button onClick={handleUpvote} className="flex items-center space-x-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500">
          <ArrowUp className={`h-5 w-5 ${upvotes?.includes(user?.uid) ? 'text-green-600' : ''}`} />
          <span className="dark:text-gray-400">{upvotes?.length || 0}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 ml-4">
          <MessageCircle className="h-5 w-5" />
          <span className="dark:text-gray-400">{commentCount}</span>
        </button>
        <button onClick={handleShare} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 ml-4">
          <Share2 className="h-5 w-5" />
        </button>
        {user && user.uid === userId && (
          <button onClick={handleDelete} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 ml-4">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentSection postId={id} postAuthorId={userId} />
          </motion.div>
        )}
      </AnimatePresence>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PostCard;
