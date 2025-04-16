
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interface for game settings
export interface GameSettings {
  games: {
    [key: string]: {
      winRate?: number;
      minBet?: number;
      maxBet?: number;
      maxWin?: number;
      minWin?: number;
      isActive?: boolean;
      multipliers?: number[];
      payoutRates?: {[key: string]: number};
    }
  }
}

// Get game settings from Firestore
export const getGameSettings = async (): Promise<GameSettings> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as DocumentData;
      
      // Ensure the data has the required structure
      if (!data.games) {
        data.games = {};
      }
      
      return data as GameSettings;
    } else {
      // Return default settings if document doesn't exist
      return { games: {} };
    }
  } catch (error) {
    console.error('Error fetching game settings:', error);
    return { games: {} };
  }
};

// Save game settings to Firestore
export const saveGameSettings = async (settings: GameSettings): Promise<boolean> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    await setDoc(settingsRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving game settings:', error);
    return false;
  }
};

// Update game settings for a specific game
export const updateGameSettings = async (
  game: string, 
  settings: {
    winRate?: number;
    minBet?: number;
    maxBet?: number;
    maxWin?: number;
    minWin?: number;
    isActive?: boolean;
    multipliers?: number[];
    payoutRates?: {[key: string]: number};
  }
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, "admin", "gameSettings");
    const docSnap = await getDoc(settingsRef);
    
    let currentSettings: GameSettings;
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      currentSettings = { games: data.games || {} };
    } else {
      currentSettings = { games: {} };
    }
    
    // Update the specific game settings
    currentSettings.games[game] = {
      ...(currentSettings.games[game] || {}),
      ...settings
    };
    
    await setDoc(settingsRef, currentSettings);
    return true;
  } catch (error) {
    console.error(`Error updating ${game} settings:`, error);
    return false;
  }
};
