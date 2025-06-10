
import { supabase } from '@/integrations/supabase/client';
import { getGameSettings, processBet } from '@/utils/supabaseGameControl';

export type GameType = 
  | 'aviator' 
  | 'superAce' 
  | 'goldenBasin' 
  | 'coinUp' 
  | 'fruityBonanza' 
  | 'megaSpin' 
  | 'fortuneGems' 
  | 'coins' 
  | 'superElement' 
  | 'plinko' 
  | 'boxingKing' 
  | 'casinoWin' 
  | 'moneyGram' 
  | 'bookOfDead';

interface GameBetResult {
  success: boolean;
  winAmount: number;
  newBalance: number;
  message?: string;
}

// Process game bet with Supabase betting control integration
export const processGameBet = async (
  userId: string,
  gameType: GameType,
  betAmount: number,
  multiplier: number = 2
): Promise<GameBetResult> => {
  try {
    console.log(`Processing bet for ${gameType}: ${betAmount} PKR`);
    
    // Get game settings from Supabase
    const gameSettings = await getGameSettings(gameType);
    
    if (!gameSettings) {
      console.error(`No settings found for game: ${gameType}`);
      throw new Error(`Game ${gameType} is not configured`);
    }

    if (!gameSettings.is_enabled) {
      throw new Error(`Game ${gameType} is currently disabled`);
    }

    // Validate bet amount against game settings
    if (betAmount < gameSettings.min_bet) {
      throw new Error(`Minimum bet for ${gameType} is ${gameSettings.min_bet} PKR`);
    }

    if (betAmount > gameSettings.max_bet) {
      throw new Error(`Maximum bet for ${gameType} is ${gameSettings.max_bet} PKR`);
    }

    // Process the bet using Supabase game control
    const result = await processBet(userId, gameType, betAmount, multiplier);
    
    console.log(`Bet processed for ${gameType}:`, result);
    
    return {
      success: result.success,
      winAmount: result.winAmount,
      newBalance: result.newBalance
    };
    
  } catch (error) {
    console.error(`Error processing bet for ${gameType}:`, error);
    throw error;
  }
};

// Get current game limits from Supabase
export const getGameLimits = async (gameType: GameType) => {
  try {
    const settings = await getGameSettings(gameType);
    
    if (!settings) {
      console.warn(`No settings found for ${gameType}, using defaults`);
      return {
        minBet: 10,
        maxBet: 1000,
        isEnabled: true,
        winRatio: 0.25
      };
    }

    return {
      minBet: settings.min_bet,
      maxBet: settings.max_bet,
      isEnabled: settings.is_enabled,
      winRatio: settings.win_ratio
    };
  } catch (error) {
    console.error(`Error getting limits for ${gameType}:`, error);
    return {
      minBet: 10,
      maxBet: 1000,
      isEnabled: true,
      winRatio: 0.25
    };
  }
};

// Validate bet before processing
export const validateGameBet = async (
  gameType: GameType,
  betAmount: number,
  userBalance: number
) => {
  const limits = await getGameLimits(gameType);
  
  if (!limits.isEnabled) {
    return { valid: false, message: `${gameType} game is currently disabled` };
  }
  
  if (betAmount < limits.minBet) {
    return { valid: false, message: `Minimum bet is ${limits.minBet} PKR` };
  }
  
  if (betAmount > limits.maxBet) {
    return { valid: false, message: `Maximum bet is ${limits.maxBet} PKR` };
  }
  
  if (userBalance < betAmount) {
    return { valid: false, message: 'Insufficient balance' };
  }
  
  return { valid: true, message: 'Bet is valid' };
};
