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
import { shouldBetWin } from '@/utils/bettingSystem';
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
        <Banknote size={32} className="text-white" />
        <span className="ml-1 font-bold text-white">100</span>
      </div>
    )
  },
  { 
    value: '500', 
    icon: (props) => (
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-1 w-full h-full flex items-center justify-center">
        <CircleDollarSign size={32} className="text-white" />
        <span className="ml-1 font-bold text-white">500</span>
      </div>
    )
  },
  { 
    value: '1000', 
    icon: (props) => (
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 p-1 w-full h-full flex items-center justify-center">
        <Coins size={32} className="text-yellow-300" />
        <span className="ml-1 font-bold text-white">1K</span>
      </div>
    )
  },
];

const MoneyGram = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [bet, setBet] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [symbols, setSymbols] = useState<number[][]>(Array(3).fill(Array(3).fill(0)));
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [lastResults, setLastResults] = useState<number[]>([]);
  
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
      const newBet = Math.max(1, Math.min(100, bet + amount));
      setBet(newBet);
    }
  };
  
  const handleSpin = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to play this game",
        variant: "destructive"
      });
      return;
    }
    
    if (user && user.balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
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
    
    if (user) {
      updateUserBalance(user.balance - bet);
    }
    
    const animationDuration = 2000;
    let spinInterval: NodeJS.Timeout;
    
    spinInterval = setInterval(() => {
      const randomSymbols = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
      );
      setSymbols(randomSymbols);
    }, 100);
    
    setTimeout(() => {
      clearInterval(spinInterval);
      
      const betAmount = bet;
      const shouldWin = shouldBetWin(user.id, 'MoneyGram', betAmount);
      
      let finalSymbols;
      
      if (shouldWin) {
        const winSymbol = Math.floor(Math.random() * moneySymbols.length);
        
        finalSymbols = Array(3).fill(null).map(() => 
          Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
        );
        
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
        
        const symbolValue = parseInt(moneySymbols[winSymbol].value);
        const win = bet * (symbolValue / 100);
        setWinAmount(win);
        
        if (user) {
          updateUserBalance(user.balance - bet + win);
        }
        
        if (!muted && winSound.current) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch(err => console.error("Error playing sound:", err));
        }
        
        toast({
          title: "Winner!",
          description: `You won ${win.toFixed(2)}৳`,
          variant: "default",
          className: "bg-green-600 text-white"
        });
        
        setLastResults(prev => [win, ...prev].slice(0, 5));
      } else {
        finalSymbols = Array(3).fill(null).map(() => 
          Array(3).fill(null).map(() => Math.floor(Math.random() * moneySymbols.length))
        );
        
        if (
          finalSymbols[1][0] === finalSymbols[1][1] && 
          finalSymbols[1][1] === finalSymbols[1][2]
        ) {
          finalSymbols[1][2] = (finalSymbols[1][2] + 1) % moneySymbols.length;
        }
        
        if (
          finalSymbols[0][1] === finalSymbols[1][1] && 
          finalSymbols[1][1] === finalSymbols[2][1]
        ) {
          finalSymbols[2][1] = (finalSymbols[2][1] + 1) % moneySymbols.length;
        }
        
        setLastResults(prev => [0, ...prev].slice(0, 5));
      }
      
      setSymbols(finalSymbols);
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
      
      <div className="p-4 flex justify-between items-center">
        <button 
          className="text-white bg-green-800 p-2 rounded-full"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Money Gram</h1>
        <div className="flex gap-3">
          <button 
            className="text-white bg-green-800 p-2 rounded-full"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
          <button 
            className="text-white bg-green-800 p-2 rounded-full"
            onClick={() => setShowRules(true)}
          >
            <Info className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md aspect-square bg-emerald-800 rounded-xl border-4 border-green-700 shadow-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-900/20" />
          
          <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full w-full relative z-10">
            {symbols.map((row, rowIndex) => (
              row.map((symbolIndex, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className={`bg-gradient-to-b from-emerald-700 to-emerald-800 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden
                    ${
                      winResult.isWin && winResult.positions.some(([r, c]) => r === rowIndex && c === colIndex)
                        ? 'ring-4 ring-yellow-400'
                        : ''
                    }
                    ${
                      rowIndex === 1 && colIndex === 1 
                        ? 'border-2 border-dashed border-white/30' 
                        : ''
                    }
                  `}
                >
                  <motion.div
                    className="w-full h-full flex items-center justify-center p-2"
                    animate={
                      spinning 
                        ? { 
                            y: [0, -10, 10, 0],
                            scale: [1, 0.95, 1.05, 1],
                            rotateY: [0, 180, 360],
                          }
                        : { scale: [1, 1.05, 1] }
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
                  className="bg-green-800 px-6 py-4 rounded-xl border-4 border-green-600 shadow-xl"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <div className="text-center">
                    <motion.h2 
                      className="text-yellow-400 text-2xl font-bold mb-2"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: ["0 0 5px rgba(255,255,0,0.2)", "0 0 20px rgba(255,255,0,0.6)", "0 0 5px rgba(255,255,0,0.2)"]
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      WIN!
                    </motion.h2>
                    <motion.p 
                      className="text-white text-4xl font-bold"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {winAmount.toFixed(2)}৳
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 flex justify-center overflow-x-auto w-full">
          <div className="bg-emerald-800/50 px-4 py-2 rounded-lg">
            <p className="text-xs text-emerald-300 mb-1">Last Results:</p>
            <div className="flex space-x-2">
              {lastResults.length > 0 ? 
                lastResults.map((result, index) => (
                  <span 
                    key={index}
                    className={`text-xs px-2 py-1 rounded ${result > 0 ? 'bg-green-700 text-white' : 'bg-red-800/50 text-red-200'}`}
                  >
                    {result > 0 ? `+${result.toFixed(1)}` : '0'}
                  </span>
                )) : 
                <span className="text-xs text-emerald-400">No history yet</span>
              }
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-md mt-4 bg-emerald-900/70 rounded-xl p-3 border border-emerald-700">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <p className="text-xs text-emerald-300">Balance</p>
              <p className="text-white font-bold">{user?.balance?.toFixed(2) || '0.00'}৳</p>
            </div>
            
            <div className="flex items-center bg-emerald-800 rounded-lg overflow-hidden">
              <button 
                className="px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={() => changeBet(-1)}
                disabled={spinning || bet <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="px-4 py-2 bg-emerald-950">
                <p className="text-xs text-emerald-400">Bet</p>
                <p className="text-emerald-200 font-bold text-center">{bet}৳</p>
              </div>
              <button 
                className="px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={() => changeBet(1)}
                disabled={spinning || bet >= 100}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div>
              <p className="text-xs text-emerald-300">Win</p>
              <p className="text-green-400 font-bold">{winAmount.toFixed(2)}৳</p>
            </div>
          </div>
          
          <Button
            onClick={handleSpin}
            disabled={spinning || !isAuthenticated || (user && user.balance < bet)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 h-auto"
          >
            {spinning ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Spinning...</span>
              </div>
            ) : (
              <span className="text-lg">SPIN</span>
            )}
          </Button>
        </div>
      </main>
      
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-emerald-900 border-green-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-emerald-400">Money Gram Rules</DialogTitle>
            <DialogDescription className="text-emerald-200">
              How to play and win at Money Gram
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-emerald-300 mb-2">How to Win</h3>
              <p className="text-white/90">
                Match 3 of the same money symbols in the center row or center column to win!
                The center position is highlighted with a dashed border.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-300 mb-2">Winning Amounts</h3>
              <div className="space-y-2">
                {moneySymbols.map((symbol, index) => (
                  <div key={index} className="flex items-center bg-emerald-800/50 p-2 rounded">
                    <div className="w-12 h-12">
                      {symbol.icon({})}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold">{symbol.value}৳ Note</p>
                      <p className="text-sm text-emerald-300">Win {(bet * parseInt(symbol.value) / 100).toFixed(1)}৳ on your {bet}৳ bet</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-300 mb-2">Getting Started</h3>
              <p className="text-white/90">
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
