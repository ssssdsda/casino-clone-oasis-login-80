
import { shouldPlayerWin, processBet } from '@/utils/supabaseGameControl';
import { formatCurrency } from '@/utils/currency';

// Game types mapping for Supabase
export const GAME_TYPES = {
  aviator: 'aviator',
  superAce: 'superAce', 
  goldenBasin: 'goldenBasin',
  coinUp: 'coinUp',
  fruityBonanza: 'fruityBonanza',
  megaSpin: 'megaSpin',
  fortuneGems: 'fortuneGems',
  coins: 'coins',
  superElement: 'superElement',
  plinko: 'plinko',
  boxingKing: 'boxingKing',
  casinoWin: 'casinoWin',
  moneyGram: 'moneyGram',
  bookOfDead: 'bookOfDead'
} as const;

export type GameType = keyof typeof GAME_TYPES;

// Universal betting function for all games
export const processGameBet = async (
  userId: string,
  gameType: GameType,
  betAmount: number,
  multiplier: number = 2
) => {
  try {
    const result = await processBet(userId, GAME_TYPES[gameType], betAmount, multiplier);
    return result;
  } catch (error) {
    console.error(`Error processing bet for ${gameType}:`, error);
    throw error;
  }
};

// Check if player should win for any game
export const shouldGamePlayerWin = async (
  userId: string,
  gameType: GameType,
  betAmount: number
) => {
  try {
    const shouldWin = await shouldPlayerWin(userId, GAME_TYPES[gameType], betAmount);
    return shouldWin;
  } catch (error) {
    console.error(`Error checking win for ${gameType}:`, error);
    return false;
  }
};

// Initialize all game settings in Supabase
export const initializeAllGameSettings = async () => {
  const { initializeDefaultGameSettings } = await import('@/utils/supabaseGameControl');
  await initializeDefaultGameSettings();
};

// Get game display name
export const getGameDisplayName = (gameType: GameType): string => {
  const displayNames: Record<GameType, string> = {
    aviator: 'Aviator',
    superAce: 'Super Ace',
    goldenBasin: 'Golden Basin', 
    coinUp: 'Coin Up',
    fruityBonanza: 'Fruity Bonanza',
    megaSpin: 'Mega Spin',
    fortuneGems: 'Fortune Gems',
    coins: 'Coins',
    superElement: 'Super Element',
    plinko: 'Plinko',
    boxingKing: 'Boxing King',
    casinoWin: 'Casino Win',
    moneyGram: 'Money Gram',
    bookOfDead: 'Book of Dead'
  };
  
  return displayNames[gameType] || gameType;
};

// Common game result interface
export interface GameResult {
  success: boolean;
  winAmount: number;
  newBalance: number;
  message?: string;
}

// Format game results for display
export const formatGameResult = (result: GameResult, currency: string = 'PKR'): string => {
  if (result.winAmount > 0) {
    return `You Won! ${formatCurrency(result.winAmount)}`;
  }
  return 'Better luck next time!';
};
