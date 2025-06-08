
import { supabase } from '@/integrations/supabase/client';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  bonus_paid: boolean;
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

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: newUserId,
        bonus_amount: 90,
        bonus_paid: true
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

    const newBalance = (referrerProfile.balance || 0) + 90;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', referrer.id);

    if (balanceError) {
      console.error('Error updating referrer balance:', balanceError);
      throw balanceError;
    }

    console.log(`Processed referral bonus: ${referrer.username} received 90 PKR for referring user ${newUserId}`);
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
    const totalEarned = referrals?.reduce((sum, ref) => sum + (ref.bonus_paid ? ref.bonus_amount : 0), 0) || 0;
    const pendingRewards = referrals?.filter(ref => !ref.bonus_paid).length || 0;

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
