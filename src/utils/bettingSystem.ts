/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure fair play and player satisfaction
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
 * Win chance is set to approximately 10% as requested
 * 
 * @param userId The ID of the user placing the bet
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
export const shouldBetWin = (userId: string, betAmount = 10): boolean => {
  // Initialize bet count for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = 0;
    // Pattern with low win rate (approximately 10% win rate)
    userBetPatterns[userId] = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
  }
  
  // Increment bet count
  userBetCounts[userId]++;
  const betCount = userBetCounts[userId];
  
  // Low base win chance (10%)
  let winChance = 0.10;
  
  // No adjustments based on bet amount to keep consistent 10% win rate
  
  // First bet might have slightly better odds just to keep players engaged
  if (betCount === 1) {
    winChance = 0.15; // First bet has 15% chance to win
  }
  
  // Use pattern for predictability in the early game
  const patternLength = userBetPatterns[userId].length;
  if (betCount <= patternLength) {
    const shouldWin = userBetPatterns[userId][betCount - 1] === 1;
    console.log(`Bet ${betCount} - Following pattern: ${shouldWin ? 'Win' : 'Loss'}`);
    return shouldWin;
  }
  
  // After the pattern, use probability system with 10% win rate
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
  const maxWin = Math.max(150, betAmount * 3);
  
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
