import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RotateCcw, Play, Pause, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { setDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';

const firestore = getFirestore(app);

// Slot machine symbols and their values
const SYMBOLS = [
  { id: 0, value: '0', color: 'text-amber-500' },
  { id: 1, value: '1', color: 'text-amber-500' },
  { id: 2, value: '2', color: 'text-amber-500' },
  { id: 3, value: '3', color: 'text-amber-500' },
  { id: 4, value: '4', color: 'text-amber-500' },
  { id: 5, value: '5', color: 'text-amber-500' },
  { id: 6, value: '6', color: 'text-amber-500' },
  { id: 7, value: '7', color: 'text-amber-500' },
  { id: 8, value: '8', color: 'text-amber-500' },
  { id: 9, value: '9', color: 'text-amber-500' },
];

// Wheel values
const WHEEL_VALUES = [50, 200, 1000, 2000, 50, 500, 100, 2000];

const MoneyGram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Game state
  const [balance, setBalance] = useState<number>(user?.balance || 2000.00);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [showWheel, setShowWheel] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  
  // Reels state
  const [reels, setReels] = useState<number[][]>([
    [5, 0, 5],
    [0, 0, 0],
    [5, 0, 5],
  ]);
  const [reelPositions, setReelPositions] = useState<number[]>([0, 0, 0]);
  
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const wheelRotationRef = useRef<number>(0);
  
  // Load game and show loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle auto play
  useEffect(() => {
    if (isAutoPlay && !isSpinning && balance >= betAmount) {
      autoPlayIntervalRef.current = setInterval(() => {
        handleSpin();
      }, 3000);
    }
    
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [isAutoPlay, isSpinning, balance, betAmount]);
  
  // Update bet amount
  const updateBetAmount = (amount: number) => {
    const newAmount = Math.max(10, Math.min(1000, betAmount + amount));
    setBetAmount(newAmount);
  };
  
  // Reset game
  const resetGame = () => {
    setWinAmount(0);
  };
  
  // Handle spin
  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) return;
    
    // Deduct bet amount from balance
    setBalance(prev => prev - betAmount);
    setIsSpinning(true);
    setWinAmount(0);
    
    // Save bet to Firebase
    try {
      await addDoc(collection(firestore, "bets"), {
        userId: user?.id || "anonymous",
        betAmount: betAmount,
        game: "MoneyGram",
        timestamp: serverTimestamp(),
        userBalance: balance - betAmount
      });
    } catch (error) {
      console.error("Error saving bet: ", error);
    }
    
    // Generate random reel positions
    const randomReels = reels.map(() => 
      Array(3).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length))
    );
    
    // Animate reels
    const spinDurations = [1500, 1800, 2100]; // Different durations for each reel
    
    // Spin reels with staggered timing
    setTimeout(() => {
      setReels([
        [randomReels[0][0], randomReels[0][1], randomReels[0][2]],
        reels[1]
      ]);
    }, 500);
    
    setTimeout(() => {
      setReels([
        [randomReels[0][0], randomReels[0][1], randomReels[0][2]],
        [randomReels[1][0], randomReels[1][1], randomReels[1][2]],
        reels[2]
      ]);
    }, 1000);
    
    setTimeout(() => {
      setReels(randomReels);
      
      // Check for win
      const middleRow = [randomReels[0][1], randomReels[1][1], randomReels[2][1]];
      
      // Check for match on middle row
      if (middleRow.every(symbol => symbol === middleRow[0])) {
        // Big win - match 3
        const winMultiplier = (middleRow[0] + 1) * 3;
        const win = betAmount * winMultiplier;
        setWinAmount(win);
        setBalance(prev => prev + win);
        
        toast({
          title: "Big Win!",
          description: `You won ${win.toFixed(2)}!`,
          variant: "default",
          className: "bg-green-500 text-white font-bold",
        });
      } else if (middleRow[0] === middleRow[1] || middleRow[1] === middleRow[2]) {
        // Small win - match 2
        const winMultiplier = 1.5;
        const win = betAmount * winMultiplier;
        setWinAmount(win);
        setBalance(prev => prev + win);
        
        toast({
          title: "You Won!",
          description: `You won ${win.toFixed(2)}!`,
          variant: "default",
          className: "bg-green-500 text-white",
        });
      }
      
      // Check for scatter (showing wheel)
      if (Math.random() < 0.2) {
        setShowWheel(true);
        spinWheel();
      }
      
      setIsSpinning(false);
    }, 2200);
  };
  
  // Spin the bonus wheel
  const spinWheel = () => {
    if (wheelRef.current) {
      // Random rotation between 2 and 10 full turns + random position
      const randomRotation = 720 + Math.floor(Math.random() * 3600);
      wheelRotationRef.current = randomRotation;
      
      // Spin the wheel
      wheelRef.current.style.transform = `rotate(${randomRotation}deg)`;
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.97)';
      
      // Determine win after wheel stops
      setTimeout(() => {
        // Calculate which section is at the pointer (12 o'clock position)
        const sectionAngle = 360 / WHEEL_VALUES.length;
        const finalRotation = randomRotation % 360;
        const sectionIndex = Math.floor((360 - finalRotation) / sectionAngle) % WHEEL_VALUES.length;
        
        const wheelWin = WHEEL_VALUES[sectionIndex] * betAmount / 10;
        setBalance(prev => prev + wheelWin);
        
        toast({
          title: "Wheel Bonus!",
          description: `You won ${wheelWin.toFixed(2)} from the wheel!`,
          variant: "default",
          className: "bg-purple-500 text-white font-bold",
        });
        
        // Close wheel after showing result
        setTimeout(() => {
          setShowWheel(false);
        }, 2000);
      }, 4500);
    }
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-900 to-red-950">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="text-6xl font-bold text-yellow-400 mb-8 tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            MONEY COMING
          </motion.div>
          
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 border-4 border-t-transparent border-r-yellow-400 border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: -180 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <motion.p
            className="mt-8 text-yellow-300 text-lg"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading game...
          </motion.p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-900 to-red-950">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Game Container */}
        <div className="relative w-full max-w-4xl bg-gradient-to-b from-amber-700 to-amber-950 rounded-xl shadow-2xl overflow-hidden border-8 border-amber-600">
          {/* Game Header */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 p-3 flex justify-center">
              <h1 className="text-5xl font-bold text-red-700 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0px 0px 10px rgba(255,255,255,0.8)' }}>
                Money Coming
              </h1>
            </div>
            
            {/* Betting Options */}
            <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 p-2 border-y-4 border-amber-600">
              <div className="flex justify-between items-center">
                <div className="w-1/3">
                  {/* Wheel display */}
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-green-700 to-yellow-600 rounded-full border-4 border-yellow-500 shadow-lg flex items-center justify-center"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isSpinning ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
                  >
                    <div className="w-16 h-16 rounded-full border-8 border-yellow-400 border-t-green-500 border-r-red-500" />
                  </motion.div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-xl p-2 border-2 border-yellow-600 flex items-center justify-between">
                    <div className="text-xl font-bold text-white">Bet</div>
                    <div className="text-4xl font-extrabold text-yellow-300" style={{ textShadow: '0px 0px 8px rgba(255,215,0,0.7)' }}>50</div>
                    <div className="flex flex-col">
                      <img 
                        src="/lovable-uploads/047cc796-53b7-4c0b-a938-259ab29ca8c8.png" 
                        alt="Scatter left" 
                        className="w-8 h-8" 
                      />
                      <div className="text-xs text-center text-yellow-300">SCATTER</div>
                    </div>
                    <div className="text-amber-400 font-bold">→</div>
                    <div className="flex flex-col">
                      <img 
                        src="/lovable-uploads/047cc796-53b7-4c0b-a938-259ab29ca8c8.png" 
                        alt="Scatter right" 
                        className="w-8 h-8" 
                      />
                      <div className="text-xs text-center text-yellow-300">SCATTER</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-xl p-2 border-2 border-yellow-600 flex items-center justify-between">
                    <div className="text-xl font-bold text-white">Bet</div>
                    <div className="text-4xl font-extrabold text-yellow-300" style={{ textShadow: '0px 0px 8px rgba(255,215,0,0.7)' }}>10</div>
                    <div className="text-white">unlock</div>
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">10x</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reels Area */}
          <div className="relative bg-gradient-to-b from-green-700 via-green-600 to-green-700 p-4 border-b-4 border-amber-600">
            <div className="flex h-56">
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="flex-1 border-r-4 border-l-4 border-amber-600 bg-green-600 mx-1 overflow-hidden relative">
                  <motion.div
                    className="flex flex-col items-center h-full"
                    animate={{ 
                      y: isSpinning ? [-300, 0, -300] : 0 
                    }}
                    transition={{ 
                      duration: isSpinning ? 1 : 0, 
                      repeat: isSpinning ? Infinity : 0, 
                      ease: "linear",
                      delay: reelIndex * 0.2
                    }}
                  >
                    {reel.map((symbolId, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className="flex items-center justify-center h-[33%]"
                      >
                        <motion.div
                          className={`text-7xl font-bold ${SYMBOLS[symbolId].color}`}
                          style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5), 0px 0px 15px rgba(255,255,255,0.5)' }}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ 
                            scale: symbolIndex === 1 ? 1.1 : 0.8,
                            opacity: symbolIndex === 1 ? 1 : 0.7
                          }}
                        >
                          {SYMBOLS[symbolId].value}
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              ))}
              
              {/* Right Side Buttons */}
              <div className="w-1/6 flex flex-col justify-between">
                <div className="bg-blue-800 rounded-full h-24 w-24 border-4 border-yellow-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white font-bold">FREE</div>
                    <div className="text-2xl font-bold text-white">RESPIN</div>
                  </div>
                </div>
                
                <div className="bg-blue-800 rounded-full h-24 w-24 border-4 border-yellow-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white font-bold">WHEEL</div>
                    <div className="text-2xl font-bold text-white">ALL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="bg-gradient-to-b from-amber-800 to-amber-950 p-2 flex justify-between items-center">
            <Button variant="ghost" className="rounded-full bg-amber-600 h-12 w-12">
              <Settings className="h-6 w-6 text-yellow-300" />
            </Button>
            
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-yellow-400">Balance</div>
              <div className="text-2xl font-bold text-yellow-300">{balance.toFixed(2)}</div>
              <div className="flex items-center">
                <div className="text-lg font-bold text-yellow-400">Bet</div>
                <div className="text-xl font-bold text-yellow-300 ml-2">{betAmount}</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-yellow-400">WIN</div>
              <div className="text-2xl font-bold text-yellow-300">{winAmount.toFixed(2)}</div>
            </div>
            
            <Button variant="ghost" className="rounded-full bg-amber-600 h-12 w-12">
              <RotateCcw className="h-6 w-6 text-yellow-300" />
            </Button>
            
            <Button 
              onClick={handleSpin}
              disabled={isSpinning || balance < betAmount}
              className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600 transition-all flex items-center justify-center border-4 border-green-700"
            >
              {isSpinning ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Bonus Wheel Modal */}
        <AnimatePresence>
          {showWheel && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-gradient-to-b from-yellow-800 to-amber-950 p-6 rounded-xl border-8 border-yellow-600 shadow-2xl max-w-2xl w-full"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
              >
                <h2 className="text-4xl font-bold text-yellow-400 text-center mb-6">Bonus Wheel!</h2>
                
                <div className="relative w-80 h-80 mx-auto mb-8">
                  {/* Wheel pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-10">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-500" />
                  </div>
                  
                  {/* Wheel */}
                  <div 
                    ref={wheelRef}
                    className="w-full h-full rounded-full border-8 border-yellow-500 relative overflow-hidden"
                    style={{ transformOrigin: 'center center' }}
                  >
                    {WHEEL_VALUES.map((value, index) => {
                      const angle = (360 / WHEEL_VALUES.length) * index;
                      const color = index % 2 === 0 ? 'bg-red-600' : 'bg-green-600';
                      
                      return (
                        <div 
                          key={index}
                          className={`absolute w-1/2 h-1/2 origin-bottom-right ${color} flex items-center justify-start pl-4 font-bold text-white text-xl`}
                          style={{ 
                            transform: `rotate(${angle}deg) skew(${90 - (360 / WHEEL_VALUES.length)}deg)`,
                            transformOrigin: '0% 100%'
                          }}
                        >
                          <span className="transform -rotate-[20deg] -translate-y-8">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-center text-white mb-4">
                  Spinning wheel for bonus winnings!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default MoneyGram;
