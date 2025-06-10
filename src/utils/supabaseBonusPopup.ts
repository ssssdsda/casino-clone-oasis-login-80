
import { supabase } from '@/integrations/supabase/client';

export interface BonusPopupSettings {
  id?: string;
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

// Get bonus popup settings from localStorage (primary storage since Supabase table doesn't exist)
export const getBonusPopupSettings = async (): Promise<BonusPopupSettings | null> => {
  try {
    // Try localStorage first since Supabase table is not available
    const localSettings = localStorage.getItem('bonus_popup_settings');
    if (localSettings) {
      return JSON.parse(localSettings);
    }
    return null;
  } catch (error) {
    console.error('Error in getBonusPopupSettings:', error);
    return null;
  }
};

// Save bonus popup settings to localStorage (primary storage since Supabase table doesn't exist)
export const saveBonusPopupSettings = async (settings: Omit<BonusPopupSettings, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    // Save to localStorage as primary storage
    const settingsWithTimestamp = {
      ...settings,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('bonus_popup_settings', JSON.stringify(settingsWithTimestamp));
    console.log('Bonus popup settings saved to localStorage successfully');
    return true;
  } catch (error) {
    console.error('Error in saveBonusPopupSettings:', error);
    return false;
  }
};

// Get settings with fallback to default values
export const getBonusPopupSettingsWithFallback = async (): Promise<BonusPopupSettings> => {
  // Try localStorage
  const localSettings = await getBonusPopupSettings();
  
  if (localSettings) {
    return localSettings;
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
