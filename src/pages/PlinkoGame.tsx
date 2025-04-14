
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Minus } from 'lucide-react';
import PlinkoBoard from '@/components/PlinkoBoard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RiskSelector from '@/components/RiskSelector';
import BetHistory from '@/components/BetHistory';
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

// Types
type BetHistoryItem = {
  id: string;
  betAmount: number;
  multiplier: string;
  winAmount: number;
  timestamp: string;
};

const generateMultipliers = (risk: string): number[] => {
  switch (risk) {
    case 'LOW':
      return [5.6, 2.1, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 2.1, 5.6];
    case 'MEDIUM':
      return [16, 4.2, 2.3, 1.4, 1.0, 0.0, 1.0, 1.4, 2.3, 4.2, 16];
    case 'HIGH':
      return [110, 14, 5.3, 2.1, 1.1, 0.0, 1.1, 2.1, 5.3, 14, 110];
    default:
      return [5.6, 2.1, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 2.1, 5.6];
  }
};

const PlinkoGame = () => {
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<string>('MEDIUM');
  const [multipliers, setMultipliers] = useState<number[]>(generateMultipliers('MEDIUM'));
  const [isDropping, setIsDropping] = useState(false);
  const [balance, setBalance] = useState(0);
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [betCount, setBetCount] = useState(0); // Track number of bets for the rigged system

  useEffect(() => {
    // Update multipliers when risk changes
    setMultipliers(generateMultipliers(risk));
  }, [risk]);

  useEffect(() => {
    // Show loading for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    // Use the actual user balance
    if (user) {
      setBalance(user.balance);
    }
    
    return () => clearTimeout(timer);
  }, [user]);
  
  // Update balance whenever user changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user?.balance]);
  
  const changeBetAmount = (amount: number) => {
    const newAmount = Math.max(10, Math.min(1000, betAmount + amount));
    setBetAmount(newAmount);
  };
  
  const handleDrop = () => {
    if (isDropping) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive",
      });
      return;
    }
    
    if (balance < betAmount) {
      toast({
        title: "Insufficient Funds",
        description: "Please deposit more to play",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet from balance
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    if (user) {
      updateUserBalance(newBalance);
    }
    
    setIsDropping(true);
    
    // Increment bet count
    const newBetCount = betCount + 1;
    setBetCount(newBetCount);
  };
  
  const handleBetResult = (multiplier: number, multiplierIndex: number) => {
    const shouldWin = shouldBetWin(user?.id || 'anonymous');
    
    // Cap the winning amount at 100
    let actualMultiplier = multiplier;
    const rawWinAmount = betAmount * actualMultiplier;
    
    if (shouldWin) {
      // Calculate win amount (capped at 100)
      const winAmount = Math.min(100, rawWinAmount);
      
      // Add win to balance
      const newBalance = balance + winAmount;
      setBalance(newBalance);
      if (user) {
        updateUserBalance(newBalance);
      }
      
      // Add to bet history
      const historyItem: BetHistoryItem = {
        id: Math.random().toString(36).substring(2),
        betAmount: betAmount,
        multiplier: actualMultiplier.toString(),
        winAmount: winAmount,
        timestamp: new Date().toISOString(),
      };
      
      setBetHistory(prev => [historyItem, ...prev].slice(0, 10));
      
      toast({
        title: "You Won!",
        description: `${winAmount.toFixed(2)} coins`,
        variant: "default",
        className: "bg-green-500 text-white font-bold"
      });
    } else {
      // Player loses
      const historyItem: BetHistoryItem = {
        id: Math.random().toString(36).substring(2),
        betAmount: betAmount,
        multiplier: "0",
        winAmount: 0,
        timestamp: new Date().toISOString(),
      };
      
      setBetHistory(prev => [historyItem, ...prev].slice(0, 10));
      
      toast({
        title: "Better luck next time!",
        description: `You lost ${betAmount.toFixed(2)} coins`,
        variant: "destructive"
      });
    }
  };
  
  const handleDropComplete = () => {
    setIsDropping(false);
  };
  
  const handleRiskChange = (newRisk: string) => {
    setRisk(newRisk);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 mb-4">PLINKO</h1>
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-pink-500 border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="text-gray-400 mt-4">Loading game...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-2">
        <div className="flex justify-between items-center py-2">
          <button onClick={() => navigate('/')} className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">
            PLINKO
          </h1>
          <button className="text-gray-400">
            <Settings className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative flex-grow flex flex-col items-center pb-4">
          <RiskSelector selectedRisk={risk} onSelectRisk={handleRiskChange} />
          
          <div className="w-full flex-grow flex items-center justify-center p-2">
            <div className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              <PlinkoBoard 
                rows={8} 
                selectedRisk={risk}
                onResult={handleBetResult}
                isDropping={isDropping}
                onDropComplete={handleDropComplete}
              />
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <div className="mb-4 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-xs text-gray-400">Bet Amount</div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => changeBetAmount(-10)}
                      disabled={betAmount <= 10 || isDropping}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="h-8 w-20 mx-2 text-center"
                      disabled={isDropping}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => changeBetAmount(10)}
                      disabled={betAmount >= 1000 || isDropping}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`bg-gradient-to-r ${
                      isDropping 
                        ? 'from-gray-600 to-gray-700' 
                        : 'from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600'
                    } text-white font-bold rounded-md px-6 py-3`}
                    disabled={isDropping || !user || (user && user.balance < betAmount)}
                    onClick={handleDrop}
                  >
                    {isDropping ? 'Dropping...' : 'BET'}
                  </Button>
                </motion.div>
                
                <div>
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-yellow-400 font-bold">
                    {user ? balance.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
            
            <BetHistory history={betHistory.map(item => ({
              id: item.id,
              timestamp: item.timestamp,
              betAmount: item.betAmount,
              multiplier: item.multiplier,
              winAmount: item.winAmount
            }))} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlinkoGame;
