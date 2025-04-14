import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Play, Star, ArrowRight, RefreshCw, Info, Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const symbols = [
  { id: 'cherry', image: '/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png', value: 5 },
  { id: 'lemon', image: '/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png', value: 3 },
  { id: 'orange', image: '/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png', value: 4 },
  { id: 'plum', image: '/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png', value: 4 },
  { id: 'coin', image: '/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png', value: 15 },
  { id: 'heart', image: '/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png', value: 2 },
  { id: 'club', image: '/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png', value: 2 },
  { id: 'spade', image: '/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png', value: 2 },
  { id: 'wild', image: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png', value: 15 },
];

const bettingOptions = [1, 2, 5, 10, 20, 50, 100];

const preloadImages = () => {
  symbols.forEach(symbol => {
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
    [0, 1, 2, 3, 4], 
    [1, 2, 3, 4, 0], 
    [2, 3, 4, 0, 1],
    [3, 4, 0, 1, 2],
    [4, 0, 1, 2, 3]
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(2);
  const [win, setWin] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lastWins, setLastWins] = useState<number[]>([]);
  const [reelSpeeds, setReelSpeeds] = useState<number[]>([]);
  const [betMultiplier, setBetMultiplier] = useState(1);
  
  const reelRefs = useRef<HTMLDivElement[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!preloaded) {
      preloadImages();
      setPreloaded(true);
    }
    
    setReelSpeeds([
      800 + Math.random() * 200,
      850 + Math.random() * 200,
      900 + Math.random() * 200,
      950 + Math.random() * 200,
      1000 + Math.random() * 200
    ]);
    
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
    
    updateUserBalance(user.balance - totalBet);
    setSpinning(true);
    setWin(0);
    
    if (!muted && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play error:", err));
    }
    
    const baseSpeeds = [1500, 1700, 1900, 2100, 2300];
    
    const newReels = reels.map((reel, reelIndex) => {
      return reel.map(() => Math.floor(Math.random() * symbols.length));
    });
    
    setReels(newReels);
    
    setTimeout(() => {
      const middleRow = newReels.map(reel => reel[2]);
      let winAmount = 0;
      
      const counts: {[key: number]: number} = {};
      middleRow.forEach(symbolIndex => {
        counts[symbolIndex] = (counts[symbolIndex] || 0) + 1;
      });
      
      let maxCount = 0;
      let maxValue = 0;
      Object.entries(counts).forEach(([symbolIndex, count]) => {
        if (count >= 3 && count > maxCount) {
          maxCount = count;
          maxValue = symbols[Number(symbolIndex)].value;
        }
      });
      
      if (maxCount >= 3) {
        winAmount = totalBet * maxValue * (maxCount - 2);
        
        if (user) {
          updateUserBalance(user.balance - totalBet + winAmount);
        }
        
        setWin(winAmount);
        setLastWins(prev => [winAmount, ...prev.slice(0, 4)]);
        
        if (!muted && winAudioRef.current) {
          winAudioRef.current.play().catch(err => console.error("Win audio play error:", err));
        }
        
        if (winAmount > totalBet * 10) {
          toast({
            title: "WOOOOOOO!",
            description: t('bigWin'),
            variant: "default",
            className: "bg-yellow-500 text-black font-bold"
          });
        } else {
          toast({
            title: t('youWon'),
            description: `${winAmount}৳`,
          });
        }
      } else {
        setLastWins(prev => [0, ...prev.slice(0, 4)]);
      }
      
      setSpinning(false);
    }, Math.max(...baseSpeeds) + 200);
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
              <motion.img
                src="/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png"
                alt="Orange"
                className="w-16 h-16 object-contain"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.img
                src="/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png"
                alt="Lemon"
                className="w-16 h-16 object-contain"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.img
                src="/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png"
                alt="Cherry"
                className="w-16 h-16 object-contain"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
            
            <p className="text-white mb-6 text-lg">Experience the thrill of our high-stakes slot machine with stunning graphics and incredible win potential!</p>
            
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
          
          <div className="flex justify-center space-x-1 bg-gray-200 bg-opacity-20 p-2 rounded-2xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
            
            <div className="absolute inset-0 border-8 border-gray-300/30 rounded-xl pointer-events-none" />
            
            {[0, 1, 2, 3, 4].map((reelIndex) => (
              <motion.div
                key={reelIndex}
                ref={(el) => el && (reelRefs.current[reelIndex] = el)}
                className="flex-1 relative bg-gray-300 rounded-lg overflow-hidden"
                style={{
                  height: "260px",
                  perspective: "1000px",
                  backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
                }}
              >
                <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20" />
                
                <div className="absolute inset-0 flex flex-col items-center">
                  {reels[reelIndex].map((symbolIndex, symbolPosition) => (
                    <motion.div
                      key={`${reelIndex}-${symbolPosition}`}
                      className="w-full h-[55px] flex items-center justify-center p-1"
                      animate={
                        spinning ? { 
                          y: [0, -500, 0],
                          transition: {
                            y: {
                              duration: reelSpeeds[reelIndex] / 1000,
                              ease: "easeInOut",
                              repeat: 5 + Math.floor(Math.random() * 3),
                              repeatType: "loop",
                            }
                          }
                        } : {}
                      }
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-md" />
                        
                        <motion.img
                          src={symbols[symbolIndex].image}
                          alt={symbols[symbolIndex].id}
                          className="max-w-full max-h-full object-contain z-10 drop-shadow-lg"
                          style={{ width: "40px", height: "40px" }}
                          animate={
                            !spinning ? {
                              rotate: [0, symbolIndex % 2 === 0 ? 5 : -5, 0],
                              scale: [1, 1.05, 1],
                              transition: {
                                duration: 2 + (symbolIndex * 0.5),
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: (reelIndex * 0.2) + (symbolPosition * 0.1)
                              }
                            } : {}
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {reelIndex === 2 && win > 0 && (
                  <motion.div 
                    className="absolute top-[105px] left-0 right-0 h-[50px] bg-yellow-400 bg-opacity-30 border-t-2 border-b-2 border-yellow-500"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      boxShadow: [
                        "0 0 5px rgba(255, 215, 0, 0.5)", 
                        "0 0 20px rgba(255, 215, 0, 0.8)", 
                        "0 0 5px rgba(255, 215, 0, 0.5)"
                      ]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-2 mb-4">
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
          
          {win > 0 && (
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
                WOOOOOOO!
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
        </div>
        
        <div className="bg-gray-900 bg-opacity-70 p-4 rounded-xl border border-gray-700 shadow-inner backdrop-blur-sm mb-4">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {bettingOptions.map(option => (
              <motion.button
                key={option}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm ${bet === option ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectBettingOption(option)}
              >
                {option}৳
              </motion.button>
            ))}
          </div>
          
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
                  >
                    x{mult}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
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
                  className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                  onClick={() => navigate('/')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-5 w-5 text-gray-400" />
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-5 mb-4 md:mb-0">
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('bet')}</div>
                <div className="flex items-center">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-400" 
                      onClick={() => changeBet(-1)}
                      disabled={bet <= 1 || spinning}
                    >
                      -
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
                    {t('currency')}{bet.toFixed(2)}
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-400" 
                      onClick={() => changeBet(1)}
                      disabled={bet >= 100 || spinning}
                    >
                      +
                    </Button>
                  </motion.div>
                </div>
                
                <div className="text-center text-xs text-emerald-400 mt-1">
                  Total: {(bet * betMultiplier).toFixed(2)}৳
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  className={`bg-gradient-to-r ${spinning ? 'from-gray-600 to-gray-700' : 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white font-bold rounded-full h-14 w-14 shadow-lg`}
                  disabled={spinning || !user || (user && user.balance < (bet * betMultiplier))}
                  onClick={handleSpin}
                >
                  {spinning ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
              </motion.div>
              
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('balance')}</div>
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
                  {t('currency')}{user ? user.balance.toFixed(2) : '0.00'}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          className="bg-gray-800/80 rounded-lg p-3 border border-purple-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-bold text-purple-300 mb-1 flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-400" />
            Win Patterns
          </h3>
          <p className="text-xs text-gray-300">Match 3 or more symbols on the middle row to win! Higher value symbols pay more.</p>
        </motion.div>
      </main>
      <Footer />
      
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Casino Win Spin Rules
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-300">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-1">How to Play</h3>
                <p className="text-sm">Select your bet amount and click SPIN. Match 3 or more identical symbols on the middle row to win!</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-1">Betting</h3>
                <p className="text-sm">Choose your bet amount and multiplier. Higher bets mean bigger potential wins!</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-1">Symbol Values</h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {symbols.map(symbol => (
                    <div key={symbol.id} className="bg-gray-800 p-2 rounded flex items-center">
                      <img src={symbol.image} alt={symbol.id} className="w-8 h-8 mr-2" />
                      <span className="text-yellow-400 font-mono">{symbol.value}x</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-1">Winnings</h3>
                <p className="text-sm">Your win is calculated as: Bet × Symbol Value × (Number of Matching Symbols - 2)</p>
                <p className="text-xs text-gray-400 mt-1">Example: Bet 10 × Wild Value 15 × (3 matching - 2) = 150</p>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpinGame;
