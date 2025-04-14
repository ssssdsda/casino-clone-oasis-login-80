import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Play, Star, ArrowRight, RefreshCw, Info, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

const fruitSymbols = [
  { id: 'cherry', image: '/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png', value: 5 },
  { id: 'lemon', image: '/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png', value: 3 },
  { id: 'orange', image: '/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png', value: 4 },
  { id: 'coin', image: '/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png', value: 15 },
  { id: 'wild', image: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png', value: 10 },
];

const bettingOptions = [1, 2, 5, 10, 20, 50, 100];
const REEL_COUNT = 4;
const VISIBLE_SYMBOLS = 3;

const preloadImages = () => {
  fruitSymbols.forEach(symbol => {
    const img = new Image();
    img.src = symbol.image;
  });
};

const SpinGame = () => {
  const { t } = useLanguage();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [reels, setReels] = useState<number[][]>([
    [0, 1, 2, 3, 4, 0, 1], 
    [1, 2, 3, 4, 0, 1, 2], 
    [2, 3, 4, 0, 1, 2, 3],
    [3, 4, 0, 1, 2, 3, 4]
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(5);
  const [win, setWin] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lastWins, setLastWins] = useState<number[]>([]);
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [finalSymbols, setFinalSymbols] = useState<number[]>([]);
  const [winningSymbols, setWinningSymbols] = useState<number[]>([]);
  
  const reelRefs = useRef<HTMLDivElement[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!preloaded) {
      preloadImages();
      setPreloaded(true);
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
      setShowContinue(true);
    }, 2000);
    
    audioRef.current = new Audio('/sounds/spin.mp3'); 
    winAudioRef.current = new Audio('/sounds/win.mp3'); 
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleContinue = () => {
    setShowContinue(false);
  };
  
  const handleSpin = () => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToPlay'),
        variant: "destructive",
      });
      return;
    }
    
    const totalBet = bet * betMultiplier;
    
    if (user.balance < totalBet) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet from balance immediately
    updateUserBalance(user.balance - totalBet);
    setSpinning(true);
    setWin(0);
    setWinningSymbols([]);
    
    if (!muted && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play error:", err));
    }
    
    // Check if this bet should win based on our betting system
    const shouldWin = shouldBetWin(user.uid);
    
    // Create new reels with random symbols
    let newFinalSymbols: number[] = [];
    
    if (shouldWin) {
      // If the player should win, create a winning pattern
      // Choose a random symbol to be the winning one
      const winningSymbolIndex = Math.floor(Math.random() * fruitSymbols.length);
      
      // Decide if it's going to be 3 or 4 matching symbols
      const matchCount = Math.random() > 0.2 ? 3 : 4; // 20% chance for 4 matches
      
      // Create the winning row with matching symbols
      newFinalSymbols = Array(REEL_COUNT).fill(0).map((_, i) => 
        i < matchCount ? winningSymbolIndex : Math.floor(Math.random() * fruitSymbols.length)
      );
      
      // Shuffle to make it not always at the beginning
      if (matchCount === 3) {
        const skipIndex = Math.floor(Math.random() * REEL_COUNT);
        if (skipIndex < 3) { // Make sure we still have 3 in a row somewhere
          newFinalSymbols[skipIndex] = (winningSymbolIndex + 1) % fruitSymbols.length;
        }
      }
    } else {
      // If the player should lose, ensure no more than 2 matching symbols
      newFinalSymbols = Array(REEL_COUNT).fill(0).map(() => 
        Math.floor(Math.random() * fruitSymbols.length)
      );
      
      // Ensure no more than 2 of any symbol
      const counts: Record<number, number> = {};
      newFinalSymbols.forEach((sym, i) => {
        counts[sym] = (counts[sym] || 0) + 1;
        // If we have more than 2 of this symbol, change it
        if (counts[sym] > 2) {
          let newSym;
          do {
            newSym = Math.floor(Math.random() * fruitSymbols.length);
          } while (newSym === sym);
          newFinalSymbols[i] = newSym;
          counts[newSym] = (counts[newSym] || 0) + 1;
        }
      });
    }
    
    setFinalSymbols(newFinalSymbols);
    
    // Generate new full reels that will end with our final symbols
    const newReels = reels.map((_, reelIndex) => {
      const reelLength = 20; // Length of the spinning reel
      const finalSymbol = newFinalSymbols[reelIndex];
      
      // Generate random symbols for the reel, with the final symbol at the end
      return Array(reelLength).fill(0).map((_, i) => 
        i === reelLength - 1 ? finalSymbol : Math.floor(Math.random() * fruitSymbols.length)
      );
    });
    
    // Start the spinning animation
    setReels(newReels);
    
    // Stop the reels after a delay
    const stopReels = () => {
      // Count matching symbols
      const counts: Record<number, number> = {};
      newFinalSymbols.forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
      });
      
      // Find the symbol with the most matches
      let maxCount = 0;
      let maxSymbol = -1;
      Object.entries(counts).forEach(([symbol, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxSymbol = parseInt(symbol);
        }
      });
      
      // Determine if player won
      let winAmount = 0;
      if (maxCount >= 3) {
        // Highlight winning symbols
        const winningIndices: number[] = [];
        newFinalSymbols.forEach((sym, i) => {
          if (sym === maxSymbol) {
            winningIndices.push(i);
          }
        });
        setWinningSymbols(winningIndices);
        
        const symbolValue = fruitSymbols[maxSymbol].value;
        winAmount = totalBet * symbolValue * (maxCount === 4 ? 2 : 1);
        
        // Update user balance with winnings
        updateUserBalance(user.balance - totalBet + winAmount);
        
        setWin(winAmount);
        setLastWins(prev => [winAmount, ...prev.slice(0, 4)]);
        
        if (!muted && winAudioRef.current) {
          winAudioRef.current.play().catch(err => console.error("Win audio play error:", err));
        }
        
        toast({
          title: maxCount === 4 ? "MEGA WIN!" : t('youWon'),
          description: `${winAmount}৳`,
          variant: "default",
          className: maxCount === 4 ? "bg-yellow-500 text-black font-bold" : "bg-green-500 text-white"
        });
      } else {
        setLastWins(prev => [0, ...prev.slice(0, 4)]);
      }
      
      setSpinning(false);
    };
    
    // Stagger the stopping of each reel
    setTimeout(stopReels, 2000);
  };
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };
  
  const handleBetMultiplierChange = (multiplier: number) => {
    setBetMultiplier(multiplier);
  };
  
  const selectBettingOption = (option: number) => {
    setBet(option);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: ["0 0 4px #fff", "0 0 8px #fff", "0 0 4px #fff"],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              Casino Win Spin
            </motion.h1>
            <motion.div 
              className="w-24 h-24 border-8 border-yellow-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-white text-lg"
              animate={{ 
                opacity: [1, 0.5, 1] 
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              {t('loading')}...
            </motion.p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (showContinue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              Casino Win Spin
            </motion.h1>
            
            <div className="flex justify-center mt-3 mb-8">
              <div className="flex space-x-1">
                {['W','I','N','S','P','I','N'].map((letter, index) => (
                  <motion.span
                    key={index}
                    className={`bg-${index % 2 ? 'yellow' : 'pink'}-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl`}
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: index * 0.1
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              {fruitSymbols.slice(0, 3).map((symbol, index) => (
                <motion.img
                  key={index}
                  src={symbol.image}
                  alt={symbol.id}
                  className="w-16 h-16 object-contain"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, index % 2 ? 10 : -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5 + (index * 0.2), 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                />
              ))}
            </div>
            
            <p className="text-white mb-6 text-lg">Match 3 or 4 identical fruits to win! The more matches, the bigger your prize!</p>
            
            <motion.button 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full text-xl flex items-center justify-center mx-auto shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
            >
              {t('continue')} <ArrowRight className="ml-2 h-6 w-6" />
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto">
        {/* Title section */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 p-1 rounded-lg">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded border-2 border-red-500 p-2 relative">
              <motion.div 
                className="absolute -top-1 left-0 right-0 flex justify-around"
                animate={{ 
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.05 % 0.5
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 drop-shadow-lg py-2"
                animate={{ 
                  textShadow: ["0 0 4px rgba(255,255,255,0.5)", "0 0 8px rgba(255,255,255,0.8)", "0 0 4px rgba(255,255,255,0.5)"]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                Casino Win Spin
              </motion.h1>
              
              <div className="flex justify-center space-x-2 mt-1">
                {['W','I','N','$','P','I','N'].map((letter, index) => (
                  <motion.span 
                    key={index}
                    className={`${
                      index === 0 ? "bg-blue-500" : 
                      index === 1 ? "bg-purple-500" : 
                      index === 2 ? "bg-green-500" : 
                      index === 3 ? "bg-yellow-500" : 
                      index === 4 ? "bg-orange-500" : 
                      index === 5 ? "bg-red-500" : 
                      "bg-pink-500"
                    } ${
                      index === 3 ? "text-black" : "text-white"
                    } w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl`}
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: index * 0.1
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              
              <motion.div 
                className="absolute -bottom-1 left-0 right-0 flex justify-around"
                animate={{ 
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.05 % 0.5
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Slot machine display */}
        <div className="relative bg-gradient-to-b from-purple-900 to-indigo-900 p-6 rounded-3xl border-4 border-pink-700 shadow-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30 rounded-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-20 rounded-3xl pointer-events-none" />
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-gray-800/50 text-white border-gray-600 z-10"
            onClick={() => setShowRules(true)}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          {/* Slot Machine Display */}
          <div className="flex justify-center bg-gray-800 bg-opacity-70 p-4 rounded-2xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
            
            {/* Slot machine frame */}
            <div className="relative bg-gray-900 border-8 border-yellow-800 rounded-lg p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 to-yellow-800/20 rounded-lg" />
              
              {/* Reels container */}
              <div className="flex space-x-2 relative">
                {[0, 1, 2, 3].map((reelIndex) => (
                  <div 
                    key={reelIndex}
                    className="relative w-24 h-72 bg-white rounded-md overflow-hidden border-4 border-gray-700 shadow-inner"
                    ref={(el) => el && (reelRefs.current[reelIndex] = el)}
                  >
                    {/* Reel strip */}
                    <motion.div
                      className="absolute inset-0"
                      animate={spinning ? {
                        y: [0, -2000, -2300],
                        transition: {
                          y: {
                            duration: 1.5 + (reelIndex * 0.2),
                            ease: "easeInOut",
                          }
                        }
                      } : {}}
                    >
                      <div className="flex flex-col items-center">
                        {reels[reelIndex].map((symbolIndex, idx) => (
                          <div 
                            key={`${reelIndex}-${idx}`} 
                            className="w-16 h-16 my-6 flex items-center justify-center"
                          >
                            <motion.img
                              src={fruitSymbols[symbolIndex].image}
                              alt={fruitSymbols[symbolIndex].id}
                              className="w-full h-full object-contain"
                              animate={!spinning ? {
                                scale: [1, 1.05, 1],
                                rotate: [0, idx % 2 ? 3 : -3, 0],
                              } : {}}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    
                    {/* Win highlight overlay */}
                    {!spinning && winningSymbols.includes(reelIndex) && (
                      <motion.div 
                        className="absolute inset-0 bg-yellow-500 bg-opacity-30 pointer-events-none"
                        animate={{
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    )}
                  </div>
                ))}
                
                {/* Win line */}
                <div className="absolute left-0 right-0 h-0.5 bg-yellow-500 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none" />
              </div>
              
              {/* Pay line indicators */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Win display */}
          {win > 0 && !spinning && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 rounded-xl p-4 text-center z-20"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [-10, 5, 0],
                boxShadow: [
                  "0 0 0px rgba(255, 215, 0, 0)", 
                  "0 0 30px rgba(255, 215, 0, 0.8)", 
                  "0 0 10px rgba(255, 215, 0, 0.5)"
                ]
              }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15
              }}
            >
              <motion.div 
                className="text-yellow-400 font-bold text-xl md:text-3xl mb-1"
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 5px rgba(255, 215, 0, 0.5)", 
                    "0 0 20px rgba(255, 215, 0, 0.8)", 
                    "0 0 5px rgba(255, 215, 0, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                WIN!
              </motion.div>
              <motion.div 
                className="text-green-400 font-bold text-3xl md:text-5xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 5px rgba(0, 255, 0, 0.5)", 
                    "0 0 20px rgba(0, 255, 0, 0.8)", 
                    "0 0 5px rgba(0, 255, 0, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                {win.toFixed(2)}৳
              </motion.div>
            </motion.div>
          )}
          
          {/* Win history */}
          <div className="flex justify-center space-x-2 mt-3">
            <div className="bg-gray-800/70 rounded-lg p-2 flex items-center space-x-2">
              <span className="text-xs text-gray-300">Last wins:</span>
              {lastWins.length > 0 ? 
                lastWins.map((winAmount, i) => (
                  <motion.span 
                    key={i}
                    className={`text-xs font-mono px-2 py-1 rounded ${winAmount > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900/50 text-red-300'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    {winAmount > 0 ? `+${winAmount}` : '0'}
                  </motion.span>
                )) : 
                <span className="text-xs text-gray-400">No history</span>
              }
            </div>
          </div>
        </div>
        
        {/* Controls section */}
        <div className="bg-gray-900 bg-opacity-70 p-4 rounded-xl border border-gray-700 shadow-inner backdrop-blur-sm mb-4">
          {/* Bet amount selection */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {bettingOptions.map(option => (
              <motion.button
                key={option}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm ${bet === option ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectBettingOption(option)}
                disabled={spinning}
              >
                {option}৳
              </motion.button>
            ))}
          </div>
          
          {/* Bet multiplier */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-center text-gray-400 mb-1">Bet Multiplier</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 5, 10].map((mult) => (
                  <motion.button
                    key={mult}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold ${
                      betMultiplier === mult ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBetMultiplierChange(mult)}
                    disabled={spinning}
                  >
                    x{mult}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main controls */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Audio, back, refresh buttons */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-white" />}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className
