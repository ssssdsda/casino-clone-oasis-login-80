
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { saveGameSettings } from '@/utils/bettingSystem';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define types for our game settings
interface GameSpecialRules {
  firstTwoBetsWin: boolean;
  firstTwoBetsMultiplier: number;
  regularMultiplier: number;
}

interface GameSetting {
  winRate: number;
  minBet: number;
  maxBet: number;
  maxWin: number;
  isActive: boolean;
  specialRules?: GameSpecialRules;
}

interface GameSettings {
  games: {
    BoxingKing: GameSetting;
    MoneyGram: GameSetting;
    CoinUp: GameSetting;
    SuperAce: GameSetting;
    SuperElement: GameSetting;
    Plinko: GameSetting;
    Aviator: GameSetting;
    GoldenBasin: GameSetting;
    default: GameSetting;
    [key: string]: GameSetting;
  };
}

const GameOddsAdmin = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State for game settings
  const [gameSettings, setGameSettings] = useState<GameSettings>({
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
      SuperElement: { winRate: 25, minBet: 10, maxBet: 800, maxWin: 6000, isActive: true },
      Plinko: { winRate: 40, minBet: 5, maxBet: 300, maxWin: 3000, isActive: true },
      Aviator: { winRate: 15, minBet: 20, maxBet: 1000, maxWin: 10000, isActive: true },
      GoldenBasin: { winRate: 22, minBet: 10, maxBet: 500, maxWin: 4000, isActive: true },
      default: { winRate: 25, minBet: 1, maxBet: 100, maxWin: 1000, isActive: true }
    }
  });
  
  const [selectedGame, setSelectedGame] = useState('BoxingKing');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load game settings from Firebase
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const settingsRef = doc(db, "admin", "gameSettings");
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as DocumentData;
          
          // Validate the data has the expected structure before using it
          if (data && data.games) {
            setGameSettings(data as GameSettings);
            console.log("Game settings loaded from Firebase:", data);
          } else {
            console.warn("Firebase data doesn't have the expected 'games' structure:", data);
          }
        }
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    
    fetchGameSettings();
  }, []);
  
  // Handle game selection change
  const handleGameChange = (game: string) => {
    setSelectedGame(game);
  };
  
  // Update specific game setting
  const updateGameSetting = (game: string, setting: string, value: any) => {
    setGameSettings(prev => {
      // Create a deep copy to avoid mutation
      const updated = JSON.parse(JSON.stringify(prev)) as GameSettings;
      
      // Ensure the game exists in settings
      if (!updated.games[game]) {
        updated.games[game] = { ...updated.games.default };
      }
      
      // Update the specific setting
      if (setting.includes('.')) {
        // Handle nested properties like specialRules.firstTwoBetsWin
        const [parent, child] = setting.split('.');
        if (parent === 'specialRules') {
          if (!updated.games[game].specialRules) {
            updated.games[game].specialRules = {
              firstTwoBetsWin: true,
              firstTwoBetsMultiplier: 2,
              regularMultiplier: 0.7
            };
          }
          (updated.games[game].specialRules as any)[child] = value;
        }
      } else {
        (updated.games[game] as any)[setting] = value;
      }
      
      return updated;
    });
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      const success = await saveGameSettings(gameSettings);
      
      if (success) {
        toast({
          title: t('settingsSaved'),
          description: t('gameSettingsUpdated'),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset to defaults
  const handleResetDefaults = () => {
    const defaultSettings: GameSetting = {
      winRate: 25,
      minBet: 10,
      maxBet: 500,
      maxWin: 5000,
      isActive: true
    };
    
    if (selectedGame === 'BoxingKing') {
      defaultSettings.specialRules = {
        firstTwoBetsWin: true,
        firstTwoBetsMultiplier: 2,
        regularMultiplier: 0.7
      };
    }
    
    // Update the selected game with default values
    setGameSettings(prev => {
      const updated = JSON.parse(JSON.stringify(prev)) as GameSettings;
      updated.games[selectedGame] = defaultSettings;
      return updated;
    });
    
    toast({
      title: t('settingsReset'),
      description: t('defaultSettingsRestored'),
    });
  };

  // Get current game settings
  const getCurrentGameSettings = (): GameSetting => {
    // Safely access game settings with fallbacks
    return gameSettings?.games?.[selectedGame] || gameSettings?.games?.default || {
      winRate: 25,
      minBet: 10,
      maxBet: 500,
      maxWin: 5000,
      isActive: true
    };
  };

  const currentGame = getCurrentGameSettings();
  // Initialize specialRules if it doesn't exist and we're on BoxingKing
  const specialRules = currentGame.specialRules || 
    (selectedGame === 'BoxingKing' ? {
      firstTwoBetsWin: true, 
      firstTwoBetsMultiplier: 2, 
      regularMultiplier: 0.7
    } : undefined);

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{t('gameOddsAdmin')}</h1>

        <Tabs defaultValue="settings">
          <TabsList className="w-full mb-6 bg-gray-800">
            <TabsTrigger value="settings" className="flex-1">{t('gameSettings')}</TabsTrigger>
            <TabsTrigger value="symbols" className="flex-1">{t('gameSymbols')}</TabsTrigger>
            <TabsTrigger value="statistics" className="flex-1">{t('gameStatistics')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            {/* Game selector */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{t('selectGame')}</CardTitle>
                <CardDescription>{t('chooseGameToEdit')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.keys(gameSettings.games)
                    .filter(game => game !== 'default') // Hide default from buttons
                    .map((game) => (
                      <Button
                        key={game}
                        variant={selectedGame === game ? "default" : "outline"}
                        onClick={() => handleGameChange(game)}
                        className={selectedGame === game ? "bg-green-600" : ""}
                      >
                        {game}
                      </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('winningOdds')}</CardTitle>
                  <CardDescription>{t('adjustGameProbabilities')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t('winProbability')}</Label>
                      <span className="text-casino-accent">{currentGame.winRate}%</span>
                    </div>
                    <Slider 
                      value={[currentGame.winRate]} 
                      min={5} 
                      max={70} 
                      step={1} 
                      onValueChange={(value) => updateGameSetting(selectedGame, 'winRate', value[0])}
                    />
                  </div>
                  
                  {selectedGame === 'BoxingKing' && specialRules && (
                    <div>
                      <div className="mt-4 mb-2 font-semibold">Special Rules for Boxing King</div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>First 2 bets always win</Label>
                          <Switch 
                            checked={specialRules.firstTwoBetsWin} 
                            onCheckedChange={(checked) => 
                              updateGameSetting(selectedGame, 'specialRules.firstTwoBetsWin', checked)
                            }
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>First 2 bets multiplier</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              value={specialRules.firstTwoBetsMultiplier} 
                              onChange={(e) => 
                                updateGameSetting(
                                  selectedGame, 
                                  'specialRules.firstTwoBetsMultiplier', 
                                  parseFloat(e.target.value) || 2
                                )
                              } 
                              className="bg-gray-800"
                            />
                            <span>x</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Regular multiplier</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              step="0.1"
                              min="0.1"
                              max="5"
                              value={specialRules.regularMultiplier} 
                              onChange={(e) => 
                                updateGameSetting(
                                  selectedGame, 
                                  'specialRules.regularMultiplier', 
                                  parseFloat(e.target.value) || 0.7
                                )
                              } 
                              className="bg-gray-800"
                            />
                            <span>x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('payoutSettings')}</CardTitle>
                  <CardDescription>{t('adjustBetsAndMultipliers')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('minBet')}</Label>
                      <Input 
                        type="number" 
                        value={currentGame.minBet} 
                        onChange={(e) => updateGameSetting(selectedGame, 'minBet', parseInt(e.target.value) || 1)} 
                        min={1} 
                        className="bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('maxBet')}</Label>
                      <Input 
                        type="number" 
                        value={currentGame.maxBet} 
                        onChange={(e) => updateGameSetting(selectedGame, 'maxBet', parseInt(e.target.value) || 100)} 
                        min={10} 
                        className="bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('maxWin')}</Label>
                    <Input 
                      type="number" 
                      value={currentGame.maxWin} 
                      onChange={(e) => updateGameSetting(selectedGame, 'maxWin', parseInt(e.target.value) || 1000)} 
                      min={100} 
                      className="bg-gray-800"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t('gameStatus')}</CardTitle>
                  <CardDescription>{t('controlGameAvailability')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t('gameActive')}</Label>
                    <Switch 
                      checked={currentGame.isActive} 
                      onCheckedChange={(checked) => updateGameSetting(selectedGame, 'isActive', checked)} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 bg-gray-800 rounded-b-lg">
                  <Button 
                    variant="outline" 
                    onClick={handleResetDefaults}
                  >
                    {t('resetToDefaults')}
                  </Button>
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={isLoading}
                  >
                    {isLoading ? t('saving') + '...' : t('saveSettings')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="symbols">
            <Card>
              <CardHeader>
                <CardTitle>{t('symbolsAndPayouts')}</CardTitle>
                <CardDescription>{t('configureGameSymbols')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Seven', value: 10, image: '/placeholder.svg' },
                    { name: 'Wild', value: 15, image: '/placeholder.svg' },
                    { name: 'Bell', value: 5, image: '/placeholder.svg' },
                    { name: 'Cherry', value: 3, image: '/placeholder.svg' },
                    { name: 'Lemon', value: 2, image: '/placeholder.svg' },
                    { name: 'Orange', value: 2, image: '/placeholder.svg' },
                    { name: 'Heart', value: 1, image: '/placeholder.svg' },
                    { name: 'Club', value: 1, image: '/placeholder.svg' },
                    { name: 'Spade', value: 1, image: '/placeholder.svg' },
                  ].map((symbol, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">{symbol.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="mb-2 bg-gray-700 rounded-md p-2 flex justify-center">
                          <img src={symbol.image} alt={symbol.name} className="h-12 object-contain" />
                        </div>
                        <div className="flex justify-between">
                          <Label>{t('multiplier')}</Label>
                          <Input 
                            type="number" 
                            value={symbol.value} 
                            className="w-16 bg-gray-900 text-right" 
                            min={1}
                            max={50}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>{t('saveSymbols')}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>{t('gameStatistics')}</CardTitle>
                <CardDescription>{t('viewGamePerformance')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">{t('totalBets')}</div>
                    <div className="text-2xl font-bold text-white">1,248</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">{t('totalWagered')}</div>
                    <div className="text-2xl font-bold text-white">{t('currency')}12,480</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">{t('houseProfit')}</div>
                    <div className="text-2xl font-bold text-green-500">{t('currency')}624</div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">{t('recentActivity')}</h3>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between text-sm bg-gray-700 p-2 rounded">
                        <div>User1{i+1}</div>
                        <div>{t('bet')}: {t('currency')}{(Math.random() * 10 + 2).toFixed(2)}</div>
                        <div className={`${Math.random() > 0.6 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.random() > 0.6 ? '+' : '-'}{t('currency')}{(Math.random() * 20 + 5).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default GameOddsAdmin;
