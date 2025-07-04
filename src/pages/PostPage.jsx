import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import PostCard from '../components/PostCard';

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPost({ id: postSnap.id, ...postSnap.data() });
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/feed" className="text-blue-500 mb-4 inline-block">&larr; Back to Feed</Link>
      <PostCard post={post} />
    </div>
  );
};

export default PostPage;
