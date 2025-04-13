
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Percent, DollarSign, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MegaSpinControl = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [houseEdge, setHouseEdge] = useState(2.7);
  const [maxWin, setMaxWin] = useState(50000);
  const [payoutMultiplier, setPayoutMultiplier] = useState(35);
  const [isSaving, setIsSaving] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(true);
  
  // Check if the current user is admin
  React.useEffect(() => {
    // Assume admin privileges for users with admin in their username or email
    const isAdmin = user && (
      user.username?.toLowerCase().includes('admin') || 
      user.email?.toLowerCase().includes('admin')
    );
    
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  const calculateRTP = () => {
    // European roulette RTP calculation: (36/37) * 100 = 97.3%
    return 100 - houseEdge;
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Mega Spin odds have been updated successfully.",
      });
      setIsSaving(false);
    }, 1500);
    
    // Here you would save to Firebase or other backend
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950">
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/game/megaspin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Game
          </Button>
          
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500"
            animate={{ 
              textShadow: ["0 0 4px rgba(6,182,212,0.3)", "0 0 8px rgba(6,182,212,0.6)", "0 0 4px rgba(6,182,212,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Mega Spin Control Panel
          </motion.h1>
          
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-400" />
              General Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-yellow-500" />
                    House Edge (%)
                  </label>
                  <span className="text-yellow-400 font-mono">{houseEdge}%</span>
                </div>
                <Slider 
                  value={[houseEdge]} 
                  min={1} 
                  max={10} 
                  step={0.1}
                  onValueChange={(values) => setHouseEdge(values[0])} 
                  className="my-4"
                />
                <p className="text-xs text-gray-400">European roulette standard is 2.7%. Higher house edge increases profit but may discourage players.</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Max Win
                  </label>
                  <span className="text-green-400 font-mono">${maxWin.toLocaleString()}</span>
                </div>
                <Input
                  type="number"
                  value={maxWin}
                  onChange={(e) => setMaxWin(Number(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum amount a player can win in a single spin.</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                    Payout Multiplier
                  </label>
                  <span className="text-blue-400 font-mono">{payoutMultiplier}x</span>
                </div>
                <Slider 
                  value={[payoutMultiplier]} 
                  min={20} 
                  max={50} 
                  step={1}
                  onValueChange={(values) => setPayoutMultiplier(values[0])} 
                  className="my-4"
                />
                <p className="text-xs text-gray-400">Standard payout for single number is 35x. Higher values increase player wins.</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-adjust"
                  checked={autoAdjust}
                  onCheckedChange={setAutoAdjust}
                />
                <Label htmlFor="auto-adjust" className="text-gray-300">Auto-adjust odds based on profit target</Label>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
              <div className="flex items-center text-sm text-blue-300 mb-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                Expected Return Statistics
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-900/50 p-2 rounded">
                  <div className="text-gray-400">Player RTP:</div>
                  <div className="text-white font-mono">{calculateRTP().toFixed(1)}%</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded">
                  <div className="text-gray-400">House Advantage:</div>
                  <div className="text-white font-mono">{houseEdge.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Game Configuration</h2>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-3">Number Board Settings</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Zero Payout</label>
                      <Input
                        type="number"
                        value="35"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Standard Number Payout</label>
                      <Input
                        type="number"
                        value="35"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Minimum Bet</label>
                      <Input
                        type="number"
                        value="1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Maximum Bet</label>
                      <Input
                        type="number"
                        value="100"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-3">Game Rules</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="european-rules"
                        checked={true}
                      />
                      <Label htmlFor="european-rules" className="text-gray-300">Use European roulette rules (single zero)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="american-rules"
                        checked={false}
                      />
                      <Label htmlFor="american-rules" className="text-gray-300">Use American roulette rules (double zero)</Label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-3">Special Bets</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-red-black"
                        checked={true}
                      />
                      <Label htmlFor="enable-red-black" className="text-gray-300">Enable Red/Black bets</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-odd-even"
                        checked={true}
                      />
                      <Label htmlFor="enable-odd-even" className="text-gray-300">Enable Odd/Even bets</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-dozen"
                        checked={false}
                      />
                      <Label htmlFor="enable-dozen" className="text-gray-300">Enable Dozen bets</Label>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MegaSpinControl;
