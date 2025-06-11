
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, VolumeX, RefreshCw, Info, Plus, Minus,
  Banknote, CircleDollarSign, Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { handleGameSpin } from '@/utils/gameUpdater';
import { formatCurrency } from '@/utils/currency';
import { getGameLimits, validateGameBet } from '@/utils/gameConnections';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const moneySymbols = [
  { 
    value: '100', 
    icon: (props) => (
      <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 p-1 w-full h-full flex items-center justify-center">
        <Banknote size={24} className="text-white" />
        <span className="ml-1 font-bold text-white text-sm">100</span>
      </div>
    )
  },
  { 
    value: '500', 
    icon: (props) => (
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-1 w-full h-full flex items-center justify-center">
        <CircleDollarSign size={24} className="text-white" />
        <span className="ml-1 font-bold text-white text-sm">500</span>
      </div>
    )
  },
  { 
    value: '1000', 
    icon: (props) => (
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 p-1 w-full h-full flex items-center justify-center">
        <Coins size={24} className="text-yellow-300" />
        <span className="ml-1 font-bold text-white text-sm">1K</span>
      </div>
    )
  },
];

const MoneyGram = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [symbols, setSymbols] = useState<number[][]>(Array(3).fill(Array(3).fill(0)));
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [lastResults, setLastResults] = useState<number[]>([]);
  const [gameLimits, setGameLimits] = useState({ minBet: 10, maxBet: 1000, isEnabled: true });
  
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to play this game",
        variant: "destructive"
      });
    }
    
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Load game limits from Supabase
    const loadGameLimits = async () => {
      try {
        const limits = await getGameLimits('moneyGram');
        setGameLimits(limits);
        setBet(limits.minBet);
        console.log('Loaded Money Gram limits:', limits);
      } catch (error) {
        console.error('Error loading game limits:', error);
      }
    };
    
    loadGameLimits();
    
    setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    const initialSymbols = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
    );
    setSymbols(initialSymbols);
  }, [isAuthenticated, toast]);
  
  const changeBet = (amount: number) => {
    if (!spinning) {
      const newBet = Math.max(gameLimits.minBet, Math.min(gameLimits.maxBet, bet + amount));
      setBet(newBet);
    }
  };
  
  const calculateWin = (finalSymbols: number[][]) => {
    // Check middle row
    if (finalSymbols[1][0] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[1][2]) {
      const symbolValue = parseInt(moneySymbols[finalSymbols[1][1]].value);
      return bet * (symbolValue / 100);
    }
    
    // Check middle column
    if (finalSymbols[0][1] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[2][1]) {
      const symbolValue = parseInt(moneySymbols[finalSymbols[1][1]].value);
      return bet * (symbolValue / 100);
    }
    
    return 0;
  };
  
  const handleSpin = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to play this game",
        variant: "destructive"
      });
      return;
    }
    
    // Validate bet before processing
    const validation = await validateGameBet('moneyGram', bet, user?.balance || 0);
    if (!validation.valid) {
      toast({
        title: "Invalid Bet",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    if (spinning) return;
    
    setSpinning(true);
    setWinAmount(0);
    
    if (!muted && spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(err => console.error("Error playing sound:", err));
    }
    
    const animationDuration = 2000;
    let spinInterval: NodeJS.Timeout;
    
    spinInterval = setInterval(() => {
      const randomSymbols = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
      );
      setSymbols(randomSymbols);
    }, 100);
    
    setTimeout(async () => {
      clearInterval(spinInterval);
      
      try {
        // Generate final symbols
        const finalSymbols = Array(3).fill(null).map(() => 
          Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
        );
        
        // Calculate potential win
        const calculatedWin = calculateWin(finalSymbols);
        const shouldWin = calculatedWin > 0;
        
        // Force a win or loss based on calculation
        if (shouldWin) {
          // Ensure we have a winning combination
          const winSymbol = Math.floor(Math.random() * moneySymbols.length);
          const isRow = Math.random() > 0.5;
          
          if (isRow) {
            finalSymbols[1][0] = winSymbol;
            finalSymbols[1][1] = winSymbol;
            finalSymbols[1][2] = winSymbol;
          } else {
            finalSymbols[0][1] = winSymbol;
            finalSymbols[1][1] = winSymbol;
            finalSymbols[2][1] = winSymbol;
          }
        } else {
          // Ensure no winning combinations
          while (
            (finalSymbols[1][0] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[1][2]) ||
            (finalSymbols[0][1] === finalSymbols[1][1] && finalSymbols[1][1] === finalSymbols[2][1])
          ) {
            finalSymbols[2][1] = (finalSymbols[2][1] + 1) % moneySymbols.length;
          }
        }
        
        setSymbols(finalSymbols);
        
        // Use the game spinner with calculated multiplier
        const multiplier = shouldWin ? calculatedWin / bet : 0;
        
        const result = await handleGameSpin(
          user,
          'moneyGram',
          bet,
          multiplier,
          updateUserBalance,
          toast
        );
        
        if (result && result.winAmount > 0) {
          setWinAmount(result.winAmount);
          
          if (!muted && winSound.current) {
            winSound.current.currentTime = 0;
            winSound.current.play().catch(err => console.error("Error playing sound:", err));
          }
          
          setLastResults(prev => [result.winAmount, ...prev].slice(0, 5));
        } else {
          setLastResults(prev => [0, ...prev].slice(0, 5));
        }
      } catch (error) {
        console.error("Error processing bet:", error);
        toast({
          title: "Bet Processing Error",
          description: "Failed to process bet. Please try again.",
          variant: "destructive"
        });
      }
      
      setSpinning(false);
    }, animationDuration);
  };
  
  const checkWinningCombination = () => {
    if (
      symbols[1][0] === symbols[1][1] && 
      symbols[1][1] === symbols[1][2]
    ) {
      return { 
        isWin: true, 
        positions: [[1, 0], [1, 1], [1, 2]], 
        symbolIndex: symbols[1][1]
      };
    }
    
    if (
      symbols[0][1] === symbols[1][1] && 
      symbols[1][1] === symbols[2][1]
    ) {
      return { 
        isWin: true, 
        positions: [[0, 1], [1, 1], [2, 1]], 
        symbolIndex: symbols[1][1]
      };
    }
    
    return { isWin: false, positions: [], symbolIndex: -1 };
  };
  
  const winResult = checkWinningCombination();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-emerald-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold text-green-400 mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Money Gram
            </motion.h1>
            <motion.div 
              className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-green-400 mt-6">Loading game...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-emerald-950 flex flex-col">
      <Header />
      
      <div className="p-2 flex justify-between items-center">
        <button 
          className="text-white bg-green-800 p-2 rounded-full"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Money Gram</h1>
        <div className="flex gap-2">
          <button 
            className="text-white bg-green-800 p-2 rounded-full"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button 
            className="text-white bg-green-800 p-2 rounded-full"
            onClick={() => setShowRules(true)}
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-2">
        <div className="w-full max-w-xs aspect-square bg-emerald-800 rounded-xl border-4 border-green-700 shadow-2xl p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-900/20" />
          
          <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full w-full relative z-10">
            {symbols.map((row, rowIndex) => (
              row.map((symbolIndex, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className={`bg-gradient-to-b from-emerald-700 to-emerald-800 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden
                    ${
                      winResult.isWin && winResult.positions.some(([r, c]) => r === rowIndex && c === colIndex)
                        ? 'ring-2 ring-yellow-400'
                        : ''
                    }
                    ${
                      rowIndex === 1 && colIndex === 1 
                        ? 'border border-dashed border-white/30' 
                        : ''
                    }
                  `}
                >
                  <motion.div
                    className="w-full h-full flex items-center justify-center p-1"
                    animate={
                      spinning 
                        ? { 
                            y: [0, -5, 5, 0],
                            scale: [1, 0.95, 1.05, 1],
                            rotateY: [0, 180, 360],
                          }
                        : { scale: [1, 1.02, 1] }
                    }
                    transition={
                      spinning 
                        ? { duration: 0.3, repeat: Infinity, repeatType: "loop" }
                        : { duration: 2, repeat: Infinity, repeatType: "reverse" }
                    }
                  >
                    {moneySymbols[symbolIndex].icon({})}
                  </motion.div>
                  
                  {winResult.isWin && 
                   winResult.positions.some(([r, c]) => r === rowIndex && c === colIndex) && 
                   !spinning && (
                    <motion.div 
                      className="absolute inset-0 bg-yellow-400/30 pointer-events-none"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              ))
            ))}
          </div>
          
          <AnimatePresence>
            {winAmount > 0 && !spinning && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-green-800 px-4 py-3 rounded-xl border-4 border-green-600 shadow-xl"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <div className="text-center">
                    <motion.h2 
                      className="text-yellow-400 text-xl font-bold mb-1"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: ["0 0 5px rgba(255,255,0,0.2)", "0 0 20px rgba(255,255,0,0.6)", "0 0 5px rgba(255,255,0,0.2)"]
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      WIN!
                    </motion.h2>
                    <motion.p 
                      className="text-white text-2xl font-bold"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {formatCurrency(winAmount)}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-2 flex justify-center overflow-x-auto w-full">
          <div className="bg-emerald-800/50 px-3 py-1 rounded-lg">
            <p className="text-xs text-emerald-300 mb-1">Last Results:</p>
            <div className="flex space-x-1">
              {lastResults.length > 0 ? 
                lastResults.map((result, index) => (
                  <span 
                    key={index}
                    className={`text-xs px-1 py-0.5 rounded ${result > 0 ? 'bg-green-700 text-white' : 'bg-red-800/50 text-red-200'}`}
                  >
                    {result > 0 ? `+${result.toFixed(0)}` : '0'}
                  </span>
                )) : 
                <span className="text-xs text-emerald-400">No history yet</span>
              }
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-md mt-3 bg-emerald-900/70 rounded-xl p-2 border border-emerald-700">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div>
              <p className="text-xs text-emerald-300">Balance</p>
              <p className="text-white font-bold text-sm">{formatCurrency(user?.balance || 0)}</p>
            </div>
            
            <div className="flex items-center bg-emerald-800 rounded-lg overflow-hidden">
              <button 
                className="px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={() => changeBet(-gameLimits.minBet)}
                disabled={spinning || bet <= gameLimits.minBet}
              >
                <Minus className="h-3 w-3" />
              </button>
              <div className="px-3 py-1 bg-emerald-950">
                <p className="text-xs text-emerald-400">Bet</p>
                <p className="text-emerald-200 font-bold text-center text-sm">{formatCurrency(bet)}</p>
              </div>
              <button 
                className="px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={() => changeBet(gameLimits.minBet)}
                disabled={spinning || bet >= gameLimits.maxBet}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            
            <div>
              <p className="text-xs text-emerald-300">Win</p>
              <p className="text-green-400 font-bold text-sm">{formatCurrency(winAmount)}</p>
            </div>
          </div>
          
          <div className="text-center text-emerald-300 text-xs mb-2">
            Min: {formatCurrency(gameLimits.minBet)} | Max: {formatCurrency(gameLimits.maxBet)}
          </div>
          
          <Button
            onClick={handleSpin}
            disabled={spinning || !isAuthenticated || !gameLimits.isEnabled || (user && user.balance < bet)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 h-auto"
          >
            {spinning ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Spinning...</span>
              </div>
            ) : (
              <span>SPIN</span>
            )}
          </Button>
        </div>
      </main>
      
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-emerald-900 border-green-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-emerald-400">Money Gram Rules</DialogTitle>
            <DialogDescription className="text-emerald-200">
              How to play and win at Money Gram
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-emerald-300 mb-1">How to Win</h3>
              <p className="text-white/90 text-sm">
                Match 3 of the same money symbols in the center row or center column to win!
                The center position is highlighted with a dashed border.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-300 mb-1">Winning Amounts</h3>
              <div className="space-y-1">
                {moneySymbols.map((symbol, index) => (
                  <div key={index} className="flex items-center bg-emerald-800/50 p-1 rounded">
                    <div className="w-8 h-8">
                      {symbol.icon({})}
                    </div>
                    <div className="ml-2">
                      <p className="font-bold text-sm">{symbol.value} PKR Note</p>
                      <p className="text-xs text-emerald-300">Win {(bet * parseInt(symbol.value) / 100).toFixed(0)} PKR on your {bet} PKR bet</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-300 mb-1">Getting Started</h3>
              <p className="text-white/90 text-sm">
                1. Set your bet amount using + and - buttons<br/>
                2. Click SPIN to start the game<br/>
                3. Match the center row or center column to win
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default MoneyGram;
