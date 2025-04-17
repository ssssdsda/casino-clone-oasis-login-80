// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, collection, setDoc, getDoc, updateDoc } from "firebase/firestore";

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
let app;
let analytics = null;
let auth = null;
let db = null;

// Set up real-time balance updates with improved reliability
const setupBalanceListener = (userId, callback) => {
  if (!userId || !db) {
    console.log("Balance listener setup failed - missing userId or db", { userId, hasDb: !!db });
    return null;
  }
  
  try {
    console.log(`Setting up enhanced balance listener for user: ${userId}`);
    const userRef = doc(db, "users", userId);
    
    // Use onSnapshot with immediate callback and server prioritization
    const unsubscribe = onSnapshot(
      userRef, 
      {
        includeMetadataChanges: true // This ensures we get updates even with cached data
      },
      (doc) => {
        if (doc.exists() && doc.data().balance !== undefined) {
          const newBalance = doc.data().balance;
          console.log(`Balance update received: ${newBalance} (from: ${doc.metadata.fromCache ? 'cache' : 'server'})`);
          
          // Always trigger callback regardless of source to ensure UI is in sync
          callback(newBalance);
          
          // Update localStorage to keep local state in sync with Firebase
          try {
            const storedUser = localStorage.getItem('casinoUser');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              if (userData.balance !== newBalance) {
                userData.balance = newBalance;
                localStorage.setItem('casinoUser', JSON.stringify(userData));
                console.log("Updated local storage with new balance:", newBalance);
              }
            }
          } catch (err) {
            console.error("Error updating local storage:", err);
          }
        } else {
          console.log("Document exists but no balance found", doc.exists());
        }
      }, 
      (error) => {
        console.error("Balance listener error:", error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error("Balance listener setup error:", error);
    return null;
  }
};

// Create functions to manage game betting system settings
const getBettingSystemSettings = async () => {
  if (!db) return null;
  
  try {
    const settingsRef = doc(db, "gameSettings", "bettingSystem");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    } else {
      // Create default settings if none exist
      const defaultSettings = {
        minBet: 10,
        maxBet: 1000,
        winPatterns: {
          aviator: [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
          superAce: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0]
        },
        referralBonus: 119,
        depositBonusThreshold: 500,
        depositBonusAmount: 500,
        lastUpdated: new Date()
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error getting betting system settings:", error);
    return null;
  }
};

const updateBettingSystemSettings = async (newSettings) => {
  if (!db) return false;
  
  try {
    const settingsRef = doc(db, "gameSettings", "bettingSystem");
    await updateDoc(settingsRef, {
      ...newSettings,
      lastUpdated: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error updating betting system settings:", error);
    return false;
  }
};

// Initialize Firebase with error handling
try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Set persistence to local to maintain session across page reloads
  if (auth) {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Firebase persistence error:", error);
      });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = null;
}

// Export all variables after initialization
export { 
  app, 
  analytics, 
  auth, 
  db, 
  setupBalanceListener, 
  getBettingSystemSettings, 
  updateBettingSystemSettings 
};
export default app;
