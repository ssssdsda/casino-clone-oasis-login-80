
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
import { getGameLimits, validateGameBet } from '@/utils/gameConnections';

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
  const [gameLimits, setGameLimits] = useState({ minBet: 10, maxBet: 1000, isEnabled: true });
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
    
    // Load game limits from Supabase
    const loadGameLimits = async () => {
      try {
        const limits = await getGameLimits('fruityBonanza');
        setGameLimits(limits);
        console.log('Loaded Fruity Bonanza limits:', limits);
      } catch (error) {
        console.error('Error loading game limits:', error);
      }
    };
    
    loadGameLimits();
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
  }, []);
  
  const generateReels = () => {
    const newReels: number[][] = Array(5).fill(0).map(() => 
      Array(5).fill(0).map(() => {
        const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
        return randomSymbolIndex;
      })
    );
    setReels(newReels);
  };
  
  const calculateWin = (reelResults: number[][]) => {
    // Check for matching symbols in any line
    let totalWin = 0;
    
    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
      const rowSymbols = reelResults.map(reel => reel[row + 1]);
      const symbolCounts = rowSymbols.reduce((acc, symbolIndex) => {
        acc[symbolIndex] = (acc[symbolIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const maxCount = Math.max(...Object.values(symbolCounts));
      if (maxCount >= 3) {
        const winningSymbolIndex = Object.keys(symbolCounts).find(
          key => symbolCounts[parseInt(key)] === maxCount
        );
        if (winningSymbolIndex) {
          const symbol = symbols[parseInt(winningSymbolIndex)];
          totalWin += betAmount * symbol.multiplier * (maxCount / 3);
        }
      }
    }
    
    return Math.floor(totalWin);
  };
  
  const handleSpin = async () => {
    if (isSpinning || !user) return;
    
    // Validate bet before processing
    const validation = await validateGameBet('fruityBonanza', betAmount, user.balance);
    if (!validation.valid) {
      toast({
        title: "Invalid Bet",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    setIsSpinning(true);
    setWinAmount(0);
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    // Simulate spinning animation for 2 seconds
    setTimeout(async () => {
      try {
        // Generate new reel results
        const newReels = Array(5).fill(0).map(() => 
          Array(5).fill(0).map(() => Math.floor(Math.random() * symbols.length))
        );
        setReels(newReels);
        
        // Calculate potential win
        const calculatedWin = calculateWin(newReels);
        const shouldWin = calculatedWin > 0;
        
        // Use the game spinner with calculated multiplier
        const multiplier = shouldWin ? calculatedWin / betAmount : 0;
        
        const result = await handleGameSpin(
          user,
          'fruityBonanza',
          betAmount,
          multiplier,
          updateUserBalance,
          toast
        );
        
        if (result && result.winAmount > 0) {
          setWinAmount(result.winAmount);
          
          // Play win sound
          if (winSound.current) {
            winSound.current.currentTime = 0;
            winSound.current.play().catch(e => console.error("Error playing sound:", e));
          }
        }
      } catch (error) {
        console.error("Error processing bet:", error);
        toast({
          title: "Bet Processing Error",
          description: "Failed to process bet. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsSpinning(false);
    }, 2000);
  };
  
  const changeBetAmount = (amount: number) => {
    const newBetAmount = Math.max(gameLimits.minBet, Math.min(gameLimits.maxBet, betAmount + amount));
    setBetAmount(newBetAmount);
  };
  
  const renderSymbol = (symbolIndex: number, isSpinning: boolean, delay: number = 0) => {
    const symbol = symbols[symbolIndex];
    const IconComponent = symbol.icon;
    
    return (
      <motion.div
        className={`w-full h-full flex items-center justify-center ${symbol.color}`}
        animate={isSpinning ? {
          rotateY: [0, 360],
          scale: [1, 0.8, 1],
          y: [0, -20, 0]
        } : {
          scale: [1, 1.02, 1],
        }}
        transition={isSpinning ? {
          duration: 0.6,
          repeat: Infinity,
          delay: delay * 0.1,
          ease: "easeInOut"
        } : {
          duration: 2,
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
        {/* Jackpots Row */}
        <div className="flex justify-between items-center mb-2">
          {jackpots.map((jackpot) => (
            <div 
              key={jackpot.type} 
              className={`${jackpot.color} px-2 py-1 rounded text-center min-w-16`}
            >
              <div className="text-white text-xs">{jackpot.type}</div>
              <div className="text-yellow-300 font-bold text-xs">
                {formatCurrency(jackpot.amount)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Game Board */}
        <div className="bg-blue-800 border border-yellow-600 rounded-lg overflow-hidden shadow-lg mb-2">
          {/* Main grid with individual spinning animations */}
          <div className="grid grid-cols-5 gap-1 p-2">
            {Array(5).fill(0).map((_, col) => (
              Array(3).fill(0).map((_, row) => (
                <div key={`symbol-${col}-${row}`} className="aspect-square w-14 h-14 bg-blue-700 rounded border border-blue-500">
                  {reels.length > 0 && renderSymbol(
                    reels[col] && reels[col][row + 1] !== undefined ? reels[col][row + 1] : 0, 
                    isSpinning, 
                    col * 3 + row
                  )}
                </div>
              ))
            ))}
          </div>
          
          {/* Win display */}
          <div className="bg-blue-700 p-2 text-center border-t border-blue-500">
            <div className="text-white font-bold text-sm">
              WIN <span className="text-yellow-300">{formatCurrency(winAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Balance and Bet Info */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-blue-900 rounded p-2 text-center">
            <div className="text-blue-300 text-xs">BALANCE</div>
            <div className="text-white font-bold text-sm">{formatCurrency(user?.balance || 0)}</div>
          </div>
          
          <div className="bg-blue-900 rounded p-2 text-center">
            <div className="text-blue-300 text-xs">BET</div>
            <div className="text-white font-bold text-sm">{formatCurrency(betAmount)}</div>
          </div>
        </div>
        
        {/* Bet Controls */}
        <div className="flex items-center justify-center mb-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeBetAmount(-10)}
            disabled={betAmount <= gameLimits.minBet || isSpinning}
            className="bg-blue-700 hover:bg-blue-600 text-white border-blue-500"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="bg-blue-900 px-4 py-2 rounded text-center min-w-24">
            <div className="text-blue-300 text-xs">BET AMOUNT</div>
            <div className="text-white font-bold">{formatCurrency(betAmount)}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeBetAmount(10)}
            disabled={betAmount >= gameLimits.maxBet || isSpinning}
            className="bg-blue-700 hover:bg-blue-600 text-white border-blue-500"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Game Limits */}
        <div className="text-center text-blue-300 text-xs mb-4">
          Min: {formatCurrency(gameLimits.minBet)} | Max: {formatCurrency(gameLimits.maxBet)}
        </div>
        
        {/* Spin Button */}
        <div className="flex justify-center">
          <motion.button
            className={`bg-gradient-to-r ${isSpinning ? 'from-blue-700 to-blue-800' : 'from-green-500 to-green-700'} 
              h-16 w-16 rounded-full flex items-center justify-center border-2 border-blue-300 shadow-lg`}
            whileHover={!isSpinning ? { scale: 1.1 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleSpin}
            disabled={isSpinning || !gameLimits.isEnabled || (user && user.balance < betAmount)}
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="h-6 w-6 text-white" />
            </motion.div>
          </motion.button>
        </div>
        
        {/* Game Rules */}
        <div className="mt-4 bg-blue-900 rounded p-3">
          <div className="text-blue-300 text-xs font-bold mb-2">GAME RULES:</div>
          <div className="text-white text-xs space-y-1">
            <div>• 3+ matching symbols in a line = Win</div>
            <div>• Higher value symbols = Bigger wins</div>
            <div>• Multiple lines can win simultaneously</div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FruityBonanzaGame;
