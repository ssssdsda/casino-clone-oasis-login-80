
/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure fair play and player satisfaction
 */

import { getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Store user session data to track bets across sessions
let betHistory: Array<{
  userId: string;
  didWin: boolean;
  timestamp: number;
  gameType: string;
}> = [];

// Track how many bets each user has made in the current session per game
const userBetCounts: Record<string, Record<string, number>> = {};

// Cache for admin settings
let gameSettingsCache: any = null;
let lastCacheTime = 0;
let gameSettingsListener: any = null;

/**
 * Initialize real-time listener for game settings
 * This ensures all games receive updates when admin changes settings
 */
export const initGameSettingsListener = () => {
  if (gameSettingsListener) return; // Only initialize once
  
  console.log("Initializing real-time game settings listener");
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    gameSettingsListener = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("Real-time game settings update:", data);
        gameSettingsCache = data;
        lastCacheTime = Date.now();
        
        // Dispatch event so games can respond to changes
        window.dispatchEvent(new CustomEvent('gameSettingsUpdated', { detail: data }));
        
        // Store in localStorage as backup
        localStorage.setItem('gameOddsSettings', JSON.stringify(data));
      }
    }, (error) => {
      console.error("Error setting up game settings listener:", error);
    });
  } catch (error) {
    console.error("Failed to initialize game settings listener:", error);
  }
};

// Call this on app initialization
initGameSettingsListener();

/**
 * Fetches game settings from Firebase or falls back to localStorage
 * @returns Game settings object with win rates and other parameters
 */
async function getGameSettings() {
  // Use cache if it's less than 5 minutes old
  const now = Date.now();
  if (gameSettingsCache && (now - lastCacheTime < 5 * 60 * 1000)) {
    return gameSettingsCache;
  }
  
  try {
    // Try to get settings from Firebase
    const settingsRef = doc(db, "admin", "gameSettings");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      // Verify the data has the expected structure before using it
      if (data && data.games) {
        gameSettingsCache = data;
        lastCacheTime = now;
        console.log("Game settings loaded from Firebase:", data);
        return data;
      } else {
        console.warn("Firebase data doesn't have the expected 'games' structure:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching game settings:", error);
  }
  
  // Fall back to localStorage if Firebase fails
  try {
    const localSettings = localStorage.getItem('gameOddsSettings');
    if (localSettings) {
      const parsedSettings = JSON.parse(localSettings);
      // Verify the data has the expected structure before using it
      if (parsedSettings && parsedSettings.games) {
        gameSettingsCache = parsedSettings;
        lastCacheTime = now;
        return parsedSettings;
      }
    }
  } catch (error) {
    console.error("Error fetching local game settings:", error);
  }
  
  // Return default settings as last resort
  const defaultSettings = {
    games: {
      BoxingKing: { 
        winRate: 20, 
        minBet: 10,
        maxBet: 1000,
        maxWin: 10000,
        isActive: true,
        specialRules: { 
          firstTwoBetsWin: true,
          firstTwoBetsMultiplier: 2,
          regularMultiplier: 0.7
        } 
      },
      MoneyGram: { winRate: 20, minBet: 10, maxBet: 1000, maxWin: 5000, isActive: true },
      CoinUp: { winRate: 30, minBet: 5, maxBet: 500, maxWin: 3000, isActive: true },
      SuperAce: { winRate: 25, minBet: 10, maxBet: 500, maxWin: 5000, isActive: true },
      SuperElement: { winRate: 25, minBet: 10, maxBet: 800, maxWin: 6000, isActive: true },
      Plinko: { winRate: 40, minBet: 5, maxBet: 300, maxWin: 3000, isActive: true },
      Aviator: { winRate: 15, minBet: 20, maxBet: 1000, maxWin: 10000, isActive: true },
      GoldenBasin: { winRate: 22, minBet: 10, maxBet: 500, maxWin: 4000, isActive: true },
      // Default values for other games
      default: { winRate: 25, minBet: 1, maxBet: 100, maxWin: 1000, isActive: true }
    }
  };
  
  gameSettingsCache = defaultSettings;
  lastCacheTime = now;
  return defaultSettings;
}

/**
 * Save game settings to Firebase
 * @param settings The game settings to save
 * @returns Promise resolving to true if save was successful
 */
export const saveGameSettings = async (settings: any): Promise<boolean> => {
  try {
    // Validate settings before saving
    if (!settings || !settings.games) {
      console.error("Invalid settings object:", settings);
      return false;
    }
    
    const settingsRef = doc(db, "admin", "gameSettings");
    await setDoc(settingsRef, settings);
    
    // Update cache
    gameSettingsCache = settings;
    lastCacheTime = Date.now();
    
    // Also update localStorage as backup
    localStorage.setItem('gameOddsSettings', JSON.stringify(settings));
    
    console.log("Game settings saved to Firebase successfully");
    return true;
  } catch (error) {
    console.error("Error saving game settings to Firebase:", error);
    return false;
  }
};

/**
 * Determines if a bet should win based on game type and predetermined win rates:
 * - Settings are loaded from admin configuration
 * - Different games have different win rates
 * - Special rules are applied for specific games like Boxing King
 * 
 * @param userId The ID of the user placing the bet
 * @param gameType The type of game being played
 * @param betAmount The bet amount placed by the user (optional)
 * @returns Whether this bet should win
 */
export const shouldBetWin = async (userId: string, gameType: string = 'default', betAmount = 10): Promise<boolean> => {
  // Initialize game counts for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = {};
  }
  
  if (!userBetCounts[userId][gameType]) {
    userBetCounts[userId][gameType] = 0;
  }
  
  // Increment bet count for this game type
  userBetCounts[userId][gameType]++;
  const betCount = userBetCounts[userId][gameType];
  
  // Get admin settings
  const settings = await getGameSettings();
  
  // Ensure games object exists
  if (!settings || !settings.games) {
    console.error("Invalid game settings:", settings);
    return Math.random() < 0.25; // Default 25% win rate as fallback
  }
  
  // Safely access game settings with multiple fallbacks
  const games = settings.games;
  const gameSettings = games && typeof games === 'object' ? 
    (games[gameType] || games.default || { winRate: 25, specialRules: null }) : 
    { winRate: 25, specialRules: null };
  
  let shouldWin = false;
  const winRate = (gameSettings.winRate !== undefined ? gameSettings.winRate : 25) / 100; // Convert percentage to decimal, with fallback
  
  // Apply special rules for specific games
  if (gameType === 'BoxingKing' && gameSettings.specialRules) {
    // First two bets have special pattern if the setting is enabled
    if (gameSettings.specialRules.firstTwoBetsWin && (betCount === 1 || betCount === 2)) {
      shouldWin = true; // First 2 bets always win with higher payouts
    } else {
      // After first 2 bets, use normal win rate
      shouldWin = Math.random() < winRate;
    }
  } else {
    // Standard win rate for all other games
    shouldWin = Math.random() < winRate;
  }
  
  console.log(`Game: ${gameType}, Bet ${betCount} - Win Rate: ${winRate * 100}%, Result: ${shouldWin ? 'Win' : 'Loss'}`);
  
  // Add to history
  betHistory.push({
    userId,
    didWin: shouldWin,
    timestamp: Date.now(),
    gameType
  });
  
  // Keep history manageable
  if (betHistory.length > 100) {
    betHistory.shift();
  }
  
  return shouldWin;
};

/**
 * Calculates a winning amount with special rules based on game type
 * @param betAmount The original bet amount
 * @param multiplier The game's standard multiplier
 * @param gameType The type of game being played
 * @param betCount Number of bets user has made
 * @returns A winning amount based on game rules
 */
export const calculateWinAmount = async (
  betAmount: number, 
  multiplier: number, 
  gameType?: string, 
  betCount?: number
): Promise<number> => {
  // Get admin settings
  const settings = await getGameSettings();
  
  // Ensure games object exists
  if (!settings || !settings.games) {
    console.error("Invalid game settings:", settings);
    return Math.floor(betAmount * multiplier);
  }
  
  // Safely access game settings with multiple fallbacks
  const games = settings.games;
  const gameSettings = games && typeof games === 'object' ? 
    (games[gameType || 'default'] || games.default || { maxWin: 100, specialRules: null }) : 
    { maxWin: 100, specialRules: null };
  
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Special rules for Boxing King
  if (gameType === 'BoxingKing' && betCount !== undefined && gameSettings.specialRules) {
    // First 2 bets have higher payout
    if (betCount === 1 || betCount === 2) {
      winAmount = betAmount * multiplier * (gameSettings.specialRules.firstTwoBetsMultiplier || 2); // Double payout for first 2 bets
    } else {
      winAmount = betAmount * multiplier * (gameSettings.specialRules.regularMultiplier || 0.7); // Reduced payout after first 2 bets
    }
  }
  
  // Apply maximum win cap from admin settings
  const maxWin = gameSettings.maxWin || Math.max(150, betAmount * 3);
  
  if (winAmount > maxWin) {
    winAmount = maxWin;
  }
  
  return Math.floor(winAmount);
};

/**
 * Generates a referral code for a user
 * This function returns the user ID directly as the referral code
 * 
 * @param userId The ID of the user
 * @returns The user ID as the referral code
 */
export const generateReferralCode = (userId: string): string => {
  return userId;
};

/**
 * Tracks a new referral in the system
 * 
 * @param referrerId The ID of the user who referred someone
 * @param referredId The ID of the user who was referred
 * @returns Whether the referral was successfully tracked
 */
export const trackReferral = async (referrerId: string, referredId: string): Promise<boolean> => {
  try {
    // Store the referral in Firebase
    const referralRef = doc(db, "referrals", `${referrerId}_${referredId}`);
    await setDoc(referralRef, {
      referrer: referrerId,
      referred: referredId,
      timestamp: Date.now(),
      bonusPaid: false
    });
    
    console.log(`User ${referrerId} referred user ${referredId}`);
    return true;
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
};

/**
 * Process referral bonus for a user after they make a deposit
 * 
 * @param userId ID of the user who made a deposit
 * @param depositAmount Amount deposited
 * @returns Whether the bonus was processed successfully
 */
export const processReferralBonus = async (userId: string, depositAmount: number): Promise<boolean> => {
  try {
    // Get the user's referrer
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists() || !userDoc.data().referredBy) {
      return false; // No referrer found
    }
    
    const referrerId = userDoc.data().referredBy;
    
    // Check if bonus was already paid
    const referralRef = doc(db, "referrals", `${referrerId}_${userId}`);
    const referralDoc = await getDoc(referralRef);
    
    if (referralDoc.exists() && referralDoc.data().bonusPaid) {
      return false; // Bonus already paid
    }
    
    const referralBonus = 119; // Bonus amount
    
    // Update referral document to mark bonus as paid
    await setDoc(referralRef, {
      referrer: referrerId,
      referred: userId,
      timestamp: Date.now(),
      bonusPaid: true,
      bonusAmount: referralBonus,
      depositAmount: depositAmount
    }, { merge: true });
    
    // Add bonus to referrer's balance
    const referrerRef = doc(db, "users", referrerId);
    const referrerDoc = await getDoc(referrerRef);
    
    if (referrerDoc.exists()) {
      const currentBalance = referrerDoc.data().balance || 0;
      const newBalance = currentBalance + referralBonus;
      
      await setDoc(referrerRef, {
        balance: newBalance
      }, { merge: true });
      
      console.log(`Added ৳${referralBonus} referral bonus to user ${referrerId}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error processing referral bonus:", error);
    return false;
  }
};
