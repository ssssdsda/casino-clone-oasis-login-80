
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RefreshCw, RotateCcw, Play, Plus, Minus, ArrowDown, ArrowUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Define symbol types with their images
const symbols = [
  { id: 'cherry', image: '/lovable-uploads/7ee869ea-c4ce-4db7-9031-a09bbd8ad5fd.png', value: 3 },
  { id: 'lemon', image: '/lovable-uploads/0fe41380-0ce3-42f3-a0f4-491bb537c704.png', value: 2 },
  { id: 'orange', image: '/lovable-uploads/2c773f0b-62a0-42ff-92e3-93c14f438654.png', value: 2 },
  { id: 'plum', image: '/lovable-uploads/adbc8de0-0c80-42d3-a1f0-e39550742fc6.png', value: 2 },
  { id: 'coin', image: '/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png', value: 15 },
];

// Paytable configuration
const paytable = [
  { combination: '7️⃣7️⃣7️⃣', multiplier: 100 },
  { combination: '🪙🪙🪙', multiplier: 50 },
  { combination: '🍒🍒🍒', multiplier: 20 },
  { combination: '🍋🍋🍋', multiplier: 15 },
  { combination: '🍊🍊🍊', multiplier: 15 },
  { combination: '🍑🍑🍑', multiplier: 15 },
  { combination: '🍒🍒 Any', multiplier: 5 },
  { combination: 'Any 🪙🪙', multiplier: 10 },
  { combination: 'Any Three Same', multiplier: 5 },
];

const CoinsGame = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [muted, setMuted] = useState(true);
  const [showPaytable, setShowPaytable] = useState(false);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  
  // Set up reels with consecutive indices for later mapping to actual symbols
  const [reels, setReels] = useState([
    [0, 1, 2, 3, 4], 
    [1, 2, 3, 4, 0], 
    [2, 3, 4, 0, 1]
  ]);
  
  // Animation settings
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // References for audio
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const jackpotSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Results to display after spinning
  const [results, setResults] = useState<number[][]>([]);

  useEffect(() => {
    // Initialize sounds
    spinSoundRef.current = new Audio('/placeholder.svg');
    winSoundRef.current = new Audio('/placeholder.svg');
    jackpotSoundRef.current = new Audio('/placeholder.svg');
    
    // Show loading for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(5, Math.min(500, bet + amount));
    setBet(newBet);
  };
  
  const handleSpin = () => {
    if (spinning) return;
    
    if (balance < bet) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    setSpinning(true);
    setWin(0);
    setWinningLines([]);
    setBalance(prev => prev - bet);
    
    if (!muted && spinSoundRef.current) {
      spinSoundRef.current.play();
    }

    // Generate random results for each reel
    const newResults = reels.map(() => {
      return Array(5).fill(0).map(() => Math.floor(Math.random() * symbols.length));
    });
    
    setResults(newResults);
    
    // Animate reels in sequence
    setTimeout(() => {
      // Check for wins in each possible payline:
      // - Middle horizontal (indices [0,1], [1,1], [2,1])
      // - Top horizontal (indices [0,0], [1,0], [2,0])
      // - Bottom horizontal (indices [0,2], [1,2], [2,2])
      // - Diagonal top-left to bottom-right (indices [0,0], [1,1], [2,2])
      // - Diagonal bottom-left to top-right (indices [0,2], [1,1], [2,0])
      
      const paylines = [
        // Middle row
        [newResults[0][1], newResults[1][1], newResults[2][1]],
        // Top row
        [newResults[0][0], newResults[1][0], newResults[2][0]],
        // Bottom row
        [newResults[0][2], newResults[1][2], newResults[2][2]],
        // Diagonal top-left to bottom-right
        [newResults[0][0], newResults[1][1], newResults[2][2]],
        // Diagonal bottom-left to top-right
        [newResults[0][2], newResults[1][1], newResults[2][0]]
      ];
      
      let totalWin = 0;
      const winningPaylines: number[] = [];
      
      paylines.forEach((line, index) => {
        // Check for 3 of a kind
        if (line[0] === line[1] && line[1] === line[2]) {
          const symbolValue = symbols[line[0]].value;
          const lineWin = bet * symbolValue;
          totalWin += lineWin;
          winningPaylines.push(index);
          
          // Special case for 3 coins (jackpot)
          if (line[0] === 4) { // Coin symbol index is 4
            if (!muted && jackpotSoundRef.current) {
              jackpotSoundRef.current.play();
            }
            
            toast({
              title: "🎉 JACKPOT! 🎉",
              description: `${lineWin}৳`,
              variant: "default",
              className: "bg-yellow-500 text-black font-bold text-xl"
            });
          }
        } 
        // Check for 2 cherries + any (index 0 is cherry)
        else if (line[0] === 0 && line[1] === 0) {
          const lineWin = bet * 5;
          totalWin += lineWin;
          winningPaylines.push(index);
        }
        // Check for any + 2 coins (index 4 is coin)
        else if (line[1] === 4 && line[2] === 4) {
          const lineWin = bet * 10;
          totalWin += lineWin;
          winningPaylines.push(index);
        }
      });
      
      if (totalWin > 0) {
        setWin(totalWin);
        setBalance(prev => prev + totalWin);
        setWinningLines(winningPaylines);
        
        if (!muted && winSoundRef.current) {
          winSoundRef.current.play();
        }
        
        toast({
          title: t('youWon'),
          description: `${totalWin}৳`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
      }
      
      setSpinning(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: ["0 0 4px rgba(255, 215, 0, 0.5)", "0 0 8px rgba(255, 215, 0, 0.8)", "0 0 4px rgba(255, 215, 0, 0.5)"],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              777 COINS
            </motion.h1>
            <motion.div 
              className="w-32 h-32 mx-auto mb-6 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-8 border-t-yellow-500 border-r-amber-500 border-b-yellow-600 border-l-amber-400 border-t-transparent"></div>
              <motion.div
                className="absolute inset-4 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img 
                  src="/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png" 
                  alt="Gold coin" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
            <motion.p 
              className="text-white text-lg font-medium"
              animate={{ 
                opacity: [1, 0.5, 1] 
              }}
              transition={{ 
                duration: 1.5, 
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto">
        <motion.div 
          className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 p-1 rounded-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded border-2 border-yellow-400 p-2 relative">
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
              className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 drop-shadow-lg py-2"
              animate={{ 
                textShadow: ["0 0 4px rgba(255,215,0,0.5)", "0 0 8px rgba(255,215,0,0.8)", "0 0 4px rgba(255,215,0,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              777 COINS
            </motion.h1>
            
            <div className="flex justify-center space-x-2 mt-1">
              {['7', '7', '7'].map((digit, index) => (
                <motion.span 
                  key={index}
                  className="bg-yellow-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl"
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 5px rgba(255, 215, 0, 0.5)", 
                      "0 0 10px rgba(255, 215, 0, 0.8)", 
                      "0 0 5px rgba(255, 215, 0, 0.5)"
                    ]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                >
                  {digit}
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
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Paytable Section - Hidden on mobile unless toggled */}
          <AnimatePresence>
            {showPaytable && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="col-span-1 md:col-span-3 bg-gradient-to-b from-amber-900/80 to-amber-800/80 p-4 rounded-xl border border-yellow-600 shadow-lg"
              >
                <h3 className="text-yellow-400 font-bold text-lg mb-2 text-center">Paytable</h3>
                <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-amber-900/30">
                  {paytable.map((item, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center border-b border-yellow-700/50 pb-1"
                    >
                      <span className="text-white text-sm">{item.combination}</span>
                      <span className="text-yellow-400 font-bold">{item.multiplier}x</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-2 border-t border-yellow-700">
                    <p className="text-amber-200 text-sm">Bet multiplied by line win. Max win 2500৳ per spin.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Game Area */}
          <div className={`col-span-1 ${showPaytable ? 'md:col-span-9' : 'md:col-span-12'}`}>
            {/* Slot Machine Display */}
            <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-6 rounded-3xl border-4 border-yellow-600 shadow-2xl relative overflow-hidden">
              {/* 3D effect for the slot machine */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30 rounded-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-20 rounded-3xl pointer-events-none" />
              
              {/* Slot Frame with Gold Decorations */}
              <div className="relative mb-4">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-yellow-600 rounded-b-lg border-2 border-yellow-400"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-6 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png" 
                    alt="Gold coin" 
                    className="h-10 w-10 object-contain" 
                  />
                </div>
              </div>
              
              {/* Reels Container */}
              <div className="flex justify-center space-x-4 p-6 bg-black bg-opacity-60 rounded-xl border-2 border-yellow-700 shadow-inner relative">
                {/* Gold decorative corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>
                
                {[0, 1, 2].map((reelIndex) => (
                  <motion.div
                    key={reelIndex}
                    className="relative w-24 h-60 bg-gray-800 rounded-md overflow-hidden border border-amber-600"
                    style={{ perspective: "1000px" }}
                  >
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]" />
                    
                    <motion.div
                      className="absolute inset-0 flex flex-col"
                      animate={
                        spinning ? {
                          y: [0, -300, 0],
                          transition: {
                            y: {
                              duration: 1.5 + (reelIndex * 0.3),
                              ease: [0.6, 0.05, 0.1, 0.9],
                            }
                          }
                        } : {}
                      }
                    >
                      {results.length > 0 ? (
                        <>
                          {[0, 1, 2, 3, 4].map((position) => (
                            <div
                              key={position}
                              className="w-full h-20 flex items-center justify-center p-2"
                            >
                              <motion.div 
                                className="relative w-full h-full flex items-center justify-center"
                                animate={
                                  winningLines.some(line => 
                                    (line === 0 && position === 1 && reelIndex < 3) || 
                                    (line === 1 && position === 0 && reelIndex < 3) ||
                                    (line === 2 && position === 2 && reelIndex < 3) ||
                                    (line === 3 && position === reelIndex && reelIndex < 3) ||
                                    (line === 4 && position === (2 - reelIndex) && reelIndex < 3)
                                  ) ? {
                                    scale: [1, 1.15, 1],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                  } : {}
                                }
                                transition={{ 
                                  duration: 0.8, 
                                  repeat: Infinity,
                                  repeatType: "reverse" 
                                }}
                              >
                                {/* Glow effect for winning symbols */}
                                {winningLines.some(line => 
                                  (line === 0 && position === 1 && reelIndex < 3) || 
                                  (line === 1 && position === 0 && reelIndex < 3) ||
                                  (line === 2 && position === 2 && reelIndex < 3) ||
                                  (line === 3 && position === reelIndex && reelIndex < 3) ||
                                  (line === 4 && position === (2 - reelIndex) && reelIndex < 3)
                                ) && (
                                  <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-md"></div>
                                )}
                                
                                <img
                                  src={symbols[results[reelIndex][position]].image}
                                  alt={symbols[results[reelIndex][position]].id}
                                  className="max-w-full max-h-full object-contain drop-shadow-lg"
                                />
                              </motion.div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {[0, 1, 2, 3, 4].map((position) => (
                            <div
                              key={position}
                              className="w-full h-20 flex items-center justify-center p-2"
                            >
                              <img
                                src={symbols[reels[reelIndex][position]].image}
                                alt={symbols[reelIndex].id}
                                className="max-w-full max-h-full object-contain drop-shadow-lg"
                              />
                            </div>
                          ))}
                        </>
                      )}
                    </motion.div>
                    
                    {/* Highlight line for middle row */}
                    <motion.div 
                      className="absolute top-1/2 left-0 right-0 h-[20px] border-t border-b border-yellow-400 transform -translate-y-1/2"
                      animate={{
                        opacity: winningLines.includes(0) ? [0.2, 0.6, 0.2] : 0.1,
                        borderColor: winningLines.includes(0) ? ["rgba(234, 179, 8, 0.4)", "rgba(234, 179, 8, 0.8)", "rgba(234, 179, 8, 0.4)"] : "rgba(234, 179, 8, 0.2)",
                      }}
                      transition={{
                        duration: 1, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                    />
                    
                    {/* Diagonal lines */}
                    {reelIndex === 1 && (
                      <>
                        {/* Top line */}
                        <motion.div 
                          className="absolute top-[20px] left-0 right-0 h-[20px] border-t border-b border-blue-400"
                          animate={{
                            opacity: winningLines.includes(1) ? [0.2, 0.6, 0.2] : 0.1,
                            borderColor: winningLines.includes(1) ? ["rgba(96, 165, 250, 0.4)", "rgba(96, 165, 250, 0.8)", "rgba(96, 165, 250, 0.4)"] : "rgba(96, 165, 250, 0.2)",
                          }}
                          transition={{
                            duration: 1, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        />
                        
                        {/* Bottom line */}
                        <motion.div 
                          className="absolute bottom-[20px] left-0 right-0 h-[20px] border-t border-b border-green-400"
                          animate={{
                            opacity: winningLines.includes(2) ? [0.2, 0.6, 0.2] : 0.1,
                            borderColor: winningLines.includes(2) ? ["rgba(74, 222, 128, 0.4)", "rgba(74, 222, 128, 0.8)", "rgba(74, 222, 128, 0.4)"] : "rgba(74, 222, 128, 0.2)",
                          }}
                          transition={{
                            duration: 1, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Win Display */}
              {win > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [-10, 5, 0]
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 rounded-xl p-4 z-20 text-center border-2 border-yellow-500"
                >
                  <motion.div 
                    className="text-yellow-400 font-bold text-xl md:text-2xl mb-1"
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
                    className="text-amber-400 font-bold text-3xl md:text-4xl"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 5px rgba(245, 158, 11, 0.5)", 
                        "0 0 20px rgba(245, 158, 11, 0.8)", 
                        "0 0 5px rgba(245, 158, 11, 0.5)"
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
            </div>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="bg-gradient-to-b from-amber-900/90 to-amber-950/90 p-4 rounded-xl border border-yellow-700 shadow-inner backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-amber-950 h-12 w-12 rounded-full border-amber-700"
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-white" />}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-amber-950 h-12 w-12 rounded-full border-amber-700"
                  onClick={() => setShowPaytable(!showPaytable)}
                >
                  {showPaytable ? (
                    <ArrowDown className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <ArrowUp className="h-5 w-5 text-yellow-400" /> 
                  )}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-amber-950 h-12 w-12 rounded-full border-amber-700"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-5 w-5 text-gray-400" />
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-5 mb-4 md:mb-0">
              <div className="text-white">
                <div className="text-xs text-gray-300">{t('bet')}</div>
                <div className="flex items-center">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-300" 
                      onClick={() => changeBet(-5)}
                      disabled={bet <= 5 || spinning}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.span 
                    className="text-yellow-400 font-bold w-16 text-center"
                    animate={
                      spinning ? {} : { 
                        scale: [1, 1.05, 1],
                        textShadow: [
                          "0 0 1px rgba(255, 215, 0, 0.5)", 
                          "0 0 4px rgba(255, 215, 0, 0.8)", 
                          "0 0 1px rgba(255, 215, 0, 0.5)"
                        ]
                      }
                    }
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    {bet}৳
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-300" 
                      onClick={() => changeBet(5)}
                      disabled={bet >= 500 || spinning}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`bg-gradient-to-r ${
                    spinning 
                      ? 'from-gray-600 to-gray-700' 
                      : 'from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800'
                  } text-white font-bold rounded-full h-14 w-28 shadow-lg`}
                  disabled={spinning || balance < bet}
                  onClick={handleSpin}
                >
                  {spinning ? (
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  ) : (
                    <Play className="h-6 w-6 ml-1 mr-2" />
                  )}
                  Spin
                </Button>
              </motion.div>
              
              <div className="text-white">
                <div className="text-xs text-gray-300">{t('balance')}</div>
                <motion.div 
                  className="text-yellow-400 font-bold"
                  animate={
                    spinning ? {} : { 
                      scale: [1, 1.02, 1],
                      textShadow: [
                        "0 0 1px rgba(255, 215, 0, 0.5)", 
                        "0 0 4px rgba(255, 215, 0, 0.8)", 
                        "0 0 1px rgba(255, 215, 0, 0.5)"
                      ]
                    }
                  }
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {balance.toFixed(2)}৳
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoinsGame;
