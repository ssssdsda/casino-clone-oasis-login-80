
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Volume2, VolumeX, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define symbols for the reels
const symbols = [
  { id: "blue-fist", name: "Blue Fist", image: "/lovable-uploads/8f9f67ea-c522-40f0-856a-b28bf290cf13.png", value: 5 },
  { id: "red-boxer", name: "Red Boxer", image: "/lovable-uploads/2992c4bb-7e84-4c02-af61-e0b2ebb7aa4c.png", value: 10 },
  { id: "scatter", name: "Scatter", image: "/lovable-uploads/a7972c95-1dbd-4394-8102-016b0b210e5f.png", value: 15 },
  { id: "wild", name: "Wild", image: "/lovable-uploads/0f329ed3-3056-46a0-9a41-2fb408e8cbff.png", value: 20 },
  { id: "blue-boxer", name: "Blue Boxer", image: "/lovable-uploads/6a59f05c-9f18-4e6a-8811-39123668649e.png", value: 10 },
  { id: "letter-a", name: "Letter A", image: "/lovable-uploads/7d62e27f-9c1c-4a9b-ab7c-d71090910de4.png", value: 2 },
  { id: "letter-j", name: "Letter J", image: "/lovable-uploads/6933094c-17f5-4ccb-b2d2-540c989309a4.png", value: 2 },
  { id: "boxing-shorts", name: "Boxing Shorts", image: "/lovable-uploads/8f9f67ea-c522-40f0-856a-b28bf290cf13.png", value: 5 },
];

// Create the initial state of the reels
const createInitialReels = () => {
  const reels = [];
  for (let i = 0; i < 5; i++) {
    const reel = [];
    for (let j = 0; j < 3; j++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      reel.push(symbols[randomIndex]);
    }
    reels.push(reel);
  }
  return reels;
};

const BoxingKingGame = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  
  // Game state
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bet, setBet] = useState(3);
  const [winAmount, setWinAmount] = useState(0);
  const [reels, setReels] = useState(createInitialReels());
  const [winLines, setWinLines] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const spinSound = useRef(null);
  const winSound = useRef(null);
  
  // Initialize sounds
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Handle betting amount change
  const changeBet = (amount) => {
    if (spinning) return;
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };
  
  // Handle spin
  const handleSpin = () => {
    if (spinning) return;
    
    if (!user) {
      toast("Login Required", {
        description: "Please login to play",
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    if (user.balance < bet) {
      toast("Insufficient Balance", {
        description: "Please deposit more funds to play",
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    // Deduct bet from balance
    updateUserBalance(user.balance - bet);
    
    // Play spin sound if not muted
    if (!muted && spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(err => console.error("Error playing sound:", err));
    }
    
    setSpinning(true);
    setWinAmount(0);
    setWinLines([]);
    
    // Generate new symbols for each reel with animation delay
    const newReels = [];
    
    for (let i = 0; i < 5; i++) {
      const reel = [];
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        reel.push(symbols[randomIndex]);
      }
      newReels.push(reel);
      
      // Update reels with delay for animation effect
      setTimeout(() => {
        setReels(prevReels => {
          const updatedReels = [...prevReels];
          updatedReels[i] = reel;
          return updatedReels;
        });
        
        // After last reel stops, calculate winnings
        if (i === 4) {
          setTimeout(() => {
            const { winAmount, winLines } = calculateWinnings(newReels, bet);
            setWinAmount(winAmount);
            setWinLines(winLines);
            
            if (winAmount > 0) {
              // Update balance with winnings
              updateUserBalance(user.balance - bet + winAmount);
              
              // Play win sound if not muted
              if (!muted && winSound.current) {
                winSound.current.currentTime = 0;
                winSound.current.play().catch(err => console.error("Error playing sound:", err));
              }
              
              toast("You Won!", {
                description: `You won ${winAmount.toFixed(2)}!`,
                style: { backgroundColor: "rgb(22, 163, 74)", color: "white", border: "1px solid rgb(21, 128, 61)" }
              });
            }
            
            setSpinning(false);
          }, 500);
        }
      }, (i + 1) * 300); // Stagger the reel stops
    }
  };
  
  // Calculate winnings based on symbol combinations
  const calculateWinnings = (reels, betAmount) => {
    let totalWin = 0;
    const winLines = [];
    
    // Check horizontal lines (3 rows)
    for (let row = 0; row < 3; row++) {
      let symbolsInLine = [];
      for (let col = 0; col < 5; col++) {
        symbolsInLine.push({ symbol: reels[col][row], position: { row, col } });
      }
      
      // Check for matches (at least 3 of the same symbol)
      const firstSymbol = symbolsInLine[0].symbol.id;
      
      // Count wilds and matching symbols
      let matchCount = 0;
      let wildCount = 0;
      let matches = [];
      
      for (let i = 0; i < symbolsInLine.length; i++) {
        const symbol = symbolsInLine[i].symbol;
        if (symbol.id === firstSymbol || symbol.id === "wild") {
          matchCount++;
          if (symbol.id === "wild") wildCount++;
          matches.push(symbolsInLine[i].position);
        } else {
          break;
        }
      }
      
      // Calculate win amount based on matches
      if (matchCount >= 3) {
        const symbolValue = symbols.find(s => s.id === firstSymbol)?.value || 1;
        const win = betAmount * symbolValue * Math.pow(2, matchCount - 3);
        totalWin += win;
        
        winLines.push({
          positions: matches,
          win: win
        });
      }
    }
    
    // Check for scatter symbols
    let scatterCount = 0;
    let scatterPositions = [];
    
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (reels[col][row].id === "scatter") {
          scatterCount++;
          scatterPositions.push({ row, col });
        }
      }
    }
    
    if (scatterCount >= 3) {
      const scatterWin = betAmount * 5 * scatterCount;
      totalWin += scatterWin;
      winLines.push({
        positions: scatterPositions,
        win: scatterWin
      });
    }
    
    return { winAmount: totalWin, winLines };
  };
  
  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black flex flex-col items-center justify-center p-4">
        <motion.h1 
          className="text-4xl font-bold text-yellow-500 mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Boxing King
        </motion.h1>
        <motion.div 
          className="w-32 h-32 border-8 border-yellow-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-yellow-400 mt-6">Loading game...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black flex flex-col">
      {/* Game header */}
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <button 
          className="text-yellow-500"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-3xl font-bold text-yellow-500">Boxing King</h1>
        <div className="flex gap-3">
          <button 
            className="text-yellow-500"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
          <button 
            className="text-yellow-500"
            onClick={() => setShowRules(true)}
          >
            <Info className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Game content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-32 h-32 blur-xl bg-red-500 opacity-20 rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 blur-xl bg-blue-500 opacity-20 rounded-full" />
        </div>
        
        {/* Game board */}
        <div className="relative w-full max-w-3xl aspect-[16/10] bg-indigo-900 rounded-lg overflow-hidden border-4 border-indigo-700 shadow-2xl z-10">
          {/* Game frame with metallic look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 z-0">
            {/* Ring ropes visual effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-blue-500" />
            
            {/* Corner screws */}
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600" />
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-bl from-gray-300 to-gray-600" />
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-gradient-to-tr from-gray-300 to-gray-600" />
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-gradient-to-tl from-gray-300 to-gray-600" />
          </div>
          
          {/* Game logo */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="text-2xl font-bold text-yellow-500 drop-shadow-md">
              Boxing <span className="text-yellow-400">KING</span>
            </div>
          </div>
          
          {/* Reels container */}
          <div className="absolute inset-4 top-12 bg-indigo-950 rounded overflow-hidden flex">
            {reels.map((reel, reelIndex) => (
              <div 
                key={`reel-${reelIndex}`}
                className="flex-1 border-r-2 border-indigo-800 last:border-r-0"
              >
                {/* Reel content */}
                <div className="w-full h-full relative">
                  {/* Symbols in the reel */}
                  <div className={`flex flex-col h-full`}>
                    {reel.map((symbol, symbolIndex) => (
                      <motion.div 
                        key={`symbol-${reelIndex}-${symbolIndex}`}
                        className="h-1/3 p-1 relative"
                        animate={
                          spinning && reels[reelIndex] !== reel 
                            ? { 
                                y: [0, -30, 30, 0],
                                transition: { 
                                  repeat: Infinity,
                                  duration: 0.3,
                                  ease: "linear"
                                }
                              }
                            : {}
                        }
                      >
                        {/* Symbol background with glow effect */}
                        <div className="absolute inset-0 m-1 rounded-md bg-gradient-to-b from-indigo-700 to-indigo-900" />
                        
                        {/* Symbol image */}
                        <div className="absolute inset-0 m-1 rounded-md overflow-hidden flex items-center justify-center">
                          <img 
                            src={symbol.image} 
                            alt={symbol.name} 
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        
                        {/* Highlight for win lines */}
                        {winLines.some(line => 
                          line.positions.some(pos => 
                            pos.col === reelIndex && pos.row === symbolIndex
                          )
                        ) && (
                          <motion.div 
                            className="absolute inset-0 m-1 rounded-md border-2 border-yellow-400"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paylines and win indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <AnimatePresence>
              {winAmount > 0 && (
                <motion.div 
                  className="bg-black bg-opacity-70 px-6 py-2 rounded-full text-yellow-400 font-bold"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  WIN: {winAmount.toFixed(2)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="w-full max-w-3xl mt-4 bg-black bg-opacity-50 p-4 rounded-xl z-10 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">BALANCE</div>
            <div className="text-yellow-400 font-bold">{user?.balance?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400">BET</div>
              <div className="flex items-center bg-indigo-950 rounded">
                <button 
                  className="px-3 py-1 text-yellow-500 hover:bg-indigo-900 rounded-l"
                  onClick={() => changeBet(-1)}
                  disabled={spinning || bet <= 1}
                >-</button>
                <span className="px-3 py-1 text-yellow-400 font-bold">{bet}</span>
                <button 
                  className="px-3 py-1 text-yellow-500 hover:bg-indigo-900 rounded-r"
                  onClick={() => changeBet(1)}
                  disabled={spinning}
                >+</button>
              </div>
            </div>
            
            <Button
              onClick={handleSpin}
              disabled={spinning || !user || (user && user.balance < bet)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full h-14 w-14 p-0 ml-4"
            >
              {spinning ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <img 
                  src="/lovable-uploads/0f329ed3-3056-46a0-9a41-2fb408e8cbff.png" 
                  alt="Spin" 
                  className="h-8 w-8 object-contain"
                />
              )}
            </Button>
          </div>
          
          <div>
            <div className="text-xs text-gray-400">WIN</div>
            <div className="text-green-400 font-bold">{winAmount.toFixed(2)}</div>
          </div>
        </div>
        
        {/* Symbols carousel */}
        <div className="w-full max-w-3xl mt-4 z-10">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg bg-black bg-opacity-30 p-2">
            <div className="flex space-x-4 p-2">
              {symbols.map((symbol) => (
                <div key={symbol.id} className="flex flex-col items-center w-20 shrink-0">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-indigo-900 p-1">
                    <img src={symbol.image} alt={symbol.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs mt-1 text-gray-300 text-center">{symbol.name}</div>
                  <div className="text-xs text-yellow-400">{symbol.value}x</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Game Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-md bg-indigo-950 text-white border border-indigo-700">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xl">Boxing King Rules</DialogTitle>
            <DialogDescription className="text-gray-300">
              Learn how to play and win at Boxing King Slots!
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">How to Play</h3>
                <p className="text-gray-300 mt-1">
                  1. Set your bet amount using the + and - buttons<br/>
                  2. Click the spin button to start the game<br/>
                  3. Wait for all 5 reels to stop spinning<br/>
                  4. If you have a winning combination, you'll receive your prize!
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Winning Combinations</h3>
                <p className="text-gray-300 mt-1">
                  Winning combinations are formed by matching 3 or more identical symbols on a payline, starting from the leftmost reel.
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Special Symbols</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-900 rounded flex items-center justify-center">
                      <img src="/lovable-uploads/0f329ed3-3056-46a0-9a41-2fb408e8cbff.png" alt="Wild" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-300">Wild Symbol</p>
                      <p className="text-sm text-gray-300">Substitutes for any symbol except Scatter to form winning combinations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-900 rounded flex items-center justify-center">
                      <img src="/lovable-uploads/a7972c95-1dbd-4394-8102-016b0b210e5f.png" alt="Scatter" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-300">Scatter Symbol</p>
                      <p className="text-sm text-gray-300">3 or more scatter symbols anywhere on the reels award scatter wins multiplied by your total bet.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Payouts</h3>
                <p className="text-gray-300 mt-1">
                  • 3 matching symbols: Symbol Value × Bet<br/>
                  • 4 matching symbols: Symbol Value × Bet × 2<br/>
                  • 5 matching symbols: Symbol Value × Bet × 4<br/>
                  • 3 or more scatters: 5 × Number of Scatters × Bet
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Symbol Values</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {symbols.map((symbol) => (
                    <div key={symbol.id} className="flex items-center gap-2 bg-indigo-900 bg-opacity-50 p-2 rounded">
                      <img src={symbol.image} alt={symbol.name} className="w-8 h-8 object-contain" />
                      <div>
                        <p className="text-sm text-white">{symbol.name}</p>
                        <p className="text-xs text-yellow-400">{symbol.value}× multiplier</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowRules(false)}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @keyframes slide-reel {
          0% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }
        .animate-slide-reel {
          animation: slide-reel 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BoxingKingGame;
