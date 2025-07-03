import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseClient';
import { onSnapshot, doc } from 'firebase/firestore';

const CreditsDisplay = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (user) {
      const creditsRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(creditsRef, (doc) => {
        if (doc.exists()) {
          setCredits(doc.data().credits);
        } else {
          setCredits(0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-neutral-800 p-2 rounded-full shadow-lg flex items-center gap-2 z-50">
      <Coins className="h-6 w-6 text-yellow-500" />
      <span className="font-bold text-lg">{credits}</span>
    </div>
  );
};

export default CreditsDisplay;
