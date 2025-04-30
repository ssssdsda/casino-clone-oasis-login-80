import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Percent, DollarSign, RefreshCw, Settings, AlertCircle, Save as SaveIcon } from 'lucide-react';
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

const symbols = [
  { id: 'seven', name: 'Seven', value: 10 },
  { id: 'bell', name: 'Bell', value: 5 },
  { id: 'cherry', name: 'Cherry', value: 3 },
  { id: 'orange', name: 'Orange', value: 2 },
  { id: 'lemon', name: 'Lemon', value: 2 },
  { id: 'heart', name: 'Heart', value: 1 },
  { id: 'club', name: 'Club', value: 1 },
  { id: 'spade', name: 'Spade', value: 1 },
  { id: 'wild', name: 'Wild', value: 15 },
];

const SpinControl = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [symbolValues, setSymbolValues] = useState<{[key: string]: number}>(
    symbols.reduce((acc, symbol) => ({ ...acc, [symbol.id]: symbol.value }), {})
  );
  
  const [houseEdge, setHouseEdge] = useState(5);
  const [maxWin, setMaxWin] = useState(10000);
  const [isSaving, setIsSaving] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(true);
  
  // Check if the current user is admin - using username instead of email
  React.useEffect(() => {
    // Assume admin privileges for users with admin in their username
    const isAdmin = user && user.username?.toLowerCase().includes('admin');
    
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  const handleSymbolValueChange = (id: string, value: number) => {
    setSymbolValues(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const calculateExpectedValue = () => {
    const totalValue = Object.values(symbolValues).reduce((sum, val) => sum + val, 0);
    const averageValue = totalValue / Object.values(symbolValues).length;
    return (100 - houseEdge) / 100 * averageValue;
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Game odds have been updated successfully.",
      });
      setIsSaving(false);
    }, 1500);
    
    // Here you would save to Firebase or other backend
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950">
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/game/spin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Game
          </Button>
          
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"
            animate={{ 
              textShadow: ["0 0 4px rgba(236,72,153,0.3)", "0 0 8px rgba(236,72,153,0.6)", "0 0 4px rgba(236,72,153,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Spin Game Control Panel
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
              <SaveIcon className="h-4 w-4 mr-2" />
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
                  max={15} 
                  step={0.1}
                  onValueChange={(values) => setHouseEdge(values[0])} 
                  className="my-4"
                />
                <p className="text-xs text-gray-400">Higher house edge increases profit but may discourage players.</p>
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
                  <div className="text-gray-400">Expected Value:</div>
                  <div className="text-white font-mono">{calculateExpectedValue().toFixed(2)}</div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded">
                  <div className="text-gray-400">Player RTP:</div>
                  <div className="text-white font-mono">{(100 - houseEdge).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Symbol Values</h2>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {symbols.map((symbol) => (
                  <div key={symbol.id} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center mr-3">
                          {/* Symbol icon placeholder */}
                          <span className="text-lg font-bold text-white">{symbol.name.charAt(0)}</span>
                        </div>
                        <span className="text-white">{symbol.name}</span>
                      </div>
                      <span className="text-yellow-400 font-mono">
                        {symbolValues[symbol.id]}x
                      </span>
                    </div>
                    
                    <Slider 
                      value={[symbolValues[symbol.id]]} 
                      min={1} 
                      max={symbol.id === 'wild' ? 30 : 20} 
                      step={1}
                      onValueChange={(values) => handleSymbolValueChange(symbol.id, values[0])} 
                    />
                    
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpinControl;
