
import React, { useState } from 'react';
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

const GameOddsAdmin = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State for game settings
  const [payoutMultiplier, setPayoutMultiplier] = useState(1.0);
  const [winProbability, setWinProbability] = useState(30);
  const [jackpotProbability, setJackpotProbability] = useState(1);
  const [maxBet, setMaxBet] = useState(100);
  const [minBet, setMinBet] = useState(1);
  const [houseEdge, setHouseEdge] = useState(5);
  const [enableRealMoney, setEnableRealMoney] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Here we would save to Firebase
    toast({
      title: t('settingsSaved'),
      description: t('gameSettingsUpdated'),
    });
  };

  // Handle reset to defaults
  const handleResetDefaults = () => {
    setPayoutMultiplier(1.0);
    setWinProbability(30);
    setJackpotProbability(1);
    setMaxBet(100);
    setMinBet(1);
    setHouseEdge(5);
    setEnableRealMoney(true);
    setGameActive(true);
    
    toast({
      title: t('settingsReset'),
      description: t('defaultSettingsRestored'),
    });
  };

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
                      <span className="text-casino-accent">{winProbability}%</span>
                    </div>
                    <Slider 
                      value={[winProbability]} 
                      min={5} 
                      max={70} 
                      step={1} 
                      onValueChange={(value) => setWinProbability(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t('jackpotProbability')}</Label>
                      <span className="text-casino-accent">{jackpotProbability}%</span>
                    </div>
                    <Slider 
                      value={[jackpotProbability]} 
                      min={0.1} 
                      max={5} 
                      step={0.1} 
                      onValueChange={(value) => setJackpotProbability(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t('houseEdge')}</Label>
                      <span className="text-casino-accent">{houseEdge}%</span>
                    </div>
                    <Slider 
                      value={[houseEdge]} 
                      min={1} 
                      max={20} 
                      step={0.5} 
                      onValueChange={(value) => setHouseEdge(value[0])}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('payoutSettings')}</CardTitle>
                  <CardDescription>{t('adjustBetsAndMultipliers')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('payoutMultiplier')}</Label>
                    <div className="flex">
                      <Input 
                        type="number" 
                        value={payoutMultiplier} 
                        onChange={(e) => setPayoutMultiplier(parseFloat(e.target.value) || 1.0)} 
                        min={0.1} 
                        max={10} 
                        step={0.1} 
                        className="bg-gray-800"
                      />
                      <span className="flex items-center ml-2 text-gray-300">x</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('minBet')}</Label>
                      <Input 
                        type="number" 
                        value={minBet} 
                        onChange={(e) => setMinBet(parseInt(e.target.value) || 1)} 
                        min={1} 
                        className="bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('maxBet')}</Label>
                      <Input 
                        type="number" 
                        value={maxBet} 
                        onChange={(e) => setMaxBet(parseInt(e.target.value) || 100)} 
                        min={10} 
                        className="bg-gray-800"
                      />
                    </div>
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
                    <Switch checked={gameActive} onCheckedChange={setGameActive} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>{t('enableRealMoney')}</Label>
                    <Switch checked={enableRealMoney} onCheckedChange={setEnableRealMoney} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 bg-gray-800 rounded-b-lg">
                  <Button 
                    variant="outline" 
                    onClick={handleResetDefaults}
                  >
                    {t('resetToDefaults')}
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    {t('saveSettings')}
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
