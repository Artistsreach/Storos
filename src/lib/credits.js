import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebaseClient';

const getUserCreditsRef = (userId) => doc(db, 'users', userId);

export const initializeCredits = async (userId) => {
  const userCreditsRef = getUserCreditsRef(userId);
  const userCreditsSnap = await getDoc(userCreditsRef);

  if (!userCreditsSnap.exists()) {
    await setDoc(userCreditsRef, { credits: 100 });
  }
};

export const getCredits = async (userId) => {
  if (!userId) return 0;
  const userCreditsRef = getUserCreditsRef(userId);
  const userCreditsSnap = await getDoc(userCreditsRef);

  if (userCreditsSnap.exists()) {
    return userCreditsSnap.data().credits;
  } else {
    await initializeCredits(userId);
    return 100;
  }
};

export const canDeductCredits = async (userId, amount) => {
    const currentCredits = await getCredits(userId);
    return currentCredits >= amount;
}

export const deductCredits = async (userId, amount) => {
    if (!userId) throw new Error('User not authenticated');
    
    const hasEnoughCredits = await canDeductCredits(userId, amount);
    if (!hasEnoughCredits) {
        throw new Error('Insufficient credits');
    }

    const userCreditsRef = getUserCreditsRef(userId);
    await updateDoc(userCreditsRef, {
        credits: increment(-amount)
    });
};
