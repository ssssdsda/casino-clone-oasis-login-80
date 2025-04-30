// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, onSnapshot, collection, query, where, getDocs, setDoc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeFcEoUHonLQ13yyhtFZvbNw9Qk91Tuz0",
  authDomain: "jjjjj-95391.firebaseapp.com",
  projectId: "jjjjj-95391",
  storageBucket: "jjjjj-95391.firebasestorage.app",
  messagingSenderId: "973934686350",
  appId: "1:973934686350:web:904a9860d211b1736e59df",
  measurementId: "G-3YPMC06R8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

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

// Function to get user profile by phone number
const getUserByPhone = async (phoneNumber) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user by phone:", error);
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

// Function to record betting history
const recordBet = async (userId, gameType, betAmount, winAmount, details) => {
  if (!db || !userId) return false;
  
  try {
    await addDoc(collection(db, "bets"), {
      userId,
      gameType,
      betAmount,
      winAmount,
      details,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error recording bet:", error);
    return false;
  }
};

// Function to update user balance
const updateUserBalance = async (userId, newBalance) => {
  if (!db || !userId) return false;
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      balance: newBalance,
      lastUpdated: serverTimestamp()
    });
    console.log(`Updated balance for user ${userId} to ${newBalance}`);
    return true;
  } catch (error) {
    console.error("Error updating user balance:", error);
    return false;
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

// Export all variables and functions
export { 
  app, 
  analytics, 
  db, 
  setupBalanceListener,
  getUserByPhone,
  getBettingSystemSettings, 
  updateBettingSystemSettings,
  recordBet,
  updateUserBalance
};
export default app;
