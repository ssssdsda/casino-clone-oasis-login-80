
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBettingSystemSettings, updateBettingSystemSettings } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MegaSpinControl = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [minBet, setMinBet] = useState('10');
  const [maxBet, setMaxBet] = useState('1000');
  const [maxWinAmount, setMaxWinAmount] = useState('5000');
  const [referralBonus, setReferralBonus] = useState('119');
  
  // Game-specific win patterns
  const [aviatorPattern, setAviatorPattern] = useState('');
  const [superAcePattern, setSuperAcePattern] = useState('');
  const [goldenBasinPattern, setGoldenBasinPattern] = useState('');
  const [coinUpPattern, setCoinUpPattern] = useState('');
  const [fruityBonanzaPattern, setFruityBonanzaPattern] = useState('');
  const [megaSpinPattern, setMegaSpinPattern] = useState('');
  const [fortuneGemsPattern, setFortuneGemsPattern] = useState('');
  const [coinsPattern, setCoinsPattern] = useState('');
  
  // Game-specific win ratios
  const [aviatorRatio, setAviatorRatio] = useState('0.25');
  const [superAceRatio, setSuperAceRatio] = useState('0.30');
  const [goldenBasinRatio, setGoldenBasinRatio] = useState('0.20');
  const [coinUpRatio, setCoinUpRatio] = useState('0.25');
  const [fruityBonanzaRatio, setFruityBonanzaRatio] = useState('0.20');
  const [megaSpinRatio, setMegaSpinRatio] = useState('0.30');
  const [fortuneGemsRatio, setFortuneGemsRatio] = useState('0.20');
  const [coinsRatio, setCoinsRatio] = useState('0.20');
  
  const [depositBonusThreshold, setDepositBonusThreshold] = useState('500');
  const [depositBonusAmount, setDepositBonusAmount] = useState('500');

  useEffect(() => {
    // Check if username contains 'admin' instead of checking email
    const isAdmin = user && user.username?.toLowerCase().includes('admin');
    
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
    } else {
      loadSettings();
    }
  }, [user, navigate]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getBettingSystemSettings();
      
      if (settings) {
        // Load general settings
        setMinBet(settings.minBet?.toString() || '10');
        setMaxBet(settings.maxBet?.toString() || '1000');
        setMaxWinAmount(settings.maxWinAmount?.toString() || '5000');
        setReferralBonus(settings.referralBonus?.toString() || '119');
        setDepositBonusThreshold(settings.depositBonusThreshold?.toString() || '500');
        setDepositBonusAmount(settings.depositBonusAmount?.toString() || '500');
        
        // Load win patterns
        if (settings.winPatterns) {
          if (settings.winPatterns.aviator) {
            setAviatorPattern(settings.winPatterns.aviator.join(','));
          }
          if (settings.winPatterns.superAce) {
            setSuperAcePattern(settings.winPatterns.superAce.join(','));
          }
          if (settings.winPatterns.goldenBasin) {
            setGoldenBasinPattern(settings.winPatterns.goldenBasin.join(','));
          }
          if (settings.winPatterns.coinUp) {
            setCoinUpPattern(settings.winPatterns.coinUp.join(','));
          }
          if (settings.winPatterns.fruityBonanza) {
            setFruityBonanzaPattern(settings.winPatterns.fruityBonanza.join(','));
          }
          if (settings.winPatterns.megaSpin) {
            setMegaSpinPattern(settings.winPatterns.megaSpin.join(','));
          }
          if (settings.winPatterns.fortuneGems) {
            setFortuneGemsPattern(settings.winPatterns.fortuneGems.join(','));
          }
          if (settings.winPatterns.coins) {
            setCoinsPattern(settings.winPatterns.coins.join(','));
          }
        }
        
        // Load win ratios
        if (settings.winRatios) {
          if (settings.winRatios.aviator !== undefined) {
            setAviatorRatio(settings.winRatios.aviator.toString());
          }
          if (settings.winRatios.superAce !== undefined) {
            setSuperAceRatio(settings.winRatios.superAce.toString());
          }
          if (settings.winRatios.goldenBasin !== undefined) {
            setGoldenBasinRatio(settings.winRatios.goldenBasin.toString());
          }
          if (settings.winRatios.coinUp !== undefined) {
            setCoinUpRatio(settings.winRatios.coinUp.toString());
          }
          if (settings.winRatios.fruityBonanza !== undefined) {
            setFruityBonanzaRatio(settings.winRatios.fruityBonanza.toString());
          }
          if (settings.winRatios.megaSpin !== undefined) {
            setMegaSpinRatio(settings.winRatios.megaSpin.toString());
          }
          if (settings.winRatios.fortuneGems !== undefined) {
            setFortuneGemsRatio(settings.winRatios.fortuneGems.toString());
          }
          if (settings.winRatios.coins !== undefined) {
            setCoinsRatio(settings.winRatios.coins.toString());
          }
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Parse pattern strings into arrays
      const aviatorPatternArray = aviatorPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const superAcePatternArray = superAcePattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const goldenBasinPatternArray = goldenBasinPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const coinUpPatternArray = coinUpPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const fruityBonanzaPatternArray = fruityBonanzaPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const megaSpinPatternArray = megaSpinPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const fortuneGemsPatternArray = fortuneGemsPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      const coinsPatternArray = coinsPattern
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));
      
      // Create settings object
      const settings = {
        minBet: parseInt(minBet),
        maxBet: parseInt(maxBet),
        maxWinAmount: parseInt(maxWinAmount),
        referralBonus: parseInt(referralBonus),
        depositBonusThreshold: parseInt(depositBonusThreshold),
        depositBonusAmount: parseInt(depositBonusAmount),
        winPatterns: {
          aviator: aviatorPatternArray,
          superAce: superAcePatternArray,
          goldenBasin: goldenBasinPatternArray,
          coinUp: coinUpPatternArray,
          fruityBonanza: fruityBonanzaPatternArray,
          megaSpin: megaSpinPatternArray,
          fortuneGems: fortuneGemsPatternArray,
          coins: coinsPatternArray
        },
        winRatios: {
          aviator: parseFloat(aviatorRatio),
          superAce: parseFloat(superAceRatio),
          goldenBasin: parseFloat(goldenBasinRatio),
          coinUp: parseFloat(coinUpRatio),
          fruityBonanza: parseFloat(fruityBonanzaRatio),
          megaSpin: parseFloat(megaSpinRatio),
          fortuneGems: parseFloat(fortuneGemsRatio),
          coins: parseFloat(coinsRatio)
        }
      };
      
      const success = await updateBettingSystemSettings(settings);
      
      if (success) {
        toast({
          title: "Success",
          description: "Betting system settings updated",
          className: "bg-green-600 text-white"
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">All Game Control Panel</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="patterns">Win Patterns</TabsTrigger>
            <TabsTrigger value="ratios">Win Ratios</TabsTrigger>
            <TabsTrigger value="bonus">Bonus Settings</TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general">
            <Card className="bg-gray-800 text-white p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Bet Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min-bet">Minimum Bet</Label>
                  <Input
                    id="min-bet"
                    type="number"
                    value={minBet}
                    onChange={(e) => setMinBet(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="max-bet">Maximum Bet</Label>
                  <Input
                    id="max-bet"
                    type="number"
                    value={maxBet}
                    onChange={(e) => setMaxBet(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="max-win">Maximum Win Amount (Daily)</Label>
                  <Input
                    id="max-win"
                    type="number"
                    value={maxWinAmount}
                    onChange={(e) => setMaxWinAmount(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Win Patterns Tab */}
          <TabsContent value="patterns">
            <Card className="bg-gray-800 text-white p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Win Patterns</h2>
              <p className="text-gray-400 mb-4">
                Enter comma-separated values (1 for win, 0 for loss) that will be applied in sequence to determine game outcomes.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aviator-pattern">Aviator Pattern</Label>
                  <Textarea
                    id="aviator-pattern"
                    value={aviatorPattern}
                    onChange={(e) => setAviatorPattern(e.target.value)}
                    placeholder="1,1,0,0,0,1,0,0,1,1,0,0,0,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="superace-pattern">Super Ace Pattern</Label>
                  <Textarea
                    id="superace-pattern"
                    value={superAcePattern}
                    onChange={(e) => setSuperAcePattern(e.target.value)}
                    placeholder="1,0,1,0,1,0,1,0,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goldenbasin-pattern">Golden Basin Pattern</Label>
                  <Textarea
                    id="goldenbasin-pattern"
                    value={goldenBasinPattern}
                    onChange={(e) => setGoldenBasinPattern(e.target.value)}
                    placeholder="1,0,0,0,1,0,0,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coinup-pattern">Coin Up Pattern</Label>
                  <Textarea
                    id="coinup-pattern"
                    value={coinUpPattern}
                    onChange={(e) => setCoinUpPattern(e.target.value)}
                    placeholder="1,0,0,1,0,0,0,0,1"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fruity-pattern">Fruity Bonanza Pattern</Label>
                  <Textarea
                    id="fruity-pattern"
                    value={fruityBonanzaPattern}
                    onChange={(e) => setFruityBonanzaPattern(e.target.value)}
                    placeholder="1,0,0,0,1,0,0,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="megaspin-pattern">Mega Spin Pattern</Label>
                  <Textarea
                    id="megaspin-pattern"
                    value={megaSpinPattern}
                    onChange={(e) => setMegaSpinPattern(e.target.value)}
                    placeholder="1,0,0,0,1,0,0,1,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fortune-pattern">Fortune Gems Pattern</Label>
                  <Textarea
                    id="fortune-pattern"
                    value={fortuneGemsPattern}
                    onChange={(e) => setFortuneGemsPattern(e.target.value)}
                    placeholder="1,0,0,0,0,1,0,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coins-pattern">77 Coins Pattern</Label>
                  <Textarea
                    id="coins-pattern"
                    value={coinsPattern}
                    onChange={(e) => setCoinsPattern(e.target.value)}
                    placeholder="1,0,0,0,0,0,1,0,0"
                    className="bg-gray-700 text-white border-gray-600 mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Win Ratios Tab */}
          <TabsContent value="ratios">
            <Card className="bg-gray-800 text-white p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Win Ratios</h2>
              <p className="text-gray-400 mb-4">
                Set the win ratio for each game (0.0 to 1.0). For example, 0.25 means a 25% chance of winning.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="aviator-ratio">Aviator Win Ratio</Label>
                  <Input
                    id="aviator-ratio"
                    type="number"
                    value={aviatorRatio}
                    onChange={(e) => setAviatorRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="superace-ratio">Super Ace Win Ratio</Label>
                  <Input
                    id="superace-ratio"
                    type="number"
                    value={superAceRatio}
                    onChange={(e) => setSuperAceRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goldenbasin-ratio">Golden Basin Win Ratio</Label>
                  <Input
                    id="goldenbasin-ratio"
                    type="number"
                    value={goldenBasinRatio}
                    onChange={(e) => setGoldenBasinRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coinup-ratio">Coin Up Win Ratio</Label>
                  <Input
                    id="coinup-ratio"
                    type="number"
                    value={coinUpRatio}
                    onChange={(e) => setCoinUpRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fruity-ratio">Fruity Bonanza Win Ratio</Label>
                  <Input
                    id="fruity-ratio"
                    type="number"
                    value={fruityBonanzaRatio}
                    onChange={(e) => setFruityBonanzaRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="megaspin-ratio">Mega Spin Win Ratio</Label>
                  <Input
                    id="megaspin-ratio"
                    type="number"
                    value={megaSpinRatio}
                    onChange={(e) => setMegaSpinRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fortune-ratio">Fortune Gems Win Ratio</Label>
                  <Input
                    id="fortune-ratio"
                    type="number"
                    value={fortuneGemsRatio}
                    onChange={(e) => setFortuneGemsRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coins-ratio">77 Coins Win Ratio</Label>
                  <Input
                    id="coins-ratio"
                    type="number"
                    value={coinsRatio}
                    onChange={(e) => setCoinsRatio(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Bonus Settings Tab */}
          <TabsContent value="bonus">
            <Card className="bg-gray-800 text-white p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Bonus Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referral-bonus">Referral Bonus Amount (৳)</Label>
                  <Input
                    id="referral-bonus"
                    type="number"
                    value={referralBonus}
                    onChange={(e) => setReferralBonus(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit-threshold">Deposit Bonus Threshold (৳)</Label>
                  <Input
                    id="deposit-threshold"
                    type="number"
                    value={depositBonusThreshold}
                    onChange={(e) => setDepositBonusThreshold(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit-bonus">Deposit Bonus Amount (৳)</Label>
                  <Input
                    id="deposit-bonus"
                    type="number"
                    value={depositBonusAmount}
                    onChange={(e) => setDepositBonusAmount(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
          >
            Save All Settings
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MegaSpinControl;
