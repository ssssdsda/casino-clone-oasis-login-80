/**
 * Betting System Utility
 * Controls winning odds for casino games to ensure only 1 out of 5 bets wins
 * and the winning amount is capped at 50-100
 */

// Store user session data to track bets across sessions
let betHistory: Array<{
  userId: string;
  didWin: boolean;
  timestamp: number;
}> = [];

// Track how many consecutive losses per user
const userConsecutiveLosses: Record<string, number> = {};

/**
 * Determines if a bet should win based on the 1/5 win ratio system
 * @param userId The ID of the user placing the bet
 * @returns Whether this bet should win
 */
export const shouldBetWin = (userId: string): boolean => {
  const now = Date.now();
  
  // Remove bets older than 10 minutes to keep history fresh
  betHistory = betHistory.filter(bet => (now - bet.timestamp) < 600000);
  
  // Get recent bets (last 5)
  const recentBets = betHistory.slice(-5);
  const recentWins = recentBets.filter(bet => bet.didWin).length;
  
  // If we already have a winner in the last 5 bets, this bet should lose
  if (recentWins >= 1) {
    // Record the loss
    betHistory.push({
      userId,
      didWin: false,
      timestamp: now
    });
    
    // Track consecutive losses for this user
    userConsecutiveLosses[userId] = (userConsecutiveLosses[userId] || 0) + 1;
    
    return false;
  }
  
  // Check if user has had many consecutive losses (pity system)
  // If they've lost 8+ times in a row, give them a higher chance to win
  const userLosses = userConsecutiveLosses[userId] || 0;
  const winChance = userLosses >= 8 ? 0.5 : 0.2;  // 50% chance after 8 losses, otherwise 20%
  
  // Determine if they win based on the chance
  const didWin = Math.random() < winChance;
  
  // Record the result
  betHistory.push({
    userId,
    didWin,
    timestamp: now
  });
  
  // Reset or increment consecutive losses
  if (didWin) {
    userConsecutiveLosses[userId] = 0;
  } else {
    userConsecutiveLosses[userId] = (userConsecutiveLosses[userId] || 0) + 1;
  }
  
  return didWin;
};

/**
 * Calculates a winning amount that's capped between 50-100
 * @param betAmount The original bet amount
 * @param multiplier The game's standard multiplier
 * @returns A winning amount between 50-100
 */
export const calculateWinAmount = (betAmount: number, multiplier: number): number => {
  // Calculate the standard win amount
  let winAmount = betAmount * multiplier;
  
  // Cap the win amount between 50-100
  if (winAmount > 100) {
    winAmount = 50 + Math.random() * 50; // Random value between 50-100
  } else if (winAmount < 50) {
    winAmount = 50; // Minimum win of 50
  }
  
  return Math.floor(winAmount);
};
