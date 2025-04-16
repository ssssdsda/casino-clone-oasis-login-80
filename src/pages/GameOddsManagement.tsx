
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { saveGameSettings } from '@/utils/bettingSystem';
import { useToast } from '@/hooks/use-toast';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Define the game settings type for better type safety
interface GameSettings {
  games: {
    BoxingKing: {
      winRate: number;
      minBet: number;
      maxBet: number;
      maxWin: number;
      isActive: boolean;
      specialRules: {
        firstTwoBetsWin: boolean;
        firstTwoBetsMultiplier: number;
        regularMultiplier: number;
      }
    };
    MoneyGram: { winRate: number; minBet: number; maxBet: number; maxWin: number; isActive: boolean };
    CoinUp: { winRate: number; minBet: number; maxBet: number; maxWin: number; isActive: boolean };
    SuperAce: { winRate: number; minBet: number; maxBet: number; maxWin: number; isActive: boolean };
    default: { winRate: number; minBet: number; maxBet: number; maxWin: number; isActive: boolean };
    [key: string]: any; // Allow for additional game types
  }
}

// Default game settings to use as fallback
const defaultGameSettings: GameSettings = {
  games: {
    BoxingKing: {
      winRate: 20, 
      minBet: 10,
      maxBet: 1000,
      maxWin: 10000,
      isActive: true,
      specialRules: { 
        firstTwoBetsWin: true,
        firstTwoBetsMultiplier: 2,
        regularMultiplier: 0.7
      }
    },
    MoneyGram: { winRate: 20, minBet: 10, maxBet: 1000, maxWin: 5000, isActive: true },
    CoinUp: { winRate: 30, minBet: 5, maxBet: 500, maxWin: 3000, isActive: true },
    SuperAce: { winRate: 25, minBet: 10, maxBet: 500, maxWin: 5000, isActive: true },
    default: { winRate: 25, minBet: 1, maxBet: 100, maxWin: 1000, isActive: true }
  }
};

const GameOddsManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
  
  const { toast } = useToast();
  const db = getFirestore();
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to get settings from Firebase
        const settingsRef = doc(db, "admin", "gameSettings");
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          // Check if the data has the expected structure
          if (data && data.games) {
            // Make sure we have a valid structure by merging with default settings
            const mergedSettings = {
              games: { 
                ...defaultGameSettings.games,
                ...data.games 
              }
            };
            setGameSettings(mergedSettings as GameSettings);
            console.log("Game settings loaded from Firebase:", mergedSettings);
          } else {
            console.warn("Firebase data doesn't match the expected structure:", data);
            setGameSettings(defaultGameSettings); // Use defaults if structure is invalid
          }
        } else {
          // If no settings in Firebase, try localStorage
          const localSettings = localStorage.getItem('gameOddsSettings');
          if (localSettings) {
            try {
              const parsedSettings = JSON.parse(localSettings);
              if (parsedSettings && parsedSettings.games) {
                // Merge with defaults to ensure we have all required fields
                const mergedSettings = {
                  games: { 
                    ...defaultGameSettings.games,
                    ...parsedSettings.games 
                  }
                };
                setGameSettings(mergedSettings as GameSettings);
              } else {
                setGameSettings(defaultGameSettings);
              }
            } catch (error) {
              console.error("Error parsing local settings:", error);
              setGameSettings(defaultGameSettings);
            }
          } else {
            setGameSettings(defaultGameSettings);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // If Firebase fails, try localStorage
        try {
          const localSettings = localStorage.getItem('gameOddsSettings');
          if (localSettings) {
            const parsedSettings = JSON.parse(localSettings);
            if (parsedSettings && parsedSettings.games) {
              setGameSettings(parsedSettings as GameSettings);
            } else {
              setGameSettings(defaultGameSettings);
            }
          } else {
            setGameSettings(defaultGameSettings);
          }
        } catch (e) {
          console.error("Error with localStorage fallback:", e);
          setGameSettings(defaultGameSettings);
        }
      }
    };

    fetchSettings();
  }, [db]);
  
  const handleUpdateSetting = (gameType: string, property: string, value: any) => {
    setGameSettings(prev => {
      // Create deep copy to avoid mutation issues
      const updatedSettings = JSON.parse(JSON.stringify(prev)) as GameSettings;
      
      // Ensure the game type exists
      if (!updatedSettings.games[gameType]) {
        updatedSettings.games[gameType] = JSON.parse(JSON.stringify(updatedSettings.games.default));
      }
      
      // Handle special rules separately
      if (property.includes('.')) {
        const [mainProperty, subProperty] = property.split('.');
        
        // Make sure specialRules exists if we're updating it
        if (mainProperty === 'specialRules' && !updatedSettings.games[gameType][mainProperty]) {
          updatedSettings.games[gameType][mainProperty] = {};
        }
        
        if (updatedSettings.games[gameType][mainProperty]) {
          updatedSettings.games[gameType][mainProperty][subProperty] = value;
        }
      } else {
        updatedSettings.games[gameType][property] = value;
      }
      
      return updatedSettings;
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Validate settings before saving
      if (!gameSettings || !gameSettings.games) {
        throw new Error("Invalid game settings object");
      }
      
      // Save to Firebase
      const success = await saveGameSettings(gameSettings);
      
      if (success) {
        toast({
          title: "Settings saved successfully!",
          description: "Game odds have been updated.",
        });
      } else {
        // If Firebase save fails, save to localStorage as fallback
        localStorage.setItem('gameOddsSettings', JSON.stringify(gameSettings));
        toast({
          title: "Settings saved locally",
          description: "Firebase update failed, saved to local storage instead.",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      try {
        localStorage.setItem('gameOddsSettings', JSON.stringify(gameSettings));
        toast({
          title: "Error saving to Firebase",
          description: "Settings saved locally instead.",
          variant: "destructive"
        });
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
        toast({
          title: "Failed to save settings",
          description: "Could not save settings to Firebase or localStorage.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely access nested properties
  const getSafeGameSettings = (gameType: string) => {
    // Ensure the games object exists
    if (!gameSettings || !gameSettings.games) {
      return defaultGameSettings.games[gameType] || defaultGameSettings.games.default;
    }
    
    // Return the game settings or fall back to default
    return gameSettings.games[gameType] || defaultGameSettings.games[gameType] || defaultGameSettings.games.default;
  };

  // Safely get special rules for Boxing King
  const getBoxingKingRules = () => {
    const game = getSafeGameSettings('BoxingKing');
    return game.specialRules || defaultGameSettings.games.BoxingKing.specialRules;
  };

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-casino border border-casino-accent">
          <CardHeader>
            <CardTitle className="text-white">Game Odds Management</CardTitle>
            <CardDescription className="text-white">
              Adjust game settings and win rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="BoxingKing" className="space-y-4">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="BoxingKing">Boxing King</TabsTrigger>
                <TabsTrigger value="MoneyGram">Money Gram</TabsTrigger>
                <TabsTrigger value="CoinUp">Coin Up</TabsTrigger>
                <TabsTrigger value="SuperAce">Super Ace</TabsTrigger>
                <TabsTrigger value="default">Default</TabsTrigger>
              </TabsList>
              
              <TabsContent value="BoxingKing">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="boxingking-winrate" className="text-white">Win Rate (%)</Label>
                      <Input 
                        type="number"
                        id="boxingking-winrate"
                        value={getSafeGameSettings('BoxingKing').winRate}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="boxingking-minbet"
                        value={getSafeGameSettings('BoxingKing').minBet}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="boxingking-maxbet"
                        value={getSafeGameSettings('BoxingKing').maxBet}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="boxingking-maxwin"
                        value={getSafeGameSettings('BoxingKing').maxWin}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Special Rules</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="boxingking-firsttwobetswin" className="text-white">First Two Bets Win</Label>
                      <Switch 
                        id="boxingking-firsttwobetswin"
                        checked={getBoxingKingRules().firstTwoBetsWin}
                        onCheckedChange={(checked) => handleUpdateSetting('BoxingKing', 'specialRules.firstTwoBetsWin', checked)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="boxingking-firsttwobetsmultiplier" className="text-white">First Two Bets Multiplier</Label>
                        <Input 
                          type="number"
                          id="boxingking-firsttwobetsmultiplier"
                          value={getBoxingKingRules().firstTwoBetsMultiplier}
                          onChange={(e) => handleUpdateSetting('BoxingKing', 'specialRules.firstTwoBetsMultiplier', Number(e.target.value))}
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="boxingking-regularmultiplier" className="text-white">Regular Multiplier</Label>
                        <Input 
                          type="number"
                          id="boxingking-regularmultiplier"
                          value={getBoxingKingRules().regularMultiplier}
                          onChange={(e) => handleUpdateSetting('BoxingKing', 'specialRules.regularMultiplier', Number(e.target.value))}
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="boxingking-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="boxingking-isactive"
                      checked={getSafeGameSettings('BoxingKing').isActive}
                      onCheckedChange={(checked) => handleUpdateSetting('BoxingKing', 'isActive', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="MoneyGram">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moneygram-winrate" className="text-white">Win Rate (%)</Label>
                      <Input 
                        type="number"
                        id="moneygram-winrate"
                        value={getSafeGameSettings('MoneyGram').winRate}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="moneygram-minbet"
                        value={getSafeGameSettings('MoneyGram').minBet}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="moneygram-maxbet"
                        value={getSafeGameSettings('MoneyGram').maxBet}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="moneygram-maxwin"
                        value={getSafeGameSettings('MoneyGram').maxWin}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="moneygram-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="moneygram-isactive"
                      checked={getSafeGameSettings('MoneyGram').isActive}
                      onCheckedChange={(checked) => handleUpdateSetting('MoneyGram', 'isActive', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="CoinUp">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coinup-winrate" className="text-white">Win Rate (%)</Label>
                      <Input 
                        type="number"
                        id="coinup-winrate"
                        value={getSafeGameSettings('CoinUp').winRate}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="coinup-minbet"
                        value={getSafeGameSettings('CoinUp').minBet}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="coinup-maxbet"
                        value={getSafeGameSettings('CoinUp').maxBet}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="coinup-maxwin"
                        value={getSafeGameSettings('CoinUp').maxWin}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="coinup-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="coinup-isactive"
                      checked={getSafeGameSettings('CoinUp').isActive}
                      onCheckedChange={(checked) => handleUpdateSetting('CoinUp', 'isActive', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="SuperAce">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superace-winrate" className="text-white">Win Rate (%)</Label>
                      <Input 
                        type="number"
                        id="superace-winrate"
                        value={getSafeGameSettings('SuperAce').winRate}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="superace-minbet"
                        value={getSafeGameSettings('SuperAce').minBet}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="superace-maxbet"
                        value={getSafeGameSettings('SuperAce').maxBet}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="superace-maxwin"
                        value={getSafeGameSettings('SuperAce').maxWin}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="superace-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="superace-isactive"
                      checked={getSafeGameSettings('SuperAce').isActive}
                      onCheckedChange={(checked) => handleUpdateSetting('SuperAce', 'isActive', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="default">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="default-winrate" className="text-white">Win Rate (%)</Label>
                      <Input 
                        type="number"
                        id="default-winrate"
                        value={getSafeGameSettings('default').winRate}
                        onChange={(e) => handleUpdateSetting('default', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="default-minbet"
                        value={getSafeGameSettings('default').minBet}
                        onChange={(e) => handleUpdateSetting('default', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="default-maxbet"
                        value={getSafeGameSettings('default').maxBet}
                        onChange={(e) => handleUpdateSetting('default', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="default-maxwin"
                        value={getSafeGameSettings('default').maxWin}
                        onChange={(e) => handleUpdateSetting('default', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="default-isactive"
                      checked={getSafeGameSettings('default').isActive}
                      onCheckedChange={(checked) => handleUpdateSetting('default', 'isActive', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default GameOddsManagement;
