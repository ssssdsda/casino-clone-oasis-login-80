
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoLZlYqlNBgaSAEwKvJ3MX1VE-mnARxjk",
  authDomain: "riskhaw-7eabf.firebaseapp.com",
  projectId: "riskhaw-7eabf",
  storageBucket: "riskhaw-7eabf.firebasestorage.app",
  messagingSenderId: "755847944149",
  appId: "1:755847944149:web:d30cbddddf0f2040c88f5c",
  measurementId: "G-77W1F0G8QV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Set persistence to local to maintain session across page reloads
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

export const db = getFirestore(app);

// Set up real-time balance updates
export const setupBalanceListener = (userId, callback) => {
  if (!userId) return null;
  
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists() && doc.data().balance !== undefined) {
      callback(doc.data().balance);
    }
  });
};

export default app;
