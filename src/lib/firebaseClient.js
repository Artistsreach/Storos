import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // Import getFunctions
import { generateStoreUrl } from "./utils.js"; // Explicitly import from .js file

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI8iWuP1P20OZDIGsUNX6BluSCF40A7AU",
  authDomain: "fresh-dfe30.firebaseapp.com",
  projectId: "fresh-dfe30",
  storageBucket: "fresh-dfe30.firebasestorage.app",
  messagingSenderId: "925329325314",
  appId: "1:925329325314:web:67f69c02b9ff7580e6561b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
const firestoreDb = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // Initialize and export functions

// Enable offline persistence for Firestore
try {
  enableIndexedDbPersistence(firestoreDb, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED // Optional: Or a specific size in bytes
  })
  .then(() => {
    console.log("Firestore offline persistence enabled.");
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn("Firestore offline persistence failed: Multiple tabs open or other precondition failed.", err);
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn("Firestore offline persistence failed: Browser does not support required features.", err);
    } else {
      console.error("Firestore offline persistence failed with error: ", err);
    }
  });
} catch (err) {
  console.error("Error enabling Firestore offline persistence: ", err);
}

export const db = firestoreDb;

/**
 * Checks if a store name (after conversion to a URL slug) is already taken in Firestore.
 * @param {string} storeName The store name to check.
 * @returns {Promise<boolean>} True if the name is taken, false otherwise.
 * @throws {Error} If Firestore query fails.
 */
export async function isStoreNameTaken(storeName) {
  if (!storeName || typeof storeName !== 'string' || storeName.trim() === '') {
    return false;
  }

  const nameToQuery = storeName.trim().toLowerCase();

  try {
    const storesCollectionRef = collection(db, "stores");
    
    const q = query(storesCollectionRef, where("name_lowercase", "==", nameToQuery), limit(1));
    
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking store name availability in Firestore:", error);
    throw new Error("Failed to check store name availability due to a database error.");
  }
}
