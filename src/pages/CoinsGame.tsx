
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Coins, ChevronDown, ChevronUp, Diamond, Star, Award, Trophy, CircleDollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

// Types
type IconType = 'coins' | 'diamond' | 'star' | 'award' | 'trophy' | 'dollarSign';
type ReelItem = {
  icon: IconType;
  color: string;
};

// Constants
const ICONS: { icon: IconType; component: React.ReactNode; color: string }[] = [
  { icon: 'coins', component: <Coins className="h-full w-full" />, color: '#8B5CF6' }, // Vivid Purple
  { icon: 'diamond', component: <Diamond className="h-full w-full" />, color: '#D946EF' }, // Magenta Pink
  { icon: 'star', component: <Star className="h-full w-full" />, color: '#F97316' }, // Bright Orange
  { icon: 'award', component: <Award className="h-full w-full" />, color: '#0EA5E9' }, // Ocean Blue
  { icon: 'trophy', component: <Trophy className="h-full w-full" />, color: '#1EAEDB' }, // Bright Blue
  { icon: 'dollarSign', component: <CircleDollarSign className="h-full w-full" />, color: '#33C3F0' }, // Sky Blue
];

// Utility functions
const generateRandomIcon = (): ReelItem => {
  const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
  return {
    icon: randomIcon.icon,
    color: randomIcon.color,
  };
};

const generateInitialReels = (): ReelItem[][] => {
  return [
    Array(5).fill(null).map(() => generateRandomIcon()),
    Array(5).fill(null).map(() => generateRandomIcon()),
    Array(5).fill(null).map(() => generateRandomIcon()),
  ];
};

// Payout table
const PAYOUT_TABLE = {
  three_of_a_kind: 5, // x5 multiplier
  three_coins: 7, // x7 multiplier for three coins (highest value)
};

const CoinsGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  const [reels, setReels] = useState<ReelItem[][]>(generateInitialReels());
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [winAmount, setWinAmount] = useState(0);
  const [betCount, setBetCount] = useState(0); // Track number of bets for rigged system
  
  // Load balance from user auth
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user?.balance, user]);
  
  const handleBetChange = (amount: number) => {
    const newBet = Math.max(5, Math.min(1000, bet + amount));
    setBet(newBet);
  };
  
  const handleSpin = useCallback(() => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive",
      });
      return;
    }
    
    if (balance < bet) {
      toast({
        title: "Insufficient Funds",
        description: "Please deposit more to play",
        variant: "destructive",
      });
      return;
    }
    
    // Increment bet count
    const newBetCount = betCount + 1;
    setBetCount(newBetCount);
    
    // Deduct bet from balance
    const newBalance = balance - bet;
    setBalance(newBalance);
    if (user) {
      updateUserBalance(newBalance);
    }
    
    setSpinning(true);
    setWinAmount(0);
    
    // Generate visual spinning effect with temporary reels
    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(reel => {
        // Shift each reel down and add a new random icon at the top
        const newReel = [...reel];
        newReel.pop();
        newReel.unshift(generateRandomIcon());
        return newReel;
      }));
    }, 100); // Fast spinning
    
    // Determine results after some time
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Determine if this spin should win
      const shouldWin = newBetCount <= 2 || shouldBetWin(user.uid);
      
      // Generate final result
      let finalReels: ReelItem[][];
      
      if (shouldWin) {
        // Create a winning combination
        const winningIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
        
        // Generate a winning combination in the center row
        finalReels = [
          Array(5).fill(null).map(() => generateRandomIcon()),
          [
            generateRandomIcon(),
            { icon: winningIcon.icon, color: winningIcon.color },
            { icon: winningIcon.icon, color: winningIcon.color },
            { icon: winningIcon.icon, color: winningIcon.color },
            generateRandomIcon(),
          ],
          Array(5).fill(null).map(() => generateRandomIcon()),
        ];
        
        // Calculate win amount
        let multiplier = PAYOUT_TABLE.three_of_a_kind;
        if (winningIcon.icon === 'coins') {
          multiplier = PAYOUT_TABLE.three_coins; // Higher payout for coins
        }
        
        // Cap win at 100
        let winAmount = Math.min(100, bet * multiplier);
        
        // Update balance with winnings
        const updatedBalance = newBalance + winAmount;
        setBalance(updatedBalance);
        if (user) {
          updateUserBalance(updatedBalance);
        }
        
        setWinAmount(winAmount);
        
        // Show win notification
        setTimeout(() => {
          toast({
            title: "You Won!",
            description: `${winAmount} coins!`,
            className: "bg-green-600 text-white",
          });
        }, 500);
      } else {
        // Generate a losing combination
        finalReels = generateInitialReels();
        
        // Show loss notification
        setTimeout(() => {
          toast({
            title: "Better luck next time!",
            description: `You lost ${bet} coins`,
            variant: "destructive",
          });
        }, 500);
      }
      
      // Set final reels state
      setReels(finalReels);
      
      // End spinning state
      setTimeout(() => {
        setSpinning(false);
      }, 500);
      
    }, 2000); // Total spin time
    
  }, [spinning, user, balance, bet, toast, updateUserBalance, betCount]);
  
  const renderIcon = (item: ReelItem) => {
    const iconData = ICONS.find(i => i.icon === item.icon);
    
    return (
      <div className="h-16 w-16 flex items-center justify-center" style={{ color: item.color }}>
        {iconData?.component}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            onClick={() => navigate('/')}
          >
            <ChevronDown className="h-5 w-5 mr-1" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-center text-yellow-500">777 COINS</h1>
          
          <div className="w-20"></div>
        </div>
        
        {/* Game container */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 mb-4 flex-grow flex flex-col">
          {/* Wins display */}
          <div className="bg-gray-900 rounded-md p-2 mb-4 text-center">
            <span className="text-gray-400 text-sm">WIN</span>
            <AnimatePresence mode="wait">
              {winAmount > 0 ? (
                <motion.div
                  key="win"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-2xl font-bold text-yellow-500"
                >
                  {winAmount}
                </motion.div>
              ) : (
                <motion.div
                  key="no-win"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-gray-600"
                >
                  0
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Reels */}
          <div className="flex-grow flex flex-col justify-center">
            <div className="bg-gray-900 border-4 border-gray-700 rounded-lg p-2 mb-4 relative overflow-hidden">
              {/* Indicator lines */}
              <div className="absolute left-0 right-0 h-0.5 bg-yellow-500 top-1/2 transform -translate-y-8 z-10"></div>
              <div className="absolute left-0 right-0 h-0.5 bg-yellow-500 top-1/2 transform translate-y-8 z-10"></div>
              
              {/* Reels container */}
              <div className="flex justify-center gap-1 p-2">
                {reels.map((reel, reelIndex) => (
                  <div 
                    key={reelIndex} 
                    className="bg-gray-800 rounded-md p-2 w-1/3 flex flex-col items-center"
                    style={{ 
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    {reel.map((item, itemIndex) => (
                      <div 
                        key={`${reelIndex}-${itemIndex}`} 
                        className={`p-1 ${itemIndex === 2 ? 'scale-110' : ''}`}
                      >
                        {renderIcon(item)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center mt-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">BET</div>
              <div className="flex items-center bg-gray-900 rounded-md overflow-hidden">
                <Button
                  size="icon" 
                  variant="ghost"
                  className="h-10 rounded-none border-r border-gray-700"
                  onClick={() => handleBetChange(-5)}
                  disabled={bet <= 5 || spinning}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                
                <div className="w-16 text-center font-bold text-yellow-500">
                  {bet}
                </div>
                
                <Button
                  size="icon" 
                  variant="ghost"
                  className="h-10 rounded-none border-l border-gray-700"
                  onClick={() => handleBetChange(5)}
                  disabled={bet >= 1000 || spinning}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className={`rounded-full h-16 w-16 ${
                    spinning 
                      ? 'bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-500'
                      : 'bg-gradient-to-b from-yellow-500 to-amber-600 border-2 border-yellow-300 hover:from-yellow-400 hover:to-amber-500'
                  }`}
                  disabled={spinning || !user || balance < bet}
                  onClick={handleSpin}
                >
                  <span className="text-white font-bold">SPIN</span>
                </Button>
              </motion.div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400 mb-1">BALANCE</div>
              <div className="bg-gray-900 rounded-md px-3 py-2 min-w-[80px] text-center">
                <span className="font-bold text-yellow-500">{balance}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Paytable */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-2">Paytable</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                <div className="h-6 w-6" style={{ color: '#8B5CF6' }}><Coins /></div>
                <div className="h-6 w-6" style={{ color: '#8B5CF6' }}><Coins /></div>
                <div className="h-6 w-6" style={{ color: '#8B5CF6' }}><Coins /></div>
              </div>
              <span className="text-yellow-500 font-bold">×7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <div className="h-6 w-6" style={{ color: '#33C3F0' }}><CircleDollarSign /></div>
                <div className="h-6 w-6" style={{ color: '#33C3F0' }}><CircleDollarSign /></div>
                <div className="h-6 w-6" style={{ color: '#33C3F0' }}><CircleDollarSign /></div>
              </div>
              <span className="text-yellow-500 font-bold">×5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <div className="h-6 w-6" style={{ color: '#F97316' }}><Star /></div>
                <div className="h-6 w-6" style={{ color: '#F97316' }}><Star /></div>
                <div className="h-6 w-6" style={{ color: '#F97316' }}><Star /></div>
              </div>
              <span className="text-yellow-500 font-bold">×5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <div className="h-6 w-6" style={{ color: '#D946EF' }}><Diamond /></div>
                <div className="h-6 w-6" style={{ color: '#D946EF' }}><Diamond /></div>
                <div className="h-6 w-6" style={{ color: '#D946EF' }}><Diamond /></div>
              </div>
              <span className="text-yellow-500 font-bold">×5</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CoinsGame;
