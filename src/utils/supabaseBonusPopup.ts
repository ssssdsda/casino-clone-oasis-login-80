
import { supabase } from '@/integrations/supabase/client';

export interface BonusPopupSettings {
  id?: number;
  enabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  messageText: string;
  buttonText: string;
  showOnLogin: boolean;
  backgroundGradient: string;
  borderColor: string;
  created_at?: string;
  updated_at?: string;
}

// Get bonus popup settings from Supabase
export const getBonusPopupSettings = async (): Promise<BonusPopupSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('bonus_popup_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching bonus popup settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getBonusPopupSettings:', error);
    return null;
  }
};

// Save bonus popup settings to Supabase
export const saveBonusPopupSettings = async (settings: Omit<BonusPopupSettings, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    // First check if settings exist
    const existingSettings = await getBonusPopupSettings();
    
    if (existingSettings && existingSettings.id) {
      // Update existing settings
      const { error } = await supabase
        .from('bonus_popup_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);

      if (error) {
        console.error('Error updating bonus popup settings:', error);
        return false;
      }
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('bonus_popup_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting bonus popup settings:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveBonusPopupSettings:', error);
    return false;
  }
};

// Get settings with fallback to localStorage
export const getBonusPopupSettingsWithFallback = async (): Promise<BonusPopupSettings> => {
  // Try Supabase first
  const supabaseSettings = await getBonusPopupSettings();
  
  if (supabaseSettings) {
    return supabaseSettings;
  }
  
  // Fallback to localStorage
  try {
    const localSettings = localStorage.getItem('bonus_popup_settings');
    if (localSettings) {
      return JSON.parse(localSettings);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Return default settings if nothing found
  return {
    enabled: true,
    title: 'Big Offer!',
    description: "Deposit now and get 100% bonus!",
    imageUrl: '/lovable-uploads/5035849b-d0e0-4890-af49-cc92532ea221.png',
    messageText: 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as PKR 200!',
    buttonText: 'Get Bonus Now',
    showOnLogin: true,
    backgroundGradient: 'from-red-900 to-red-700',
    borderColor: 'border-red-500'
  };
};
