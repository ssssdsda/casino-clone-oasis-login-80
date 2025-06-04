
/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure specific win patterns
 */

import { 
  db, 
  getBettingSystemSettings, 
  recordBet, 
  updateUserBalance, 
  getGameWinPattern, 
  getGameWinRatio, 
  shouldGameBetWin,
  generateUniqueReferralCode,
  recordReferral 
} from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Store user session data to track bets across sessions
let betHistory: Array<{
  userId: string;
  gameType: string;
  didWin: boolean;
  timestamp: number;
}> = [];

// Track how many bets each user has made in the current session
const userBetCounts: Record<string, Record<string, number>> = {};

// Track the specific pattern of wins and losses
const userBetPatterns: Record<string, Record<string, number[]>> = {};

// Cached betting system settings
let cachedSettings: any = null;

/**
 * Get the betting system settings from Firebase or cache
 */
const getSettings = async () => {
  if (cachedSettings) return cachedSettings;
  
  const settings = await getBettingSystemSettings();
  if (settings) {
    cachedSettings = settings;
    return settings;
  }
  
  // Default settings if Firebase fails
  return {
    minBet: 10,
    maxBet: 1000,
    winPatterns: {
      aviator: [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      superAce: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
      goldenBasin: [1, 0, 0, 0, 1, 0, 0, 0, 0],
      coinUp: [1, 0, 0, 1, 0, 0, 0, 0, 1],
      fruityBonanza: [1, 0, 0, 0, 1, 0, 0, 0, 0],
      megaSpin: [1, 0, 0, 0, 1, 0, 0, 1, 0],
      fortuneGems: [1, 0, 0, 0, 0, 1, 0, 0, 0],
      coins: [1, 0, 0, 0, 0, 0, 1, 0, 0],
      superElement: [1, 0, 0, 0, 1, 0, 0, 1, 0],
      bookOfDead: [1, 0, 0, 0, 1, 0, 0, 1, 0],
    },
    winRatios: {
      aviator: 0.25,
      superAce: 0.3,
      goldenBasin: 0.2,
      coinUp: 0.25,
      fruityBonanza: 0.2,
      megaSpin: 0.3,
      fortuneGems: 0.2,
      coins: 0.2,
      superElement: 0.25,
      bookOfDead: 0.25
    },
    referralBonus: 119
  };
};

/**
 * Refresh settings from Firebase
 */
const refreshSettings = () => {
  cachedSettings = null;
};

/**
 * Determines if a bet should win based on the specified pattern
 * 
 * @param userId The ID of the user placing the bet
 * @param gameType The type of game being played
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
export const shouldBetWin = async (userId: string, gameType = 'superAce', betAmount = 10): Promise<boolean> => {
  try {
    // Use the Firebase function for consistency across all games
    return await shouldGameBetWin(userId, gameType, betAmount);
  } catch (error) {
    console.error("Error determining win:", error);
    // Default to a loss if there's an error
    return false;
  }
};

/**
 * Calculates a winning amount based on configured settings
 * @param betAmount The original bet amount
 * @param multiplier The game's standard multiplier
 * @returns A winning amount based on settings
 */
export const calculateWinAmount = async (betAmount: number, multiplier: number): Promise<number> => {
  // Get latest settings
  const settings = await getSettings();
  
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Apply maximum win cap if defined in settings
  const maxWin = settings.maxWin || 100;
  if (winAmount > maxWin) {
    winAmount = maxWin;
  }
  
  return Math.floor(winAmount);
};

/**
 * Handles a bet using the Firebase system
 * @param userId The user ID
 * @param gameType The type of game being played
 * @param betAmount The bet amount
 * @param currentBalance The user's current balance
 */
export const placeBet = async (
  userId: string,
  gameType: string,
  betAmount: number,
  currentBalance: number
): Promise<{
  shouldWin: boolean;
  newBalance: number;
}> => {
  // Check if bet amount is within limits
  const settings = await getSettings();
  const minBet = settings.minBet || 10;
  const maxBet = settings.maxBet || 1000;
  
  if (betAmount < minBet || betAmount > maxBet) {
    throw new Error(`Bet amount must be between ${minBet} and ${maxBet}`);
  }
  
  // Check if user has enough balance
  if (currentBalance < betAmount) {
    throw new Error("Insufficient balance");
  }
  
  // Deduct bet amount from balance
  const newBalance = currentBalance - betAmount;
  await updateUserBalance(userId, newBalance);
  
  // Determine if the bet should win using our enhanced system
  const shouldWin = await shouldBetWin(userId, gameType, betAmount);
  
  // Record the bet
  await recordBet(userId, gameType, betAmount, 0, {
    shouldWin,
    timestamp: Date.now()
  });
  
  return {
    shouldWin,
    newBalance
  };
};

/**
 * Completes a bet by awarding winnings if applicable
 * @param userId The user ID
 * @param gameType The type of game being played
 * @param betAmount The original bet amount
 * @param winAmount The win amount (0 if no win)
 * @param currentBalance The user's current balance after the bet was placed
 */
export const completeBet = async (
  userId: string,
  gameType: string,
  betAmount: number,
  winAmount: number,
  currentBalance: number
): Promise<number> => {
  if (winAmount > 0) {
    // Add win amount to balance
    const newBalance = currentBalance + winAmount;
    await updateUserBalance(userId, newBalance);
    
    // Update the bet record
    await recordBet(userId, gameType, betAmount, winAmount, {
      isWin: true,
      timestamp: Date.now()
    });
    
    return newBalance;
  }
  
  // For losses, just record the completed bet
  await recordBet(userId, gameType, betAmount, 0, {
    isWin: false,
    timestamp: Date.now()
  });
  
  return currentBalance;
};

/**
 * Generates a unique referral code for a user
 * Uses the Firebase function to ensure uniqueness
 * 
 * @param userId The ID of the user
 * @returns A unique referral code for the user
 */
export const generateReferralCode = async (userId: string): Promise<string> => {
  // Use Firebase function to generate and store a unique referral code
  return await generateUniqueReferralCode(userId);
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
    // Use Firebase function to record the referral
    return await recordReferral(referrerId, referredId);
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
};

export { refreshSettings, getSettings };
