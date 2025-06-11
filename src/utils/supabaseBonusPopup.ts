
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

// Get bonus popup settings from localStorage with better error handling
export const getBonusPopupSettings = async (): Promise<BonusPopupSettings | null> => {
  try {
    const localSettings = localStorage.getItem('bonus_popup_settings');
    if (localSettings) {
      const parsed = JSON.parse(localSettings);
      console.log('Loaded bonus popup settings from localStorage:', parsed);
      return parsed;
    }
    console.log('No bonus popup settings found in localStorage');
    return null;
  } catch (error) {
    console.error('Error reading bonus popup settings from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('bonus_popup_settings');
    return null;
  }
};

// Save bonus popup settings to localStorage only
export const saveBonusPopupSettings = async (settings: Omit<BonusPopupSettings, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    console.log('Saving bonus popup settings:', settings);
    
    const settingsWithTimestamp = {
      ...settings,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('bonus_popup_settings', JSON.stringify(settingsWithTimestamp));
    
    // Verify the save worked
    const verification = localStorage.getItem('bonus_popup_settings');
    if (!verification) {
      throw new Error('Failed to save to localStorage');
    }
    
    console.log('Bonus popup settings saved successfully to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving bonus popup settings:', error);
    return false;
  }
};

// Clear old cache and get fresh settings
export const getBonusPopupSettingsWithFallback = async (): Promise<BonusPopupSettings> => {
  // Clear any cached images first
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cleared image caches');
    } catch (error) {
      console.log('Could not clear caches:', error);
    }
  }
  
  // Try to get settings
  const localSettings = await getBonusPopupSettings();
  
  if (localSettings) {
    return localSettings;
  }
  
  // Return default settings with updated image URLs
  const defaultSettings = {
    enabled: true,
    title: 'Big Offer!',
    description: "Deposit now and get 100% bonus!",
    imageUrl: '/lovable-uploads/5035849b-d0e0-4890-af49-cc92532ea221.png?' + Date.now(), // Cache buster
    messageText: 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as PKR 200!',
    buttonText: 'Get Bonus Now',
    showOnLogin: true,
    backgroundGradient: 'from-red-900 to-red-700',
    borderColor: 'border-red-500'
  };
  
  console.log('Using default bonus popup settings with cache busting');
  return defaultSettings;
};

// Force refresh function to clear caches
export const refreshBonusPopupCache = async (): Promise<void> => {
  try {
    // Clear localStorage cache
    localStorage.removeItem('bonus_popup_settings');
    
    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Force reload images by updating timestamp
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        const url = new URL(img.src);
        url.searchParams.set('t', Date.now().toString());
        img.src = url.toString();
      }
    });
    
    console.log('Bonus popup cache refreshed');
  } catch (error) {
    console.error('Error refreshing cache:', error);
  }
};
