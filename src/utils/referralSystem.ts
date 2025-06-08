
import { supabase } from '@/integrations/supabase/client';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  is_paid: boolean;
  created_at: string;
}

// Generate unique referral code for user
export const generateReferralCode = async (userId: string): Promise<string> => {
  try {
    // Generate a unique 8-character code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    do {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Check if this code already exists
      const { data: existingCode } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();
      
      if (!existingCode) break;
    } while (true);

    // Update user's profile with the referral code
    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: code })
      .eq('id', userId);

    if (error) {
      console.error('Error updating referral code:', error);
      throw error;
    }

    console.log(`Generated referral code ${code} for user ${userId}`);
    return code;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw error;
  }
};

// Get user by referral code
export const getUserByReferralCode = async (referralCode: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('referral_code', referralCode)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user by referral code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByReferralCode:', error);
    return null;
  }
};

// Get bonus settings from database
export const getBonusSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('bonus_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting bonus settings:', error);
      return {
        referral_bonus: 90,
        registration_bonus: 100
      };
    }

    return data || {
      referral_bonus: 90,
      registration_bonus: 100
    };
  } catch (error) {
    console.error('Error in getBonusSettings:', error);
    return {
      referral_bonus: 90,
      registration_bonus: 100
    };
  }
};

// Award registration bonus
export const awardRegistrationBonus = async (userId: string): Promise<boolean> => {
  try {
    const bonusSettings = await getBonusSettings();
    const registrationBonus = bonusSettings.registration_bonus || 100;

    // Check if user already received registration bonus
    const { data: existingBonus } = await supabase
      .from('bonus_history')
      .select('id')
      .eq('user_id', userId)
      .eq('bonus_type', 'registration')
      .single();

    if (existingBonus) {
      console.log('User already received registration bonus');
      return false;
    }

    // Get current user balance
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user balance:', fetchError);
      return false;
    }

    const newBalance = (userProfile.balance || 0) + registrationBonus;

    // Update user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) {
      console.error('Error updating user balance:', balanceError);
      return false;
    }

    // Record bonus history
    const { error: historyError } = await supabase
      .from('bonus_history')
      .insert({
        user_id: userId,
        bonus_type: 'registration',
        bonus_amount: registrationBonus,
        description: 'Registration bonus'
      });

    if (historyError) {
      console.error('Error recording bonus history:', historyError);
    }

    console.log(`Awarded registration bonus: ${registrationBonus} PKR to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error awarding registration bonus:', error);
    return false;
  }
};

// Process referral bonus
export const processReferralBonus = async (referrerCode: string, newUserId: string): Promise<boolean> => {
  try {
    // Get referrer user
    const referrer = await getUserByReferralCode(referrerCode);
    if (!referrer) {
      console.log('Referrer not found for code:', referrerCode);
      return false;
    }

    // Check if this user was already referred
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      console.log('User already has a referral record');
      return false;
    }

    // Get bonus settings
    const bonusSettings = await getBonusSettings();
    const referralBonus = bonusSettings.referral_bonus || 90;

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: newUserId,
        bonus_amount: referralBonus,
        is_paid: true
      });

    if (referralError) {
      console.error('Error creating referral record:', referralError);
      throw referralError;
    }

    // Update referrer's balance
    const { data: referrerProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', referrer.id)
      .single();

    if (fetchError) {
      console.error('Error fetching referrer balance:', fetchError);
      throw fetchError;
    }

    const newBalance = (referrerProfile.balance || 0) + referralBonus;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', referrer.id);

    if (balanceError) {
      console.error('Error updating referrer balance:', balanceError);
      throw balanceError;
    }

    // Record bonus history
    const { error: historyError } = await supabase
      .from('bonus_history')
      .insert({
        user_id: referrer.id,
        bonus_type: 'referral',
        bonus_amount: referralBonus,
        description: `Referral bonus for user ${newUserId}`
      });

    if (historyError) {
      console.error('Error recording referral bonus history:', historyError);
    }

    console.log(`Processed referral bonus: ${referrer.username} received ${referralBonus} PKR for referring user ${newUserId}`);
    return true;
  } catch (error) {
    console.error('Error processing referral bonus:', error);
    return false;
  }
};

// Get referral stats for user
export const getReferralStats = async (userId: string) => {
  try {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    if (error) {
      console.error('Error fetching referral stats:', error);
      return {
        totalReferrals: 0,
        totalEarned: 0,
        pendingRewards: 0
      };
    }

    const totalReferrals = referrals?.length || 0;
    const totalEarned = referrals?.reduce((sum, ref) => sum + (ref.is_paid ? ref.bonus_amount : 0), 0) || 0;
    const pendingRewards = referrals?.filter(ref => !ref.is_paid).length || 0;

    return {
      totalReferrals,
      totalEarned,
      pendingRewards
    };
  } catch (error) {
    console.error('Error in getReferralStats:', error);
    return {
      totalReferrals: 0,
      totalEarned: 0,
      pendingRewards: 0
    };
  }
};

// Generate referral link
export const generateReferralLink = (referralCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${referralCode}`;
};
