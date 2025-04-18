
/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure specific win patterns
 */

import { db, getBettingSystemSettings } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Store user session data to track bets across sessions
let betHistory: Array<{
  userId: string;
  didWin: boolean;
  timestamp: number;
}> = [];

// Track how many bets each user has made in the current session
const userBetCounts: Record<string, number> = {};

// Track the specific pattern of wins and losses
const userBetPatterns: Record<string, number[]> = {};

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
      superAce: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0]
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
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
export const shouldBetWin = async (userId: string, betAmount = 10): Promise<boolean> => {
  // Initialize bet count for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = 0;
    
    // Get patterns from Firebase settings
    const settings = await getSettings();
    userBetPatterns[userId] = settings.winPatterns?.aviator || 
      [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  }
  
  // Increment bet count
  userBetCounts[userId]++;
  const betCount = userBetCounts[userId];
  
  // For larger bets (>200), never win
  if (betAmount > 200) {
    console.log(`Bet ${betCount} - Large bet amount (${betAmount}), forced loss`);
    return false;
  }
  
  // For bets within the predefined pattern, return the predetermined result
  const patternLength = userBetPatterns[userId].length;
  if (betCount <= patternLength) {
    const shouldWin = userBetPatterns[userId][betCount - 1] === 1;
    console.log(`Bet ${betCount} - Following pattern: ${shouldWin ? 'Win' : 'Loss'}`);
    return shouldWin;
  }
  
  // After the pattern, repeat the pattern
  const patternPosition = (betCount - 1) % patternLength;
  const shouldWin = userBetPatterns[userId][patternPosition] === 1;
  
  console.log(`Bet ${betCount} - Pattern position ${patternPosition}: ${shouldWin ? 'Win' : 'Loss'}`);
  return shouldWin;
};

/**
 * Calculates a winning amount that's capped at 100
 * @param betAmount The original bet amount
 * @param multiplier The game's standard multiplier
 * @returns A winning amount capped at 100
 */
export const calculateWinAmount = (betAmount: number, multiplier: number): number => {
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Cap the win amount at 100
  if (winAmount > 100) {
    winAmount = 100;
  }
  
  return Math.floor(winAmount);
};

/**
 * Generates a referral code for a user
 * Uses the user ID directly as the referral code
 * 
 * @param userId The ID of the user
 * @returns The user ID as the referral code
 */
export const generateReferralCode = (userId: string): string => {
  // Using user ID directly as referral code ensures uniqueness
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
    // In a real implementation, this would store the referral in the database
    // which is handled by Firebase Firestore in the AuthContext
    console.log(`User ${referrerId} referred user ${referredId}`);
    return true;
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
};

export { refreshSettings, getSettings };
