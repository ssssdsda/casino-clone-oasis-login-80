
import { doc, getDoc, setDoc, DocumentData, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interface for game settings
export interface GameSettings {
  games: {
    [key: string]: {
      winRate?: number;
      minBet?: number;
      maxBet?: number;
      maxWin?: number;
      minWin?: number;
      isActive?: boolean;
      multipliers?: number[];
      payoutRates?: {[key: string]: number};
    }
  }
}

// Track user bet counts for calculating win probabilities
interface UserBetCount {
  [userId: string]: {
    [gameName: string]: number;
  }
}

// Use a module-level variable instead of window property
let userBetCounts: UserBetCount = {};

// Get game settings from Firestore
export const getGameSettings = async (): Promise<GameSettings> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as DocumentData;
      
      // Ensure the data has the required structure
      if (!data.games) {
        data.games = {};
      }

      console.log("Loaded game settings from firestore:", data);
      
      // Dispatch event for real-time updates
      const event = new CustomEvent('gameSettingsLoaded', { detail: data });
      window.dispatchEvent(event);
      
      return data as GameSettings;
    } else {
      // Return default settings if document doesn't exist
      const defaultSettings = { games: {} };
      console.log("No game settings found, using defaults");
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching game settings:', error);
    return { games: {} };
  }
};

// Save game settings to Firestore
export const saveGameSettings = async (settings: GameSettings): Promise<boolean> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    await setDoc(settingsRef, settings, { merge: true });
    
    // Dispatch event for real-time updates
    const event = new CustomEvent('gameSettingsUpdated', { detail: settings });
    window.dispatchEvent(event);
    
    console.log("Game settings saved successfully:", settings);
    return true;
  } catch (error) {
    console.error('Error saving game settings:', error);
    return false;
  }
};

// Update game settings for a specific game
export const updateGameSettings = async (
  game: string, 
  settings: {
    winRate?: number;
    minBet?: number;
    maxBet?: number;
    maxWin?: number;
    minWin?: number;
    isActive?: boolean;
    multipliers?: number[];
    payoutRates?: {[key: string]: number};
  }
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    const docSnap = await getDoc(settingsRef);
    
    let currentSettings: GameSettings;
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      currentSettings = { games: data.games || {} };
    } else {
      currentSettings = { games: {} };
    }
    
    // Update the specific game settings
    currentSettings.games[game] = {
      ...(currentSettings.games[game] || {}),
      ...settings
    };
    
    await setDoc(settingsRef, currentSettings);
    
    // Dispatch event for real-time updates
    const event = new CustomEvent('gameSettingsUpdated', { detail: currentSettings });
    window.dispatchEvent(event);
    
    console.log(`Game settings for ${game} updated successfully:`, settings);
    return true;
  } catch (error) {
    console.error(`Error updating ${game} settings:`, error);
    return false;
  }
};

// Function to determine if a bet should win based on game settings
export const shouldBetWin = async (
  userId: string, 
  gameName: string, 
  betAmount: number = 0
): Promise<boolean> => {
  try {
    // Get game settings
    const gameSettings = await getGameSettings();
    const game = gameSettings.games[gameName];
    
    // Default win rate if not specified in settings
    const winRate = game?.winRate || 20; // 20% default win rate
    
    // Track user bet counts for more sophisticated win patterns
    if (!userBetCounts[userId]) {
      userBetCounts[userId] = {};
    }
    
    if (!userBetCounts[userId][gameName]) {
      userBetCounts[userId][gameName] = 0;
    }
    
    userBetCounts[userId][gameName]++;
    const betCount = userBetCounts[userId][gameName];
    
    // For high bet amounts, lower the win probability
    let adjustedWinRate = winRate;
    if (betAmount > 100) {
      adjustedWinRate = Math.max(5, winRate - 10);
    } else if (betAmount > 50) {
      adjustedWinRate = Math.max(10, winRate - 5);
    }
    
    // Generate random number between 0-100
    const randomChance = Math.random() * 100;
    
    console.log(`Game ${gameName} win check - Rate: ${adjustedWinRate}%, Random: ${randomChance.toFixed(2)}`);
    
    return randomChance <= adjustedWinRate;
  } catch (error) {
    console.error('Error in shouldBetWin:', error);
    
    // Default to a 20% win rate if there's an error
    return Math.random() <= 0.2;
  }
};

// Calculate win amount based on bet amount and multiplier
export const calculateWinAmount = async (
  betAmount: number,
  multiplier: number,
  gameName: string,
  betCount: number = 1
): Promise<number> => {
  try {
    // Get game settings
    const gameSettings = await getGameSettings();
    const game = gameSettings.games[gameName];
    
    // Calculate base win amount
    let winAmount = betAmount * multiplier;
    
    // Apply max win cap if specified in settings
    if (game?.maxWin && winAmount > game.maxWin) {
      winAmount = game.maxWin;
    }
    
    // Apply minimum win if specified in settings
    if (game?.minWin && winAmount < game.minWin) {
      winAmount = game.minWin;
    }
    
    console.log(`Win calculation for ${gameName}: ${betAmount} * ${multiplier} = ${winAmount}`);
    
    // Round to 2 decimal places
    return Math.round(winAmount * 100) / 100;
  } catch (error) {
    console.error('Error calculating win amount:', error);
    
    // Default calculation
    return Math.round(betAmount * multiplier * 100) / 100;
  }
};

// Process referral bonus
export const processReferralBonus = async (
  userId: string,
  referrerId: string,
  amount: number
): Promise<boolean> => {
  try {
    if (!referrerId || referrerId === userId) {
      return false;
    }
    
    // Calculate bonus amount (e.g., 10% of deposit)
    const bonusAmount = amount * 0.1;
    
    if (bonusAmount <= 0) {
      return false;
    }
    
    // Update referrer's balance in Firestore
    const referrerRef = doc(db, "users", referrerId);
    const referrerSnap = await getDoc(referrerRef);
    
    if (!referrerSnap.exists()) {
      console.error(`Referrer ${referrerId} not found`);
      return false;
    }
    
    await updateDoc(referrerRef, {
      balance: increment(bonusAmount),
      referralEarnings: increment(bonusAmount)
    });
    
    // Record the referral bonus transaction
    const transactionRef = doc(db, "transactions", `ref_${Date.now()}`);
    await setDoc(transactionRef, {
      userId: referrerId,
      type: 'referral_bonus',
      amount: bonusAmount,
      referredUserId: userId,
      timestamp: new Date()
    });
    
    console.log(`Referral bonus of ${bonusAmount} processed for ${referrerId} from ${userId}`);
    return true;
  } catch (error) {
    console.error('Error processing referral bonus:', error);
    return false;
  }
};
