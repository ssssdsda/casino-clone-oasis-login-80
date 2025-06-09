
import { supabase } from '@/integrations/supabase/client';

interface GameControlSettings {
  id: string;
  game_type: string;
  min_bet: number;
  max_bet: number;
  win_ratio: number;
  max_win: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface BetTransaction {
  id: string;
  user_id: string;
  game_type: string;
  bet_amount: number;
  win_amount: number | null;
  result: string | null;
  multiplier: number | null;
  created_at: string;
}

// Get all game control settings using existing betting_system_settings table
export const getAllGameSettings = async (): Promise<GameControlSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('betting_system_settings')
      .select('*')
      .order('game_type', { ascending: true });

    if (error) {
      console.error('Error fetching game settings:', error);
      return [];
    }

    return (data || []).map(setting => ({
      id: setting.id,
      game_type: setting.game_type,
      min_bet: setting.min_bet || 10,
      max_bet: setting.max_bet || 1000,
      win_ratio: setting.win_ratio || 0.25,
      max_win: setting.max_win || 5000,
      is_enabled: setting.is_enabled || true,
      created_at: setting.created_at || new Date().toISOString(),
      updated_at: setting.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error in getAllGameSettings:', error);
    return [];
  }
};

// Get specific game settings
export const getGameSettings = async (gameType: string): Promise<GameControlSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('betting_system_settings')
      .select('*')
      .eq('game_type', gameType)
      .single();

    if (error) {
      console.error('Error fetching game settings for', gameType, ':', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      game_type: data.game_type,
      min_bet: data.min_bet || 10,
      max_bet: data.max_bet || 1000,
      win_ratio: data.win_ratio || 0.25,
      max_win: data.max_win || 5000,
      is_enabled: data.is_enabled || true,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getGameSettings:', error);
    return null;
  }
};

// Update game settings
export const updateGameSettings = async (
  gameType: string, 
  settings: Partial<GameControlSettings>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('betting_system_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('game_type', gameType);

    if (error) {
      console.error('Error updating game settings:', error);
      return false;
    }

    console.log(`Game settings updated for ${gameType}`);
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
      .from('betting_system_settings')
      .insert({
        game_type: settings.game_type,
        min_bet: settings.min_bet,
        max_bet: settings.max_bet,
        win_ratio: settings.win_ratio,
        max_win: settings.max_win,
        is_enabled: settings.is_enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating game settings:', error);
      return false;
    }

    console.log(`Game settings created for ${settings.game_type}`);
    return true;
  } catch (error) {
    console.error('Error in createGameSettings:', error);
    return false;
  }
};

// Determine if player should win based on game settings
export const shouldPlayerWin = async (
  userId: string, 
  gameType: string, 
  betAmount: number
): Promise<boolean> => {
  try {
    const gameSettings = await getGameSettings(gameType);
    if (!gameSettings || !gameSettings.is_enabled) {
      return false;
    }

    // Check if user has reached daily win limit using existing bets table
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayWins } = await supabase
      .from('bets')
      .select('win_amount')
      .eq('user_id', userId)
      .eq('game_type', gameType)
      .eq('result', 'win')
      .gte('created_at', today.toISOString());

    const totalWinToday = todayWins?.reduce((sum, bet) => sum + (bet.win_amount || 0), 0) || 0;

    if (totalWinToday >= gameSettings.max_win) {
      console.log(`User ${userId} has reached daily win limit for ${gameType}`);
      return false;
    }

    // Apply win percentage with adjustments for bet size
    let adjustedWinPercentage = gameSettings.win_ratio * 100;
    
    // Reduce win chances for larger bets
    if (betAmount > gameSettings.max_bet * 0.5) {
      adjustedWinPercentage *= 0.7;
    }

    const shouldWin = Math.random() < (adjustedWinPercentage / 100);
    console.log(`Should win for ${gameType}: ${shouldWin} (${adjustedWinPercentage}% chance)`);
    
    return shouldWin;
  } catch (error) {
    console.error('Error in shouldPlayerWin:', error);
    return false;
  }
};

// Process bet transaction using existing bets table
export const processBet = async (
  userId: string,
  gameType: string,
  betAmount: number,
  multiplier: number = 2
): Promise<{ success: boolean; winAmount: number; newBalance: number }> => {
  try {
    const gameSettings = await getGameSettings(gameType);
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
    const playerWins = await shouldPlayerWin(userId, gameType, betAmount);
    const winAmount = playerWins ? Math.floor(betAmount * multiplier) : 0;

    // Record bet transaction using existing bets table
    const { error: transactionError } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        game_type: gameType,
        bet_amount: betAmount,
        win_amount: winAmount,
        result: playerWins ? 'win' : 'loss',
        multiplier: multiplier
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

// Get user's betting history using existing bets table
export const getUserBetHistory = async (userId: string, limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('bets')
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
    { game_type: 'aviator', min_bet: 10, max_bet: 1000, win_ratio: 0.25, max_win: 5000 },
    { game_type: 'superAce', min_bet: 10, max_bet: 500, win_ratio: 0.30, max_win: 3000 },
    { game_type: 'goldenBasin', min_bet: 5, max_bet: 800, win_ratio: 0.20, max_win: 4000 },
    { game_type: 'coinUp', min_bet: 10, max_bet: 600, win_ratio: 0.25, max_win: 3500 },
    { game_type: 'fruityBonanza', min_bet: 5, max_bet: 400, win_ratio: 0.20, max_win: 2500 },
    { game_type: 'megaSpin', min_bet: 15, max_bet: 1200, win_ratio: 0.30, max_win: 6000 },
    { game_type: 'fortuneGems', min_bet: 10, max_bet: 500, win_ratio: 0.20, max_win: 3000 },
    { game_type: 'coins', min_bet: 5, max_bet: 300, win_ratio: 0.20, max_win: 2000 },
    { game_type: 'superElement', min_bet: 10, max_bet: 700, win_ratio: 0.25, max_win: 4000 },
    { game_type: 'plinko', min_bet: 10, max_bet: 800, win_ratio: 0.25, max_win: 4500 }
  ];

  for (const game of defaultGames) {
    const existingSettings = await getGameSettings(game.game_type);
    if (!existingSettings) {
      await createGameSettings({
        ...game,
        is_enabled: true
      });
    }
  }
};
