
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

// Get bonus settings from localStorage
export const getBonusSettings = async () => {
  try {
    const savedSettings = localStorage.getItem('bonusSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        referral_bonus: settings.referral_bonus || 90,
        registration_bonus: settings.registration_bonus || 100
      };
    }

    return {
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

// Award registration bonus - Fixed to work properly
export const awardRegistrationBonus = async (userId: string): Promise<boolean> => {
  try {
    const bonusSettings = await getBonusSettings();
    const registrationBonus = bonusSettings.registration_bonus || 100;

    console.log(`Awarding registration bonus: ${registrationBonus} PKR to user ${userId}`);

    // Use SQL function to atomically update balance
    const { data, error } = await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount_to_add: registrationBonus
    });

    if (error) {
      console.error('Error updating user balance for registration bonus:', error);
      
      // Fallback to manual update
      const { data: userProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user balance:', fetchError);
        return false;
      }

      const currentBalance = userProfile.balance || 0;
      const newBalance = currentBalance + registrationBonus;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (balanceError) {
        console.error('Error updating user balance for registration bonus:', balanceError);
        return false;
      }
    }

    console.log(`Successfully awarded registration bonus: ${registrationBonus} PKR to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error awarding registration bonus:', error);
    return false;
  }
};

// Process referral bonus - Enhanced with better balance management
export const processReferralBonus = async (referrerCode: string, newUserId: string): Promise<boolean> => {
  try {
    console.log(`Processing referral bonus for code: ${referrerCode}, new user: ${newUserId}`);
    
    // Get referrer user
    const referrer = await getUserByReferralCode(referrerCode);
    if (!referrer) {
      console.log('Referrer not found for code:', referrerCode);
      return false;
    }

    console.log(`Found referrer: ${referrer.username} (${referrer.id})`);

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

    console.log(`Referral bonus amount: ${referralBonus} PKR`);

    // Try to use SQL function for atomic update
    const { data: sqlResult, error: sqlError } = await supabase.rpc('update_user_balance', {
      user_id: referrer.id,
      amount_to_add: referralBonus
    });

    if (sqlError) {
      console.log('SQL function not available, using manual balance update');
      
      // Fallback to manual balance update
      const { data: referrerProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', referrer.id)
        .single();

      if (fetchError) {
        console.error('Error fetching referrer balance:', fetchError);
        return false;
      }

      const currentBalance = referrerProfile.balance || 0;
      const newBalance = currentBalance + referralBonus;

      console.log(`Updating referrer balance from ${currentBalance} to ${newBalance}`);

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', referrer.id);

      if (balanceError) {
        console.error('Error updating referrer balance:', balanceError);
        return false;
      }
    }

    // Create referral record after successful balance update
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
      return false;
    }

    console.log(`Successfully processed referral bonus: ${referrer.username} received ${referralBonus} PKR for referring user ${newUserId}`);
    return true;
  } catch (error) {
    console.error('Error processing referral bonus:', error);
    return false;
  }
};

// Get referral stats for user - Fixed to calculate earnings properly
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

    console.log(`Referral stats for user ${userId}: ${totalReferrals} referrals, ${totalEarned} PKR earned, ${pendingRewards} pending`);

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
