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
import { handleGameSpin } from '@/utils/gameUpdater';
import { formatCurrency } from '@/utils/currency';

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
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [reels, setReels] = useState<number[][]>([]);
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
  
  const symbolsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
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
    
    setIsSpinning(true);
    setWinAmount(0);
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    // Simulate spinning animation
    setTimeout(async () => {
      try {
        // Use improved game spinner with proper toast notifications
        const result = await handleGameSpin(
          user,
          'fruityBonanza',
          betAmount,
          2,
          updateUserBalance,
          toast
        );
        
        if (result) {
          // Generate new symbols for each position
          generateReels();
          
          if (result.winAmount > 0) {
            setWinAmount(result.winAmount);
            
            // Play win sound
            if (winSound.current) {
              winSound.current.currentTime = 0;
              winSound.current.play().catch(e => console.error("Error playing sound:", e));
            }
          }
        }
      } catch (error) {
        console.error("Error processing bet:", error);
      }
      
      setIsSpinning(false);
    }, 2000);
  };
  
  const changeBetAmount = (amount: number) => {
    const newBetAmount = Math.max(10, Math.min(1000, betAmount + amount));
    setBetAmount(newBetAmount);
  };
  
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
        <IconComponent size="70%" />
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex flex-col">
      <Header />
      
      <main className="flex-1 p-1 md:p-2 max-w-sm mx-auto w-full flex flex-col" ref={symbolsContainerRef}>
        {/* Game Title - Smaller */}
        <div className="relative w-full h-12 mb-1">
          <img
            src="/lovable-uploads/fe393b9b-3777-4f24-ac1f-d680e17dc51e.png"
            alt="Fruity Bonanza"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Jackpots Row - Smaller */}
        <div className="flex justify-between items-center mb-1">
          {jackpots.map((jackpot) => (
            <div 
              key={jackpot.type} 
              className={`${jackpot.color} px-1 py-0.5 rounded text-center min-w-12`}
            >
              <div className="text-white text-xs">{jackpot.type}</div>
              <div className="text-yellow-300 font-bold text-xs">
                {formatCurrency(jackpot.amount)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Game Board - Smaller */}
        <div className="bg-blue-800 border border-yellow-600 rounded-lg overflow-hidden shadow-lg mb-1">
          {/* Main grid - Smaller symbols */}
          <div className="grid grid-cols-5 gap-0.5 p-1">
            {Array(5).fill(0).map((_, row) => (
              Array(3).fill(0).map((_, col) => (
                <div key={`symbol-${row}-${col}`} className="aspect-square w-12 h-12">
                  {reels.length > 0 && renderSymbol(reels[row][col + 1], isSpinning)}
                </div>
              ))
            ))}
          </div>
          
          {/* Win display */}
          <div className="bg-blue-700 p-1 text-center border-t border-blue-500">
            <div className="text-white font-bold text-sm">
              WIN <span className="text-yellow-300">{formatCurrency(winAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Controls - Smaller */}
        <div className="grid grid-cols-3 gap-1 mb-1">
          <div className="bg-blue-900 rounded p-1 text-center">
            <div className="text-white text-xs">BALANCE</div>
            <div className="text-yellow-300 font-bold text-xs">{formatCurrency(user?.balance || 0)}</div>
          </div>
          
          <div className="bg-blue-900 rounded p-1 text-center flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 rounded-full mr-1"
              onClick={() => changeBetAmount(-10)}
              disabled={betAmount <= 10 || isSpinning}
            >
              <Minus className="h-2 w-2" />
            </Button>
            
            <div>
              <div className="text-white text-xs">BET</div>
              <div className="text-yellow-300 font-bold text-xs">{formatCurrency(betAmount)}</div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 rounded-full ml-1"
              onClick={() => changeBetAmount(10)}
              disabled={betAmount >= 1000 || isSpinning}
            >
              <Plus className="h-2 w-2" />
            </Button>
          </div>
          
          <div className="bg-blue-900 rounded p-1 text-center">
            <div className="text-white text-xs">TOTAL BET</div>
            <div className="text-yellow-300 font-bold text-xs">{formatCurrency(betAmount * 15)}</div>
          </div>
        </div>
        
        {/* Spin Button - Smaller */}
        <div className="flex justify-center mb-2">
          <motion.button
            className={`bg-gradient-to-r ${isSpinning ? 'from-blue-700 to-blue-800' : 'from-green-500 to-green-700'} 
              h-12 w-12 rounded-full flex items-center justify-center border-2 border-blue-300 shadow-lg`}
            whileHover={!isSpinning ? { scale: 1.1 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleSpin}
            disabled={isSpinning}
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </motion.div>
          </motion.button>
        </div>
      </main>
      
      {/* Don't show bonus page on mobile */}
      {!isMobile && (
        <div className="text-center p-4 text-white">
          Bonus features available on desktop
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default FruityBonanzaGame;
