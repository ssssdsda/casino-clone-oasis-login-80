
import { supabase } from '@/integrations/supabase/client';

interface GameControlSettings {
  id: string;
  game_name: string;
  min_bet: number;
  max_bet: number;
  win_percentage: number;
  max_daily_win: number;
  is_enabled: boolean;
  house_edge: number;
  created_at: string;
  updated_at: string;
}

interface BetTransaction {
  user_id: string;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  result: 'win' | 'loss';
  multiplier: number;
}

// Get all game control settings
export const getAllGameSettings = async (): Promise<GameControlSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('game_control_settings')
      .select('*')
      .order('game_name', { ascending: true });

    if (error) {
      console.error('Error fetching game settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllGameSettings:', error);
    return [];
  }
};

// Get specific game settings
export const getGameSettings = async (gameName: string): Promise<GameControlSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('game_control_settings')
      .select('*')
      .eq('game_name', gameName)
      .single();

    if (error) {
      console.error('Error fetching game settings for', gameName, ':', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGameSettings:', error);
    return null;
  }
};

// Update game settings
export const updateGameSettings = async (
  gameName: string, 
  settings: Partial<GameControlSettings>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('game_control_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('game_name', gameName);

    if (error) {
      console.error('Error updating game settings:', error);
      return false;
    }

    console.log(`Game settings updated for ${gameName}`);
    return true;
  } catch (error) {
    console.error('Error in updateGameSettings:', error);
    return false;
  }
};

// Create new game settings
export const createGameSettings = async (settings: Omit<GameControlSettings, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('game_control_settings')
      .insert({
        ...settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating game settings:', error);
      return false;
    }

    console.log(`Game settings created for ${settings.game_name}`);
    return true;
  } catch (error) {
    console.error('Error in createGameSettings:', error);
    return false;
  }
};

// Determine if player should win based on game settings
export const shouldPlayerWin = async (
  userId: string, 
  gameName: string, 
  betAmount: number
): Promise<boolean> => {
  try {
    const gameSettings = await getGameSettings(gameName);
    if (!gameSettings || !gameSettings.is_enabled) {
      return false;
    }

    // Check if user has reached daily win limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayWins } = await supabase
      .from('bet_transactions')
      .select('win_amount')
      .eq('user_id', userId)
      .eq('game_name', gameName)
      .eq('result', 'win')
      .gte('created_at', today.toISOString());

    const totalWinToday = todayWins?.reduce((sum, bet) => sum + bet.win_amount, 0) || 0;

    if (totalWinToday >= gameSettings.max_daily_win) {
      console.log(`User ${userId} has reached daily win limit for ${gameName}`);
      return false;
    }

    // Apply win percentage with adjustments for bet size
    let adjustedWinPercentage = gameSettings.win_percentage;
    
    // Reduce win chances for larger bets
    if (betAmount > gameSettings.max_bet * 0.5) {
      adjustedWinPercentage *= 0.7;
    }

    const shouldWin = Math.random() < (adjustedWinPercentage / 100);
    console.log(`Should win for ${gameName}: ${shouldWin} (${adjustedWinPercentage}% chance)`);
    
    return shouldWin;
  } catch (error) {
    console.error('Error in shouldPlayerWin:', error);
    return false;
  }
};

// Process bet transaction
export const processBet = async (
  userId: string,
  gameName: string,
  betAmount: number,
  multiplier: number = 2
): Promise<{ success: boolean; winAmount: number; newBalance: number }> => {
  try {
    const gameSettings = await getGameSettings(gameName);
    if (!gameSettings) {
      throw new Error('Game settings not found');
    }

    // Validate bet amount
    if (betAmount < gameSettings.min_bet || betAmount > gameSettings.max_bet) {
      throw new Error(`Bet amount must be between ${gameSettings.min_bet} and ${gameSettings.max_bet}`);
    }

    // Get user's current balance
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error('Failed to get user balance');
    }

    const currentBalance = userProfile.balance || 0;
    if (currentBalance < betAmount) {
      throw new Error('Insufficient balance');
    }

    // Deduct bet amount
    const { error: deductError } = await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount: -betAmount
    });

    if (deductError) {
      throw new Error('Failed to deduct bet amount');
    }

    // Determine if player wins
    const playerWins = await shouldPlayerWin(userId, gameName, betAmount);
    const winAmount = playerWins ? Math.floor(betAmount * multiplier) : 0;

    // Record bet transaction
    const { error: transactionError } = await supabase
      .from('bet_transactions')
      .insert({
        user_id: userId,
        game_name: gameName,
        bet_amount: betAmount,
        win_amount: winAmount,
        result: playerWins ? 'win' : 'loss',
        multiplier: multiplier,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error recording bet transaction:', transactionError);
    }

    // Add winnings to balance if player wins
    let newBalance = currentBalance - betAmount;
    if (playerWins && winAmount > 0) {
      const { error: winError } = await supabase.rpc('update_user_balance', {
        user_id: userId,
        amount: winAmount
      });

      if (winError) {
        console.error('Error adding winnings:', winError);
      } else {
        newBalance += winAmount;
      }
    }

    return {
      success: true,
      winAmount,
      newBalance
    };
  } catch (error) {
    console.error('Error in processBet:', error);
    throw error;
  }
};

// Get user's betting history
export const getUserBetHistory = async (userId: string, limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('bet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching bet history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserBetHistory:', error);
    return [];
  }
};

// Initialize default game settings
export const initializeDefaultGameSettings = async (): Promise<void> => {
  const defaultGames = [
    { game_name: 'aviator', min_bet: 10, max_bet: 1000, win_percentage: 25, max_daily_win: 5000, house_edge: 5 },
    { game_name: 'super_ace', min_bet: 10, max_bet: 500, win_percentage: 30, max_daily_win: 3000, house_edge: 4 },
    { game_name: 'golden_basin', min_bet: 5, max_bet: 800, win_percentage: 20, max_daily_win: 4000, house_edge: 6 },
    { game_name: 'coin_up', min_bet: 10, max_bet: 600, win_percentage: 25, max_daily_win: 3500, house_edge: 5 },
    { game_name: 'fruity_bonanza', min_bet: 5, max_bet: 400, win_percentage: 20, max_daily_win: 2500, house_edge: 7 },
    { game_name: 'mega_spin', min_bet: 15, max_bet: 1200, win_percentage: 30, max_daily_win: 6000, house_edge: 4 },
    { game_name: 'fortune_gems', min_bet: 10, max_bet: 500, win_percentage: 20, max_daily_win: 3000, house_edge: 6 },
    { game_name: 'coins', min_bet: 5, max_bet: 300, win_percentage: 20, max_daily_win: 2000, house_edge: 8 },
    { game_name: 'super_element', min_bet: 10, max_bet: 700, win_percentage: 25, max_daily_win: 4000, house_edge: 5 },
    { game_name: 'book_of_dead', min_bet: 10, max_bet: 800, win_percentage: 25, max_daily_win: 4500, house_edge: 5 }
  ];

  for (const game of defaultGames) {
    const existingSettings = await getGameSettings(game.game_name);
    if (!existingSettings) {
      await createGameSettings({
        ...game,
        is_enabled: true
      });
    }
  }
};
