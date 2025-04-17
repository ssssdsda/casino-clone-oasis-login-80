
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
import { getBettingSystemSettings, updateBettingSystemSettings } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BettingSystemControl = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [minBet, setMinBet] = useState('10');
  const [maxBet, setMaxBet] = useState('1000');
  const [referralBonus, setReferralBonus] = useState('119');
  const [aviatorPattern, setAviatorPattern] = useState('');
  const [superAcePattern, setSuperAcePattern] = useState('');
  const [depositBonusThreshold, setDepositBonusThreshold] = useState('500');
  const [depositBonusAmount, setDepositBonusAmount] = useState('500');

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
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
        setMinBet(settings.minBet?.toString() || '10');
        setMaxBet(settings.maxBet?.toString() || '1000');
        setReferralBonus(settings.referralBonus?.toString() || '119');
        setDepositBonusThreshold(settings.depositBonusThreshold?.toString() || '500');
        setDepositBonusAmount(settings.depositBonusAmount?.toString() || '500');
        
        // Convert arrays to comma-separated strings for editing
        if (settings.winPatterns?.aviator) {
          setAviatorPattern(settings.winPatterns.aviator.join(','));
        }
        
        if (settings.winPatterns?.superAce) {
          setSuperAcePattern(settings.winPatterns.superAce.join(','));
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
      
      const settings = {
        minBet: parseInt(minBet),
        maxBet: parseInt(maxBet),
        referralBonus: parseInt(referralBonus),
        depositBonusThreshold: parseInt(depositBonusThreshold),
        depositBonusAmount: parseInt(depositBonusAmount),
        winPatterns: {
          aviator: aviatorPatternArray,
          superAce: superAcePatternArray
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Betting System Control</h1>

        <Card className="bg-gray-800 text-white p-6 mb-6">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Bet Limits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Win Patterns</h2>
              <p className="text-gray-400 mb-2">
                Enter comma-separated values (1 for win, 0 for loss) that will be applied in sequence to determine game outcomes.
              </p>
              
              <div className="mb-4">
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
            </div>

            <div>
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
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default BettingSystemControl;
