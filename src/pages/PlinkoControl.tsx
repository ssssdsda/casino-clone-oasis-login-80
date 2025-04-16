
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
import { ArrowLeft, RefreshCw, Save, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getGameSettings, GameSettings } from '@/utils/bettingSystem';

const PlinkoControl = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Define settings object with required properties (not optional)
  const [settings, setSettings] = useState({
    winRate: 30,
    minBet: 5,
    maxBet: 500,
    maxWin: 3000,
    isActive: true,
    multipliers: [1.5, 2, 3, 5, 10] // Default multipliers
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [newMultiplier, setNewMultiplier] = useState<number>(2);
  
  // Load game settings from Firebase
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const gameSettings = await getGameSettings();
        
        if (gameSettings && gameSettings.games && gameSettings.games.Plinko) {
          // Ensure all required properties have values with defaults if missing
          const plinkoSettings = gameSettings.games.Plinko;
          setSettings({
            winRate: plinkoSettings.winRate ?? 30,
            minBet: plinkoSettings.minBet ?? 5,
            maxBet: plinkoSettings.maxBet ?? 500,
            maxWin: plinkoSettings.maxWin ?? 3000,
            isActive: plinkoSettings.isActive ?? true,
            multipliers: plinkoSettings.multipliers ?? [1.5, 2, 3, 5, 10]
          });
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
        if (data && data.games && data.games.Plinko) {
          const plinkoSettings = data.games.Plinko;
          setSettings({
            winRate: plinkoSettings.winRate ?? 30,
            minBet: plinkoSettings.minBet ?? 5,
            maxBet: plinkoSettings.maxBet ?? 500,
            maxWin: plinkoSettings.maxWin ?? 3000,
            isActive: plinkoSettings.isActive ?? true,
            multipliers: plinkoSettings.multipliers ?? [1.5, 2, 3, 5, 10]
          });
        }
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const addMultiplier = () => {
    if (newMultiplier > 0) {
      setSettings({
        ...settings,
        multipliers: [...settings.multipliers, newMultiplier].sort((a, b) => a - b)
      });
      setNewMultiplier(2);
    }
  };
  
  const removeMultiplier = (index: number) => {
    const newMultipliers = [...settings.multipliers];
    newMultipliers.splice(index, 1);
    setSettings({...settings, multipliers: newMultipliers});
  };
  
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
        allSettings = { 
          games: data.games || {} 
        };
      }
      
      // Update just the Plinko settings
      allSettings.games = {
        ...allSettings.games,
        Plinko: settings
      };
      
      await setDoc(settingsRef, allSettings);
      
      toast({
        title: "Settings Saved",
        description: "Plinko game settings have been updated.",
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
            onClick={() => navigate('/game/plinko')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Game
          </Button>
          <h1 className="text-2xl font-bold text-white">Plinko Game Settings</h1>
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
              <CardTitle className="text-white">Multiplier Settings</CardTitle>
              <CardDescription>Configure possible payout multipliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {settings.multipliers.map((mult, index) => (
                    <div 
                      key={`mult-${index}`}
                      className="px-3 py-1 bg-indigo-700 rounded-full flex items-center gap-1"
                    >
                      <span className="text-white">{mult}x</span>
                      <button 
                        onClick={() => removeMultiplier(index)}
                        className="text-red-300 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    min={1}
                    step={0.1}
                    value={newMultiplier}
                    onChange={(e) => setNewMultiplier(parseFloat(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button 
                    onClick={addMultiplier}
                    size="sm"
                    className="bg-indigo-700 hover:bg-indigo-600"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </Button>
                </div>
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

export default PlinkoControl;
