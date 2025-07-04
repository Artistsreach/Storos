import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebaseClient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import UserProfilePage from './UserProfilePage';
import StorePreview from './StorePreview';

const SlugPage = () => {
  const { slug } = useParams();
  const [isUser, setIsUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSlugType = async () => {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('username', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setIsUser(true);
      } else {
        setIsUser(false);
      }
      setLoading(false);
    };

    checkSlugType();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isUser) {
    return <UserProfilePage />;
  } else {
    return <StorePreview />;
  }
};

export default SlugPage;
