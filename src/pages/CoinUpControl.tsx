
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getGameSettings, GameSettings } from '@/utils/bettingSystem';

const CoinUpControl = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    winRate: 30,
    minBet: 5,
    maxBet: 500,
    maxWin: 3000,
    isActive: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Load game settings from Firebase
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const gameSettings = await getGameSettings();
        
        if (gameSettings && gameSettings.games && gameSettings.games.CoinUp) {
          setSettings(gameSettings.games.CoinUp);
        }
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    
    fetchGameSettings();
    
    // Set up real-time listener for settings updates
    const settingsRef = doc(db, "admin", "gameSettings");
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data && data.games && data.games.CoinUp) {
          setSettings(data.games.CoinUp);
          console.log("Real-time CoinUp settings update:", data.games.CoinUp);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Handle save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Get current settings first
      const settingsRef = doc(db, "admin", "gameSettings");
      const settingsDoc = await getDoc(settingsRef);
      
      let allSettings: GameSettings = { games: {} };
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        // Ensure we have a games object
        allSettings = { 
          games: data.games || {} 
        };
      }
      
      // Update just the CoinUp settings
      allSettings.games = {
        ...allSettings.games,
        CoinUp: settings
      };
      
      await setDoc(settingsRef, allSettings);
      
      toast({
        title: "Settings Saved",
        description: "Coin Up game settings have been updated.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/game/coinup')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Game
          </Button>
          <h1 className="text-2xl font-bold text-white">Coin Up Game Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Winning Odds</CardTitle>
              <CardDescription>Adjust win probability and payout ratios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white">Win Probability</Label>
                  <span className="text-yellow-400 font-mono">{settings.winRate}%</span>
                </div>
                <Slider 
                  value={[settings.winRate]} 
                  min={5} 
                  max={70} 
                  step={1} 
                  onValueChange={(value) => setSettings({...settings, winRate: value[0]})}
                />
                <p className="text-xs text-gray-400">Higher values mean players win more often</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Betting Limits</CardTitle>
              <CardDescription>Control minimum and maximum bet amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Min Bet (৳)</Label>
                  <Input 
                    type="number" 
                    value={settings.minBet} 
                    onChange={(e) => setSettings({...settings, minBet: parseInt(e.target.value) || 1})} 
                    min={1} 
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Max Bet (৳)</Label>
                  <Input 
                    type="number" 
                    value={settings.maxBet} 
                    onChange={(e) => setSettings({...settings, maxBet: parseInt(e.target.value) || 100})} 
                    min={10} 
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Payout Settings</CardTitle>
              <CardDescription>Control maximum win amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-white">Max Win (৳)</Label>
                <Input 
                  type="number" 
                  value={settings.maxWin} 
                  onChange={(e) => setSettings({...settings, maxWin: parseInt(e.target.value) || 1000})} 
                  min={100} 
                  className="bg-gray-700 border-gray-600"
                />
                <p className="text-xs text-gray-400">Maximum amount a player can win in a single game</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Game Status</CardTitle>
              <CardDescription>Enable or disable the game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label className="text-white">Game Active</Label>
                <Switch 
                  checked={settings.isActive} 
                  onCheckedChange={(checked) => setSettings({...settings, isActive: checked})} 
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">When disabled, players cannot access this game</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoinUpControl;
