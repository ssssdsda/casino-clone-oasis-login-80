
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { SaveAll, Percent, ChevronDown, BarChart3, Dice1, RefreshCcw } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveGameSettings } from '@/utils/bettingSystem';

interface GameSettings {
  winRate: number;
  minBet: number;
  maxBet: number;
  maxWin: number;
  isActive: boolean;
  specialRules?: {
    [key: string]: any;
  };
}

interface GlobalSettings {
  games: {
    [key: string]: GameSettings;
  };
  lastUpdated: number;
}

const defaultSettings: GlobalSettings = {
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
    MoneyGram: {
      winRate: 20,
      minBet: 10,
      maxBet: 1000,
      maxWin: 5000,
      isActive: true
    },
    CoinUp: {
      winRate: 30,
      minBet: 5,
      maxBet: 500,
      maxWin: 3000,
      isActive: true
    },
    MegaSpin: {
      winRate: 15,
      minBet: 10,
      maxBet: 2000,
      maxWin: 20000,
      isActive: true
    },
    Aviator: {
      winRate: 25,
      minBet: 5,
      maxBet: 1000,
      maxWin: 10000,
      isActive: true
    },
    Plinko: {
      winRate: 25,
      minBet: 5,
      maxBet: 500,
      maxWin: 5000,
      isActive: true
    },
    CasinoWin: {
      winRate: 20,
      minBet: 10,
      maxBet: 1000,
      maxWin: 8000,
      isActive: true
    },
    FortuneGems: {
      winRate: 20,
      minBet: 5,
      maxBet: 500,
      maxWin: 5000,
      isActive: true
    },
    FruityBonanza: {
      winRate: 20,
      minBet: 5,
      maxBet: 500,
      maxWin: 5000,
      isActive: true
    },
    SuperAce: {
      winRate: 25,
      minBet: 10,
      maxBet: 1000,
      maxWin: 8000,
      isActive: true
    },
    SuperElements: {
      winRate: 20,
      minBet: 10,
      maxBet: 500,
      maxWin: 3000,
      isActive: true
    },
    GoldenBasin: {
      winRate: 15,
      minBet: 50,
      maxBet: 5000,
      maxWin: 50000,
      isActive: true
    },
    CoinsGame: {
      winRate: 25,
      minBet: 5,
      maxBet: 500,
      maxWin: 2500,
      isActive: true
    }
  },
  lastUpdated: Date.now()
};

const GameOddsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [selectedGame, setSelectedGame] = useState<string>("BoxingKing");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsRef = doc(db, "admin", "gameSettings");
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as GlobalSettings);
      } else {
        // If no settings exist yet, save the defaults to Firebase
        await setDoc(settingsRef, defaultSettings);
      }
    } catch (error) {
      console.error("Error loading game settings:", error);
      toast({
        title: "Error Loading Settings",
        description: "Could not load game settings from database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const updatedSettings = {
      ...settings,
      lastUpdated: Date.now()
    };
    
    try {
      // Save settings to Firebase using the utility function
      const success = await saveGameSettings(updatedSettings);
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Game odds settings have been updated successfully",
        });
      } else {
        throw new Error("Failed to save settings");
      }
      
    } catch (error) {
      console.error("Error saving game settings:", error);
      toast({
        title: "Error Saving Settings",
        description: "Could not save game settings to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateGameSetting = (game: string, field: keyof GameSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      games: {
        ...prev.games,
        [game]: {
          ...prev.games[game],
          [field]: value
        }
      }
    }));
  };

  const updateSpecialRule = (game: string, rule: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      games: {
        ...prev.games,
        [game]: {
          ...prev.games[game],
          specialRules: {
            ...prev.games[game].specialRules,
            [rule]: value
          }
        }
      }
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Reset to Defaults",
      description: "All game settings have been reset to default values",
    });
  };

  const currentGame = settings.games[selectedGame];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Game Odds Management</h1>
            <p className="text-gray-400">Control win rates and betting limits for all games</p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="text-gray-300"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset All
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <SaveAll className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Games</CardTitle>
                <CardDescription>Select a game to configure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(settings.games).map((game) => (
                    <div 
                      key={game} 
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                        selectedGame === game ? 'bg-blue-900 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedGame(game)}
                    >
                      <span>{game}</span>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${settings.games[game].isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{selectedGame} Settings</CardTitle>
                <CardDescription>Configure odds and limits for this game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="active" className="text-white">Game Active</Label>
                      <p className="text-sm text-gray-400">Enable or disable this game</p>
                    </div>
                    <Switch
                      id="active"
                      checked={currentGame.isActive}
                      onCheckedChange={(checked) => updateGameSetting(selectedGame, 'isActive', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white flex items-center">
                        <Percent className="h-4 w-4 mr-2 text-blue-400" />
                        Win Rate (%)
                      </Label>
                      <span className="text-yellow-400 font-mono">{currentGame.winRate}%</span>
                    </div>
                    <Slider
                      value={[currentGame.winRate]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(value) => updateGameSetting(selectedGame, 'winRate', value[0])}
                      className="my-2"
                    />
                    <p className="text-xs text-gray-400">Percentage chance of players winning in this game</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minBet" className="text-white">Minimum Bet</Label>
                      <Input
                        id="minBet"
                        type="number"
                        value={currentGame.minBet}
                        onChange={(e) => updateGameSetting(selectedGame, 'minBet', Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBet" className="text-white">Maximum Bet</Label>
                      <Input
                        id="maxBet"
                        type="number"
                        value={currentGame.maxBet}
                        onChange={(e) => updateGameSetting(selectedGame, 'maxBet', Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxWin" className="text-white">Maximum Win</Label>
                      <Input
                        id="maxWin"
                        type="number"
                        value={currentGame.maxWin}
                        onChange={(e) => updateGameSetting(selectedGame, 'maxWin', Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {selectedGame === "BoxingKing" && currentGame.specialRules && (
                    <div className="border rounded-md border-gray-700 p-4 bg-gray-900/50">
                      <h3 className="text-white font-medium mb-4">Special Rules for Boxing King</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="firstTwoBetsWin" className="text-white">First 2 bets always win</Label>
                          <Switch
                            id="firstTwoBetsWin"
                            checked={currentGame.specialRules.firstTwoBetsWin}
                            onCheckedChange={(checked) => updateSpecialRule(selectedGame, 'firstTwoBetsWin', checked)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="firstTwoBetsMultiplier" className="text-white">First 2 bets multiplier</Label>
                          <Input
                            id="firstTwoBetsMultiplier"
                            type="number"
                            step="0.1"
                            value={currentGame.specialRules.firstTwoBetsMultiplier}
                            onChange={(e) => updateSpecialRule(selectedGame, 'firstTwoBetsMultiplier', Number(e.target.value))}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="regularMultiplier" className="text-white">Regular multiplier (after first 2 bets)</Label>
                          <Input
                            id="regularMultiplier"
                            type="number"
                            step="0.1"
                            value={currentGame.specialRules.regularMultiplier}
                            onChange={(e) => updateSpecialRule(selectedGame, 'regularMultiplier', Number(e.target.value))}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Game Statistics</CardTitle>
                <CardDescription>View performance metrics for this game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Total Bets</div>
                    <div className="text-2xl font-bold text-white">0</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">House Profit</div>
                    <div className="text-2xl font-bold text-green-500">0</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Actual Win %</div>
                    <div className="text-2xl font-bold text-blue-500">0%</div>
                  </div>
                </div>
                
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Bet Amount</TableHead>
                      <TableHead className="text-gray-400">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700">
                      <TableCell className="text-gray-300" colSpan={4}>
                        No bet history data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameOddsManagement;
