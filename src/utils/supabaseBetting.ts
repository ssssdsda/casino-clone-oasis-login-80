
import { supabase } from '@/integrations/supabase/client';

interface BettingSettings {
  game_type: string;
  min_bet: number;
  max_bet: number;
  win_pattern: number[];
  win_ratio: number;
  max_win: number;
  is_enabled: boolean;
}

interface BetResult {
  shouldWin: boolean;
  newBalance: number;
  betId?: string;
}

// Get betting system settings for a specific game
export const getBettingSettings = async (gameType: string): Promise<BettingSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('betting_system_settings')
      .select('*')
      .eq('game_type', gameType)
      .single();

    if (error) {
      console.error('Error fetching betting settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getBettingSettings:', error);
    return null;
  }
};

// Determine if a bet should win based on game settings
export const shouldBetWin = async (userId: string, gameType: string, betAmount: number): Promise<boolean> => {
  try {
    const settings = await getBettingSettings(gameType);
    if (!settings || !settings.is_enabled) {
      return false;
    }

    // Check if user has reached daily max win
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayBets } = await supabase
      .from('bets')
      .select('win_amount')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .eq('result', 'win');

    const totalWinToday = todayBets?.reduce((sum, bet) => sum + parseFloat(bet.win_amount || '0'), 0) || 0;

    if (totalWinToday >= settings.max_win) {
      return false;
    }

    // Apply win ratio with adjustments for large bets
    let adjustedWinRatio = settings.win_ratio;
    if (betAmount > 200) {
      adjustedWinRatio = settings.win_ratio * 0.5;
    }

    return Math.random() < adjustedWinRatio;
  } catch (error) {
    console.error('Error in shouldBetWin:', error);
    return false;
  }
};

// Place a bet and update user balance
export const placeBet = async (
  userId: string,
  gameType: string,
  betAmount: number
): Promise<BetResult> => {
  try {
    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to get user balance');
    }

    const currentBalance = parseFloat(profile.balance || '0');

    // Check if user has enough balance
    if (currentBalance < betAmount) {
      throw new Error('Insufficient balance');
    }

    // Get betting settings
    const settings = await getBettingSettings(gameType);
    if (!settings) {
      throw new Error('Game settings not found');
    }

    if (betAmount < settings.min_bet || betAmount > settings.max_bet) {
      throw new Error(`Bet amount must be between ${settings.min_bet} and ${settings.max_bet}`);
    }

    // Deduct bet amount from balance
    const newBalance = currentBalance - betAmount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update balance');
    }

    // Determine if bet should win
    const shouldWin = await shouldBetWin(userId, gameType, betAmount);

    // Create bet record
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        game_type: gameType,
        bet_amount: betAmount,
        result: 'pending',
        win_amount: 0
      })
      .select()
      .single();

    if (betError) {
      // Rollback balance update
      await supabase
        .from('profiles')
        .update({ balance: currentBalance })
        .eq('id', userId);
      throw new Error('Failed to create bet record');
    }

    return {
      shouldWin,
      newBalance,
      betId: bet.id
    };
  } catch (error) {
    console.error('Error in placeBet:', error);
    throw error;
  }
};

// Complete a bet with win/loss result
export const completeBet = async (
  userId: string,
  betId: string,
  won: boolean,
  winAmount: number = 0,
  multiplier: number = 1
): Promise<number> => {
  try {
    // Update bet record
    const { error: betError } = await supabase
      .from('bets')
      .update({
        result: won ? 'win' : 'loss',
        win_amount: winAmount,
        multiplier: multiplier
      })
      .eq('id', betId);

    if (betError) {
      throw new Error('Failed to update bet record');
    }

    if (won && winAmount > 0) {
      // Get current balance and add win amount
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to get user balance');
      }

      const currentBalance = parseFloat(profile.balance || '0');
      const newBalance = currentBalance + winAmount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update balance');
      }

      return newBalance;
    }

    // Return current balance for losses
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    return parseFloat(profile?.balance || '0');
  } catch (error) {
    console.error('Error in completeBet:', error);
    throw error;
  }
};

// Update betting system settings (admin only)
export const updateBettingSettings = async (
  gameType: string,
  settings: Partial<BettingSettings>
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
      console.error('Error updating betting settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateBettingSettings:', error);
    return false;
  }
};

// Get user's betting history
export const getUserBets = async (userId: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user bets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserBets:', error);
    return [];
  }
};

// Get all betting settings (for admin panel)
export const getAllBettingSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('betting_system_settings')
      .select('*')
      .order('game_type', { ascending: true });

    if (error) {
      console.error('Error fetching all betting settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllBettingSettings:', error);
    return [];
  }
};
