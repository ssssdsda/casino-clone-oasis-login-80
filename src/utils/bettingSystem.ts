
/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure specific win patterns
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
 * Determines if a bet should win based on the specified pattern:
 * - First 2 bets win
 * - Next 3 bets lose
 * - Next 1 bet wins
 * - Next 2 bets lose
 * - Next 2 bets win
 * - Next 5 bets lose
 * Then repeat the pattern
 * 
 * @param userId The ID of the user placing the bet
 * @returns Whether this bet should win
 */
export const shouldBetWin = (userId: string): boolean => {
  // Initialize bet count for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = 0;
    userBetPatterns[userId] = [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  }
  
  // Increment bet count
  userBetCounts[userId]++;
  const betCount = userBetCounts[userId];
  
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
  
  // For larger bets (>200), never win
  const betAmount = 200; // This would normally come from the bet context
  if (betAmount > 200) {
    console.log(`Bet ${betCount} - Large bet amount (${betAmount}), forced loss`);
    return false;
  }
  
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
