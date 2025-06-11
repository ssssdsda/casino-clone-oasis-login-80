import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Minus, Scroll, Crown, Cross } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { handleGameSpin } from '@/utils/gameUpdater';
import { formatCurrency } from '@/utils/currency';
import { getGameLimits, validateGameBet } from '@/utils/gameConnections';

// Book of Dead symbols
const symbols = [
  { id: 'book', symbol: 'book', icon: () => (
    <div className="text-yellow-500">
      <Scroll size="100%" />
    </div>
  ), multiplier: 10 },
  { id: 'pharaoh', symbol: 'pharaoh', icon: () => (
    <div className="text-blue-500">
      <Crown size="100%" />
    </div>
  ), multiplier: 8 },
  { id: 'ankh', symbol: 'ankh', icon: () => (
    <div className="text-green-500">
      <Cross size="100%" />
    </div>
  ), multiplier: 6 },
  { id: 'ace', symbol: 'A', icon: () => (
    <div className="bg-red-600 w-full h-full rounded flex items-center justify-center">
      <span className="text-white font-bold text-lg">A</span>
    </div>
  ), multiplier: 4 },
  { id: 'king', symbol: 'K', icon: () => (
    <div className="bg-purple-600 w-full h-full rounded flex items-center justify-center">
      <span className="text-white font-bold text-lg">K</span>
    </div>
  ), multiplier: 3 },
  { id: 'queen', symbol: 'Q', icon: () => (
    <div className="bg-pink-600 w-full h-full rounded flex items-center justify-center">
      <span className="text-white font-bold text-lg">Q</span>
    </div>
  ), multiplier: 2 }
];

const BookOfDeadGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [reels, setReels] = useState<number[]>([0, 0, 0]);
  const [gameLimits, setGameLimits] = useState({ minBet: 10, maxBet: 1000, isEnabled: true });
  
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Load game limits from Supabase
    const loadGameLimits = async () => {
      try {
        const limits = await getGameLimits('bookOfDead');
        setGameLimits(limits);
        console.log('Loaded Book of Dead limits:', limits);
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
    const newReels: number[] = Array(3).fill(0).map(() => 
      Math.floor(Math.random() * symbols.length)
    );
    setReels(newReels);
  };
  
  const calculateWin = (reelResults: number[]) => {
    const symbolCounts = reelResults.reduce((acc, symbolIndex) => {
      acc[symbolIndex] = (acc[symbolIndex] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const maxCount = Math.max(...Object.values(symbolCounts));
    
    if (maxCount === 3) {
      // 3 matching symbols = full win
      const winningSymbolIndex = Object.keys(symbolCounts).find(
        key => symbolCounts[parseInt(key)] === 3
      );
      if (winningSymbolIndex) {
        const symbol = symbols[parseInt(winningSymbolIndex)];
        return betAmount * symbol.multiplier;
      }
    } else if (maxCount === 2) {
      // 2 matching symbols = 50% win
      const winningSymbolIndex = Object.keys(symbolCounts).find(
        key => symbolCounts[parseInt(key)] === 2
      );
      if (winningSymbolIndex) {
        const symbol = symbols[parseInt(winningSymbolIndex)];
        return Math.floor(betAmount * symbol.multiplier * 0.5);
      }
    }
    
    return 0; // No matching symbols = lose
  };
  
  const handleSpin = async () => {
    if (isSpinning || !user) return;
    
    // Validate bet before processing
    const validation = await validateGameBet('bookOfDead', betAmount, user.balance);
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
        const newReels = Array(3).fill(0).map(() => 
          Math.floor(Math.random() * symbols.length)
        );
        setReels(newReels);
        
        // Calculate potential win
        const calculatedWin = calculateWin(newReels);
        const shouldWin = calculatedWin > 0;
        
        // Use the game spinner with calculated multiplier
        const multiplier = shouldWin ? calculatedWin / betAmount : 0;
        
        const result = await handleGameSpin(
          user,
          'bookOfDead',
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
      }
      
      setIsSpinning(false);
    }, 2000);
  };
  
  const changeBetAmount = (amount: number) => {
    const newBetAmount = Math.max(gameLimits.minBet, Math.min(gameLimits.maxBet, betAmount + amount));
    setBetAmount(newBetAmount);
  };
  
  const renderSymbol = (symbolIndex: number, isSpinning: boolean) => {
    const symbol = symbols[symbolIndex];
    const IconComponent = symbol.icon;
    
    return (
      <motion.div
        className="w-full h-full flex items-center justify-center p-2"
        animate={isSpinning ? {
          rotateY: [0, 180, 360],
          scale: [1, 0.8, 1]
        } : {
          scale: [1, 1.05, 1]
        }}
        transition={isSpinning ? {
          duration: 0.5,
          repeat: Infinity
        } : {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <IconComponent />
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 to-black flex flex-col">
      <Header />
      
      <main className="flex-1 p-2 max-w-sm mx-auto w-full flex flex-col">
        {/* Game Title */}
        <div className="relative w-full h-16 mb-2">
          <img
            src="/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png"
            alt="Book of Dead"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Top spinning icon */}
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-16 h-16 bg-yellow-700 border-2 border-yellow-500 rounded-lg flex items-center justify-center"
            animate={isSpinning ? {
              rotate: [0, 360]
            } : {}}
            transition={isSpinning ? {
              duration: 0.5,
              repeat: Infinity,
              ease: "linear"
            } : {}}
          >
            <Scroll className="text-yellow-300" size={32} />
          </motion.div>
        </div>
        
        {/* Game Board */}
        <div className="bg-yellow-800 border-2 border-yellow-600 rounded-lg overflow-hidden shadow-lg mb-4">
          {/* Reel display */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-black">
            {reels.map((symbolIndex, index) => (
              <div key={`reel-${index}`} className="aspect-square bg-yellow-700 border border-yellow-500 rounded">
                {renderSymbol(symbolIndex, isSpinning)}
              </div>
            ))}
          </div>
          
          {/* Win display */}
          <div className="bg-yellow-700 p-2 text-center border-t border-yellow-500">
            <div className="text-black font-bold text-sm">
              WIN <span className="text-green-600">{formatCurrency(winAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Balance and Bet Info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-yellow-900 rounded p-2 text-center">
            <div className="text-yellow-300 text-xs">BALANCE</div>
            <div className="text-white font-bold text-sm">{formatCurrency(user?.balance || 0)}</div>
          </div>
          
          <div className="bg-yellow-900 rounded p-2 text-center">
            <div className="text-yellow-300 text-xs">BET</div>
            <div className="text-white font-bold text-sm">{formatCurrency(betAmount)}</div>
          </div>
        </div>
        
        {/* Bet Controls */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeBetAmount(-10)}
            disabled={betAmount <= gameLimits.minBet || isSpinning}
            className="bg-yellow-700 hover:bg-yellow-600 text-white border-yellow-500"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="bg-yellow-900 px-4 py-2 rounded text-center min-w-24">
            <div className="text-yellow-300 text-xs">BET AMOUNT</div>
            <div className="text-white font-bold">{formatCurrency(betAmount)}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeBetAmount(10)}
            disabled={betAmount >= gameLimits.maxBet || isSpinning}
            className="bg-yellow-700 hover:bg-yellow-600 text-white border-yellow-500"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Game Limits */}
        <div className="text-center text-yellow-300 text-xs mb-4">
          Min: {formatCurrency(gameLimits.minBet)} | Max: {formatCurrency(gameLimits.maxBet)}
        </div>
        
        {/* Spin Button */}
        <div className="flex justify-center">
          <motion.button
            className={`bg-gradient-to-r ${isSpinning ? 'from-yellow-700 to-yellow-800' : 'from-green-500 to-green-700'} 
              h-16 w-16 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg`}
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
        <div className="mt-4 bg-yellow-900 rounded p-3">
          <div className="text-yellow-300 text-xs font-bold mb-2">GAME RULES:</div>
          <div className="text-white text-xs space-y-1">
            <div>• 3 matching symbols = Full Win</div>
            <div>• 2 matching symbols = 50% Win</div>
            <div>• No match = Lose</div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookOfDeadGame;
