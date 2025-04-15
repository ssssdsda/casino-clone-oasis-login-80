
/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure fair play and player satisfaction
 */

// Store user session data to track bets across sessions
let betHistory: Array<{
  userId: string;
  didWin: boolean;
  timestamp: number;
  gameType: string;
}> = [];

// Track how many bets each user has made in the current session per game
const userBetCounts: Record<string, Record<string, number>> = {};

/**
 * Determines if a bet should win based on game type and predetermined win rates:
 * - Boxing King: 20% win rate with first 2 bets higher payout
 * - Money Gram: 20% win rate
 * - Coin Up: 30% win rate
 * 
 * @param userId The ID of the user placing the bet
 * @param gameType The type of game being played
 * @param betAmount The bet amount placed by the user
 * @returns Whether this bet should win
 */
export const shouldBetWin = (userId: string, gameType: string, betAmount = 10): boolean => {
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
  
  let shouldWin = false;
  let winRate = 0;
  
  // Set win rate based on game type
  if (gameType === 'BoxingKing') {
    winRate = 0.2; // 20% win rate
    
    // First two bets have special pattern
    if (betCount === 1 || betCount === 2) {
      shouldWin = true; // First 2 bets always win with higher payouts
    } else {
      // After first 2 bets, use normal win rate
      shouldWin = Math.random() < winRate;
    }
  } 
  else if (gameType === 'MoneyGram') {
    winRate = 0.2; // 20% win rate
    shouldWin = Math.random() < winRate;
  } 
  else if (gameType === 'CoinUp') {
    winRate = 0.3; // 30% win rate
    shouldWin = Math.random() < winRate;
  }
  else {
    // Default pattern from before for other games
    shouldWin = betCount === 1 || betCount === 3;
  }
  
  console.log(`Game: ${gameType}, Bet ${betCount} - Win Rate: ${winRate}, Result: ${shouldWin ? 'Win' : 'Loss'}`);
  
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
export const calculateWinAmount = (
  betAmount: number, 
  multiplier: number, 
  gameType?: string, 
  betCount?: number
): number => {
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Special rules for Boxing King
  if (gameType === 'BoxingKing' && betCount !== undefined) {
    // First 2 bets have higher payout
    if (betCount === 1 || betCount === 2) {
      winAmount = betAmount * multiplier * 2; // Double payout for first 2 bets
    } else {
      winAmount = betAmount * multiplier * 0.7; // Reduced payout after first 2 bets
    }
  }
  
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
