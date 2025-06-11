
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Minus, History } from 'lucide-react';
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
import PlinkoBoard from '@/components/PlinkoBoard';

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
    }, 1500);
    
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
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              PLINKO
            </motion.h1>
            <motion.div 
              className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-pink-500 border-t-transparent rounded-full mx-auto animate-spin"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            <motion.p 
              className="text-gray-400 mt-4 text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Loading game...
            </motion.p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 via-purple-900 to-black flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-1 md:px-2 py-2 md:py-4">
        <div className="flex justify-between items-center py-2 mb-2 md:mb-4">
          <button onClick={() => navigate('/')} className="text-gray-300 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <motion.h1 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            PLINKO
          </motion.h1>
          <button className="text-gray-300 hover:text-white transition-colors">
            <Settings className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
        
        <div className="relative flex-grow flex flex-col items-center pb-2 md:pb-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full mb-2 md:mb-4"
          >
            <RiskSelector selectedRisk={risk} onSelectRisk={handleRiskChange} />
          </motion.div>
          
          <div className="w-full flex-grow flex items-center justify-center p-1 md:p-2">
            <motion.div 
              className="w-full max-w-sm md:max-w-md bg-gradient-to-b from-violet-900 to-purple-950 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PlinkoBoard 
                rows={8} 
                selectedRisk={risk}
                onResult={handleBetResult}
                isDropping={isDropping}
                onDropComplete={handleDropComplete}
              />
            </motion.div>
          </div>
          
          <motion.div 
            className="w-full max-w-sm md:max-w-md"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-3 md:mb-4 bg-purple-900 bg-opacity-50 p-3 md:p-4 rounded-lg shadow-[0_4px_10px_rgba(168,85,247,0.3)]">
              <div className="flex justify-between items-center mb-3 md:mb-4 gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Bet Amount</div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-purple-800 border-purple-600 text-purple-300 hover:bg-purple-700"
                      onClick={() => changeBetAmount(-10)}
                      disabled={betAmount <= 10 || isDropping}
                    >
                      <Minus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="h-7 w-16 md:h-8 md:w-20 mx-2 text-center bg-purple-800 border-purple-600 text-white text-sm"
                      disabled={isDropping}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-purple-800 border-purple-600 text-purple-300 hover:bg-purple-700"
                      onClick={() => changeBetAmount(10)}
                      disabled={betAmount >= 1000 || isDropping}
                    >
                      <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    className={`w-full text-sm md:text-base bg-gradient-to-r ${
                      isDropping 
                        ? 'from-gray-600 to-gray-700' 
                        : 'from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600'
                    } text-white font-bold rounded-md px-3 py-2 md:px-6 md:py-3 shadow-[0_0_10px_rgba(139,92,246,0.5)]`}
                    disabled={isDropping || !user || (user && user.balance < betAmount)}
                    onClick={handleDrop}
                  >
                    {isDropping ? 'Dropping...' : 'PLACE BET'}
                  </Button>
                </motion.div>
                
                <div className="flex-1 text-right">
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <div className="text-yellow-400 font-bold text-sm">
                    {user ? balance.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-white flex items-center">
                  <History className="h-3 w-3 md:h-4 md:w-4 mr-2" /> Bet History
                </h3>
              </div>
              <BetHistory history={betHistory.map(item => ({
                id: item.id,
                timestamp: item.timestamp,
                betAmount: item.betAmount,
                multiplier: item.multiplier,
                winAmount: item.winAmount
              }))} />
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <PlinkoFooter />
    </div>
  );
};

// Custom footer for Plinko
const PlinkoFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-900 to-violet-800 p-4 text-white shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-yellow-300 mb-2">CK444 Casino</h3>
            <p className="text-gray-300">Drop the ball and win big!</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Contact Us</h4>
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@ck444.com</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 9876543210</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-yellow-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-purple-700 text-center">
          <p className="text-sm text-gray-400">&copy; 2025 CK444 Casino. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-1">18+ Gamble Responsibly</p>
        </div>
      </div>
    </footer>
  );
};

export default PlinkoGame;
