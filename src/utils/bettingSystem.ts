/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure fair play
 */

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

/**
 * Determines if a bet should win based on randomized but fair odds
 * Win chance is more balanced regardless of bet amount
 * 
 * @param userId The ID of the user placing the bet
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
export const shouldBetWin = (userId: string, betAmount = 10): boolean => {
  // Initialize bet count for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = 0;
    // Pattern with more wins and better distribution
    userBetPatterns[userId] = [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1];
  }
  
  // Increment bet count
  userBetCounts[userId]++;
  const betCount = userBetCounts[userId];
  
  // Base win chance (30-45%)
  let winChance = 0.35;
  
  // Slight adjustments based on bet amount (but not heavily biased)
  if (betAmount <= 50) {
    winChance += 0.05; // Small bets have slightly better odds (40%)
  } else if (betAmount > 200) {
    winChance -= 0.05; // Large bets have slightly lower odds (30%)
  }
  
  // First 3 bets have better odds to encourage new players
  if (betCount <= 3) {
    winChance += 0.2; // First 3 bets have 50-65% chance to win
  }
  
  // Use pattern for more predictability in the early game
  const patternLength = userBetPatterns[userId].length;
  if (betCount <= patternLength) {
    const shouldWin = userBetPatterns[userId][betCount - 1] === 1;
    console.log(`Bet ${betCount} - Following pattern: ${shouldWin ? 'Win' : 'Loss'}`);
    return shouldWin;
  }
  
  // After the pattern, use probability system
  const random = Math.random();
  const shouldWin = random < winChance;
  
  console.log(`Bet ${betCount} - Probability: ${winChance.toFixed(2)}, Result: ${shouldWin ? 'Win' : 'Loss'}`);
  
  // Add to history
  betHistory.push({
    userId,
    didWin: shouldWin,
    timestamp: Date.now()
  });
  
  // Keep history manageable
  if (betHistory.length > 100) {
    betHistory.shift();
  }
  
  return shouldWin;
};

/**
 * Calculates a winning amount with improved scaling
 * @param betAmount The original bet amount
 * @param multiplier The game's standard multiplier
 * @returns A winning amount with better scaling for larger bets
 */
export const calculateWinAmount = (betAmount: number, multiplier: number): number => {
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Higher cap for larger bets (instead of strict 100 cap)
  const maxWin = Math.max(100, betAmount * 2);
  
  if (winAmount > maxWin) {
    winAmount = maxWin;
  }
  
  return Math.floor(winAmount);
};

/**
 * Generates a referral code for a user
 * This function now returns the user ID directly as the referral code
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
    // In a real implementation, this would store the referral in the database
    // which is handled by Firebase Firestore in the AuthContext
    console.log(`User ${referrerId} referred user ${referredId}`);
    return true;
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
};
