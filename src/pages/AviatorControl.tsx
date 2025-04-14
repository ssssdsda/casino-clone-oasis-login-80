
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ControlledOutcome {
  id: string;
  minBet: number;
  maxBet: number;
  outcome: 'win' | 'lose';
  multiplier: number;
}

const AviatorControl = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [outcomes, setOutcomes] = useState<ControlledOutcome[]>([]);
  const [minBet, setMinBet] = useState('100');
  const [maxBet, setMaxBet] = useState('500');
  const [outcome, setOutcome] = useState<'win' | 'lose'>('win');
  const [multiplier, setMultiplier] = useState('2.5');

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
    }

    // Load saved outcomes from localStorage
    const savedOutcomes = localStorage.getItem('aviatorOutcomes');
    if (savedOutcomes) {
      setOutcomes(JSON.parse(savedOutcomes));
    }

    const savedEnabled = localStorage.getItem('aviatorControlEnabled');
    if (savedEnabled) {
      setIsEnabled(savedEnabled === 'true');
    }
  }, [user, navigate]);

  // Save outcomes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aviatorOutcomes', JSON.stringify(outcomes));
  }, [outcomes]);

  // Save enabled status to localStorage
  useEffect(() => {
    localStorage.setItem('aviatorControlEnabled', isEnabled.toString());
  }, [isEnabled]);

  const handleAddOutcome = () => {
    const newOutcome: ControlledOutcome = {
      id: Date.now().toString(),
      minBet: parseFloat(minBet),
      maxBet: parseFloat(maxBet),
      outcome,
      multiplier: parseFloat(multiplier),
    };

    setOutcomes([...outcomes, newOutcome]);
    toast({
      title: "Outcome added",
      description: `${outcome.toUpperCase()} outcome added for bets between ${minBet} and ${maxBet} with multiplier ${multiplier}`,
    });

    // Reset form
    setMinBet('100');
    setMaxBet('500');
    setOutcome('win');
    setMultiplier('2.5');
  };

  const handleRemoveOutcome = (id: string) => {
    setOutcomes(outcomes.filter(item => item.id !== id));
  };

  const handleToggleControl = () => {
    setIsEnabled(!isEnabled);
    toast({
      title: !isEnabled ? "Control enabled" : "Control disabled",
      description: !isEnabled ? "Game outcomes will now be controlled" : "Game outcomes will now be random",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Aviator Game Control Panel</h1>

        <Card className="bg-gray-800 text-white p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Outcome Control System</h2>
              <p className="text-gray-400">Configure predetermined outcomes for specific bet ranges</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="control-toggle" checked={isEnabled} onCheckedChange={handleToggleControl} />
              <Label htmlFor="control-toggle">{isEnabled ? 'Enabled' : 'Disabled'}</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add New Outcome Rule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select value={outcome} onValueChange={(value: 'win' | 'lose') => setOutcome(value)}>
                    <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 text-white">
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="lose">Lose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="multiplier">Multiplier (for wins)</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>

                <Button onClick={handleAddOutcome} className="w-full bg-green-600 hover:bg-green-700">
                  Add Outcome Rule
                </Button>
              </div>
            </div>

            <div className="border-t md:border-l md:border-t-0 border-gray-700 md:pl-6 pt-4 md:pt-0">
              <h3 className="text-lg font-semibold mb-4">Current Outcome Rules</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {outcomes.length === 0 ? (
                  <p className="text-gray-400">No outcomes configured</p>
                ) : (
                  outcomes.map((item) => (
                    <div key={item.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                      <div>
                        <div className={`text-sm font-semibold ${item.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {item.outcome.toUpperCase()}{' '}
                          {item.outcome === 'win' && `(${item.multiplier}x)`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bet range: {item.minBet} - {item.maxBet} BDT
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveOutcome(item.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 text-white p-6">
          <h2 className="text-xl font-bold mb-4">Game Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-gray-400 mb-2">Total Bets</h3>
              <p className="text-2xl font-bold">1,254</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-gray-400 mb-2">Win Percentage</h3>
              <p className="text-2xl font-bold text-green-400">42.3%</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-gray-400 mb-2">Total Profit</h3>
              <p className="text-2xl font-bold text-green-400">+3,546,000 BDT</p>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AviatorControl;
