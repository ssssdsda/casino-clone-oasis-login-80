// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, onSnapshot, collection, query, where, getDocs, setDoc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
const auth = getAuth(app);

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
        maxWinAmount: 5000, // Maximum win amount per bet
        winPatterns: {
          aviator: [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
          superAce: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          goldenBasin: [1, 0, 0, 0, 1, 0, 0, 0, 0],
          coinUp: [1, 0, 0, 1, 0, 0, 0, 0, 1],
          fruityBonanza: [1, 0, 0, 0, 1, 0, 0, 0, 0],
          megaSpin: [1, 0, 0, 0, 1, 0, 0, 1, 0],
          fortuneGems: [1, 0, 0, 0, 0, 1, 0, 0, 0],
          coins: [1, 0, 0, 0, 0, 0, 1, 0, 0],
          superElement: [1, 0, 0, 0, 1, 0, 0, 1, 0], // Added win pattern for Super Element
        },
        winRatios: {
          aviator: 0.25, // 25% win rate
          superAce: 0.3,  // 30% win rate
          goldenBasin: 0.2, // 20% win rate
          coinUp: 0.25, // 25% win rate
          fruityBonanza: 0.2, // 20% win rate
          megaSpin: 0.3, // 30% win rate
          fortuneGems: 0.2, // 20% win rate
          coins: 0.2, // 20% win rate
          superElement: 0.25, // Added win ratio for Super Element
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

// Function to check if a user has reached the maximum win amount
const hasReachedMaxWinAmount = async (userId) => {
  if (!db || !userId) return false;
  
  try {
    // Get current settings
    const settings = await getBettingSystemSettings();
    const maxWinAmount = settings?.maxWinAmount || 5000;
    
    // Get today's bets for this user
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const betsRef = collection(db, "bets");
    const q = query(
      betsRef, 
      where("userId", "==", userId),
      where("timestamp", ">=", todayStart)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Calculate total winnings for today
    let totalWinnings = 0;
    querySnapshot.forEach((doc) => {
      totalWinnings += doc.data().winAmount || 0;
    });
    
    // Return true if user has reached max win amount
    return totalWinnings >= maxWinAmount;
  } catch (error) {
    console.error("Error checking max win amount:", error);
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

// Get game-specific win pattern
const getGameWinPattern = async (gameType) => {
  try {
    const settings = await getBettingSystemSettings();
    if (settings && settings.winPatterns && settings.winPatterns[gameType]) {
      return settings.winPatterns[gameType];
    }
    // Default pattern if specific game pattern not found
    return [1, 0, 0, 0, 1, 0, 0, 0, 0];
  } catch (error) {
    console.error(`Error getting win pattern for ${gameType}:`, error);
    // Return a default pattern
    return [1, 0, 0, 0, 1, 0, 0, 0, 0];
  }
};

// Get game-specific win ratio
const getGameWinRatio = async (gameType) => {
  try {
    const settings = await getBettingSystemSettings();
    if (settings && settings.winRatios && settings.winRatios[gameType]) {
      return settings.winRatios[gameType];
    }
    // Default win ratio if specific game ratio not found
    return 0.25; // 25% win rate
  } catch (error) {
    console.error(`Error getting win ratio for ${gameType}:`, error);
    // Return a default win ratio
    return 0.25;
  }
};

/**
 * Determines if a bet should win based on the specified pattern
 * 
 * @param userId The ID of the user placing the bet
 * @param gameType The type of game being played
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
const shouldBetWin = async (userId: string, gameType = 'superAce', betAmount = 10): Promise<boolean> => {
  try {
    // Use the shouldGameBetWin function for consistency across all games
    return await shouldGameBetWin(userId, gameType, betAmount);
  } catch (error) {
    console.error("Error determining win:", error);
    // Default to a loss if there's an error
    return false;
  }
};

// Check if a bet should win based on game-specific settings
const shouldGameBetWin = async (userId, gameType, betAmount) => {
  if (!userId) return false;
  
  try {
    // Check if user has reached max win amount
    const maxWinReached = await hasReachedMaxWinAmount(userId);
    if (maxWinReached) {
      console.log(`User ${userId} has reached maximum win amount for today`);
      return false;
    }
    
    // Get game-specific win ratio
    const winRatio = await getGameWinRatio(gameType);
    
    // For large bets, make wins less likely
    let adjustedWinRatio = winRatio;
    if (betAmount > 200) {
      adjustedWinRatio = winRatio * 0.5; // Reduce win chance by half for large bets
    }
    
    // Random number between 0 and 1
    const randomValue = Math.random();
    
    // Log for debugging
    console.log(`Game ${gameType} - Win ratio: ${adjustedWinRatio}, Random value: ${randomValue}`);
    
    // Return true if random number is less than win ratio
    return randomValue < adjustedWinRatio;
  } catch (error) {
    console.error("Error in shouldGameBetWin:", error);
    return false;
  }
};

// Export all variables and functions
export { 
  app, 
  analytics, 
  db,
  auth, 
  setupBalanceListener,
  getUserByPhone,
  getBettingSystemSettings, 
  updateBettingSystemSettings,
  recordBet,
  updateUserBalance,
  shouldBetWin,
  getGameWinPattern,
  getGameWinRatio,
  shouldGameBetWin,
  hasReachedMaxWinAmount
};
export default app;
