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
import { useAuth } from '@/context/AuthContext';
import { toast } from "@/components/ui/sonner";
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const GameOddsManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [gameSettings, setGameSettings] = useState({
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
  });
  
  const { user } = useAuth();
  const db = getFirestore();
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to get settings from Firebase
        const settingsRef = doc(db, "admin", "gameSettings");
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setGameSettings(data);
          console.log("Game settings loaded from Firebase:", data);
        } else {
          // If no settings in Firebase, try localStorage
          const localSettings = localStorage.getItem('gameOddsSettings');
          if (localSettings) {
            setGameSettings(JSON.parse(localSettings));
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // If Firebase fails, try localStorage
        const localSettings = localStorage.getItem('gameOddsSettings');
        if (localSettings) {
          setGameSettings(JSON.parse(localSettings));
        }
      }
    };

    fetchSettings();
  }, [db]);
  
  const handleUpdateSetting = (gameType, property, value) => {
    setGameSettings(prev => {
      const updatedSettings = {...prev};
      
      // Handle special rules separately
      if (property.includes('.')) {
        const [mainProperty, subProperty] = property.split('.');
        updatedSettings.games[gameType][mainProperty] = {
          ...updatedSettings.games[gameType][mainProperty],
          [subProperty]: value
        };
      } else {
        updatedSettings.games[gameType][property] = value;
      }
      
      return updatedSettings;
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save to Firebase
      const success = await saveGameSettings(gameSettings);
      
      if (success) {
        toast.success("Settings saved successfully!");
      } else {
        // If Firebase save fails, save to localStorage as fallback
        localStorage.setItem('gameOddsSettings', JSON.stringify(gameSettings));
        toast.info("Settings saved locally but Firebase update failed");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      localStorage.setItem('gameOddsSettings', JSON.stringify(gameSettings));
      toast.error("Error saving to Firebase, saved locally instead");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Protect route for non-admin users
  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

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
              <TabsList className="grid grid-cols-4">
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
                        value={gameSettings.games.BoxingKing.winRate}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="boxingking-minbet"
                        value={gameSettings.games.BoxingKing.minBet}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="boxingking-maxbet"
                        value={gameSettings.games.BoxingKing.maxBet}
                        onChange={(e) => handleUpdateSetting('BoxingKing', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boxingking-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="boxingking-maxwin"
                        value={gameSettings.games.BoxingKing.maxWin}
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
                        checked={gameSettings.games.BoxingKing.specialRules.firstTwoBetsWin}
                        onCheckedChange={(checked) => handleUpdateSetting('BoxingKing', 'specialRules.firstTwoBetsWin', checked)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="boxingking-firsttwobetsmultiplier" className="text-white">First Two Bets Multiplier</Label>
                        <Input 
                          type="number"
                          id="boxingking-firsttwobetsmultiplier"
                          value={gameSettings.games.BoxingKing.specialRules.firstTwoBetsMultiplier}
                          onChange={(e) => handleUpdateSetting('BoxingKing', 'specialRules.firstTwoBetsMultiplier', Number(e.target.value))}
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="boxingking-regularmultiplier" className="text-white">Regular Multiplier</Label>
                        <Input 
                          type="number"
                          id="boxingking-regularmultiplier"
                          value={gameSettings.games.BoxingKing.specialRules.regularMultiplier}
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
                      checked={gameSettings.games.BoxingKing.isActive}
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
                        value={gameSettings.games.MoneyGram.winRate}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="moneygram-minbet"
                        value={gameSettings.games.MoneyGram.minBet}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="moneygram-maxbet"
                        value={gameSettings.games.MoneyGram.maxBet}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moneygram-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="moneygram-maxwin"
                        value={gameSettings.games.MoneyGram.maxWin}
                        onChange={(e) => handleUpdateSetting('MoneyGram', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="moneygram-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="moneygram-isactive"
                      checked={gameSettings.games.MoneyGram.isActive}
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
                        value={gameSettings.games.CoinUp.winRate}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="coinup-minbet"
                        value={gameSettings.games.CoinUp.minBet}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="coinup-maxbet"
                        value={gameSettings.games.CoinUp.maxBet}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinup-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="coinup-maxwin"
                        value={gameSettings.games.CoinUp.maxWin}
                        onChange={(e) => handleUpdateSetting('CoinUp', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="coinup-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="coinup-isactive"
                      checked={gameSettings.games.CoinUp.isActive}
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
                        value={gameSettings.games.SuperAce.winRate}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="superace-minbet"
                        value={gameSettings.games.SuperAce.minBet}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="superace-maxbet"
                        value={gameSettings.games.SuperAce.maxBet}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superace-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="superace-maxwin"
                        value={gameSettings.games.SuperAce.maxWin}
                        onChange={(e) => handleUpdateSetting('SuperAce', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="superace-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="superace-isactive"
                      checked={gameSettings.games.SuperAce.isActive}
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
                        value={gameSettings.games.default.winRate}
                        onChange={(e) => handleUpdateSetting('default', 'winRate', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-minbet" className="text-white">Min Bet</Label>
                      <Input 
                        type="number"
                        id="default-minbet"
                        value={gameSettings.games.default.minBet}
                        onChange={(e) => handleUpdateSetting('default', 'minBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-maxbet" className="text-white">Max Bet</Label>
                      <Input 
                        type="number"
                        id="default-maxbet"
                        value={gameSettings.games.default.maxBet}
                        onChange={(e) => handleUpdateSetting('default', 'maxBet', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default-maxwin" className="text-white">Max Win</Label>
                      <Input 
                        type="number"
                        id="default-maxwin"
                        value={gameSettings.games.default.maxWin}
                        onChange={(e) => handleUpdateSetting('default', 'maxWin', Number(e.target.value))}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-isactive" className="text-white">Is Active</Label>
                    <Switch 
                      id="default-isactive"
                      checked={gameSettings.games.default.isActive}
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
