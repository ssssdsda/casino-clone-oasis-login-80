import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Minus, Bell, Settings, Apple, Banana, Cherry, DollarSign, Grape } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { shouldGameBetWin } from '@/lib/firebase';

// Fruit symbols for the game with proper icons
const symbols = [
  { id: 'cherry', symbol: 'cherry', icon: Cherry, color: 'text-red-500', multiplier: 5 },
  { id: 'apple', symbol: 'apple', icon: Apple, color: 'text-green-500', multiplier: 3 },
  { id: 'banana', symbol: 'banana', icon: Banana, color: 'text-yellow-400', multiplier: 4 },
  { id: 'grape', symbol: 'grape', icon: Grape, color: 'text-purple-500', multiplier: 4 },
  { id: 'bell', symbol: 'bell', icon: Bell, color: 'text-yellow-500', multiplier: 5 },
  { id: 'dollar', symbol: 'dollar', icon: DollarSign, color: 'text-green-400', multiplier: 10 },
  { id: 'seven', symbol: '7', icon: () => (
    <div className="bg-red-600 w-full h-full rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-lg">7</span>
    </div>
  ), multiplier: 15 },
  { id: 'star', symbol: 'star', icon: () => (
    <div className="text-yellow-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
    </div>
  ), multiplier: 7 }
];

type JackpotType = 'GRAND' | 'MAJOR' | 'MINI';

interface Jackpot {
  type: JackpotType;
  amount: number;
  color: string;
}

const FruityBonanzaGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState<number>(2);
  const [balance, setBalance] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [reels, setReels] = useState<number[][]>([]);
  const [betCount, setBetCount] = useState<number>(0); // Track number of bets
  const [jackpots, setJackpots] = useState<Jackpot[]>([
    { type: 'GRAND', amount: 2000.00, color: 'bg-red-600' },
    { type: 'MAJOR', amount: 50.00, color: 'bg-pink-500' },
    { type: 'MINI', amount: 10.00, color: 'bg-green-500' },
  ]);
  
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  // Maintain visible symbols for the reels to prevent scrolling issues
  const symbolsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Initialize with user balance if available
    if (user) {
      setBalance(user.balance);
    }
    
    // Generate initial reels
    generateReels();
    
    return () => {
      if (spinSound.current) {
        spinSound.current.pause();
        spinSound.current = null;
      }
      if (winSound.current) {
        winSound.current.pause();
        winSound.current = null;
      }
    };
  }, [user]);
  
  const generateReels = () => {
    // Create a 5x3 grid of symbols (5 reels with 3 visible symbols each)
    const newReels: number[][] = Array(5).fill(0).map(() => 
      Array(5).fill(0).map(() => {
        const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
        return randomSymbolIndex;
      })
    );
    setReels(newReels);
  };
  
  const handleSpin = async () => {
    if (isSpinning) return;
    
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
    
    // Increment bet count
    setBetCount(prev => prev + 1);
    
    // Deduct bet amount
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    
    if (user) {
      updateUserBalance(newBalance);
    }
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    setIsSpinning(true);
    setWinAmount(0);
    
    // Simulate spinning animation
    setTimeout(async () => {
      // Generate new symbols for each position
      generateReels();
      
      // Calculate win based on improved Firebase betting system
      try {
        // Use the Firebase function with proper parameters (userId, gameType, betAmount)
        const shouldWin = await shouldGameBetWin(user?.id || 'anonymous', 'fruityBonanza', betAmount);
        console.log(`FruityBonanza bet: ${shouldWin ? 'Win' : 'Lose'}, Bet amount: ${betAmount}`);
      
        if (shouldWin) {
          // Random win amount between 1x and 10x bet
          const multiplier = Math.random() * 9 + 1;
          const win = Math.round(betAmount * multiplier * 100) / 100;
          
          // Update balance
          const winningBalance = newBalance + win;
          setBalance(winningBalance);
          if (user) {
            updateUserBalance(winningBalance);
          }
          
          // Update win amount
          setWinAmount(win);
          
          // Play win sound
          if (winSound.current) {
            winSound.current.currentTime = 0;
            winSound.current.play().catch(e => console.error("Error playing sound:", e));
          }
          
          // Show win toast
          toast({
            title: "You Won!",
            description: `${win.toFixed(2)} coins`,
            variant: "default",
            className: "bg-green-500 text-white font-bold"
          });
        } else {
          setWinAmount(0);
        }
      } catch (error) {
        console.error("Error calculating win:", error);
      }
      
      setIsSpinning(false);
    }, 2000);
  };
  
  const changeBetAmount = (amount: number) => {
    const newBetAmount = Math.max(1, Math.min(10, betAmount + amount));
    setBetAmount(newBetAmount);
  };
  
  // Improved symbol rendering to prevent scrolling issues
  const renderSymbol = (symbolIndex: number, isSpinning: boolean) => {
    const symbol = symbols[symbolIndex];
    const IconComponent = symbol.icon;
    
    return (
      <motion.div
        className={`w-full h-full flex items-center justify-center ${symbol.color}`}
        animate={isSpinning ? {
          y: [0, 10, 0],
          opacity: [1, 0.5, 1]
        } : {
          scale: [1, 1.05, 1],
          rotate: [0, 3, 0],
        }}
        transition={isSpinning ? {
          duration: 0.3,
          repeat: Infinity
        } : {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <IconComponent size="80%" />
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex flex-col">
      <Header />
      
      <main className="flex-1 p-1 md:p-4 max-w-md mx-auto w-full flex flex-col" ref={symbolsContainerRef}>
        {/* Game Title with Image */}
        <div className="relative w-full h-16 mb-2">
          <img
            src="/lovable-uploads/fe393b9b-3777-4f24-ac1f-d680e17dc51e.png"
            alt="Fruity Bonanza"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Simplified Jackpots Row */}
        <div className="flex justify-between items-center mb-2">
          {jackpots.map((jackpot) => (
            <div 
              key={jackpot.type} 
              className={`${jackpot.color} px-2 py-1 rounded-md text-center min-w-16`}
            >
              <div className="text-white text-xs">{jackpot.type}</div>
              <div className="text-yellow-300 font-bold text-xs md:text-sm">
                {jackpot.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Game Board */}
        <div className="bg-blue-800 border-2 border-yellow-600 rounded-lg overflow-hidden shadow-lg mb-2">
          {/* Main grid */}
          <div className="grid grid-cols-5 gap-1 p-1">
            {Array(5).fill(0).map((_, row) => (
              Array(3).fill(0).map((_, col) => (
                <div key={`symbol-${row}-${col}`} className="aspect-square">
                  {reels.length > 0 && renderSymbol(reels[row][col + 1], isSpinning)}
                </div>
              ))
            ))}
          </div>
          
          {/* Win display */}
          <div className="bg-blue-700 p-1 text-center border-t-2 border-blue-500">
            <div className="text-white font-bold text-lg">
              WIN <span className="text-yellow-300">₹{winAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-blue-900 rounded-md p-2 text-center">
            <div className="text-white text-xs">BALANCE</div>
            <div className="text-yellow-300 font-bold">₹{balance.toFixed(2)}</div>
          </div>
          
          <div className="bg-blue-900 rounded-md p-2 text-center flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full mr-1"
              onClick={() => changeBetAmount(-1)}
              disabled={betAmount <= 1 || isSpinning}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div>
              <div className="text-white text-xs">BET</div>
              <div className="text-yellow-300 font-bold">₹{betAmount.toFixed(2)}</div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full ml-1"
              onClick={() => changeBetAmount(1)}
              disabled={betAmount >= 10 || isSpinning}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="bg-blue-900 rounded-md p-2 text-center">
            <div className="text-white text-xs">TOTAL BET</div>
            <div className="text-yellow-300 font-bold">₹{(betAmount * 15).toFixed(2)}</div>
          </div>
        </div>
        
        {/* Spin Button */}
        <div className="flex justify-center mb-4">
          <motion.button
            className={`bg-gradient-to-r ${isSpinning ? 'from-blue-700 to-blue-800' : 'from-green-500 to-green-700'} 
              h-14 w-14 rounded-full flex items-center justify-center border-4 border-blue-300 shadow-lg`}
            whileHover={!isSpinning ? { scale: 1.1 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleSpin}
            disabled={isSpinning}
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="h-6 w-6 text-white" />
            </motion.div>
          </motion.button>
        </div>
      </main>
      
      <GameFooter />
    </div>
  );
};

// Simpler mobile-friendly footer component with contact information
const GameFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 p-2 text-white text-sm">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold text-yellow-400">CK444 Casino</h3>
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@ck444.com</span>
            </div>
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+91 9876543210</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            <p>&copy; 2025 CK444 Casino. All rights reserved.</p>
            <p>18+ Gamble Responsibly</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FruityBonanzaGame;
