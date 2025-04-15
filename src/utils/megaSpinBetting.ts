
/**
 * MegaSpin Betting System Utility
 * Controls winning odds for the MegaSpin game with a specific pattern:
 * - First 2 bets win
 * - Next 2 bets lose
 * - Next 3 bets win
 * - Next 5 bets lose
 * - Win 1 bet
 * - Lose 2 bets
 * Loop this pattern
 */

// Track how many bets each user has made
const userBetCounts: Record<string, number> = {};

// Define winning pattern: 1 = win, 0 = lose
const DEFAULT_PATTERN = [
  // First 2 bets win
  1, 1,
  // Next 2 bets lose
  0, 0,
  // Next 3 bets win
  1, 1, 1,
  // Next 5 bets lose
  0, 0, 0, 0, 0,
  // Win 1 bet
  1,
  // Lose 2 bets
  0, 0
];

/**
 * Determines if the user's bet should win based on the specified pattern
 * 
 * @param userId The ID of the user placing the bet
 * @returns Whether this bet should win
 */
export const shouldMegaSpinWin = (userId: string): boolean => {
  // Initialize bet count for new users
  if (!userBetCounts[userId]) {
    userBetCounts[userId] = 0;
  }
  
  // Increment bet count
  userBetCounts[userId]++;
  const betCount = userBetCounts[userId];
  
  // Get position in pattern (use modulo to loop pattern)
  const patternPosition = (betCount - 1) % DEFAULT_PATTERN.length;
  const shouldWin = DEFAULT_PATTERN[patternPosition] === 1;
  
  console.log(`MegaSpin Bet ${betCount} - Pattern position ${patternPosition}: ${shouldWin ? 'Win' : 'Loss'}`);
  return shouldWin;
};

/**
 * Calculates winning amount based on matched symbols and bet amount
 * 
 * @param betAmount The amount bet
 * @param matchCount Number of matching symbols (3, 4, or 5)
 * @param symbolMultiplier Base multiplier for the matched symbol
 * @returns The calculated win amount
 */
export const calculateMegaSpinWin = (
  betAmount: number, 
  matchCount: number, 
  symbolMultiplier: number
): number => {
  // Match count multipliers
  const matchMultipliers = {
    3: 1,    // 3 matches: 1x symbol multiplier
    4: 2.5,  // 4 matches: 2.5x symbol multiplier
    5: 5     // 5 matches: 5x symbol multiplier
  };
  
  // Get the multiplier based on match count (default to 1 if not found)
  const matchMultiplier = matchMultipliers[matchCount as keyof typeof matchMultipliers] || 1;
  
  // Calculate final win amount
  const winAmount = betAmount * symbolMultiplier * matchMultiplier;
  
  return Math.floor(winAmount);
};

/**
 * Resets the betting count for a user, for example when they explicitly reset
 * or start a new session
 * 
 * @param userId The ID of the user to reset
 */
export const resetMegaSpinBetCount = (userId: string): void => {
  if (userBetCounts[userId]) {
    userBetCounts[userId] = 0;
  }
};

/**
 * Gets the current bet count for a user
 * 
 * @param userId The ID of the user
 * @returns The current bet count for the user
 */
export const getMegaSpinBetCount = (userId: string): number => {
  return userBetCounts[userId] || 0;
};
