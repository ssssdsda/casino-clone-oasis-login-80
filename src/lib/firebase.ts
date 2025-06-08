// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// It's good practice to ensure these are loaded, especially in development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env.local file.');
  // In a production app, you might want a more robust error handling mechanism here.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This function will generate a unique referral code and check its uniqueness against Supabase
export const generateUniqueReferralCode = async (): Promise<string> => {
  let code = '';
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 6-character alphanumeric code
    code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if this code already exists in your 'users' table (assuming 'referral_code' column)
    const { data, error } = await supabase
      .from('users') // IMPORTANT: Replace 'users' with your actual table name if different (e.g., 'profiles')
      .select('referral_code')
      .eq('referral_code', code)
      .limit(1);

    if (error) {
      console.error('Error checking referral code uniqueness (Supabase):', error.message);
      throw new Error('Failed to generate unique referral code due to database error.');
    }

    if (data && data.length === 0) { // If no user has this code, it's unique
      isUnique = true;
    }
  }
  return code;
};