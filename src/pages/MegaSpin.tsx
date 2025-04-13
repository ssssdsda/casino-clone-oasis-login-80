
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Play, RefreshCw, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Generate numbers for the board
const generateBoardNumbers = () => {
  const numbers: number[] = [];
  for (let i = 1; i <= 36; i++) {
    numbers.push(i);
  }
  numbers.push(0); // Add zero
  return numbers;
};

const getNumberColor = (num: number) => {
  if (num === 0) return 'bg-green-600';
  if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)) {
    return 'bg-red-600';
  }
  return 'bg-black';
};

const MegaSpin = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [boardNumbers] = useState(generateBoardNumbers());
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [bet, setBet] = useState(1);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [muted, setMuted] = useState(true);
  const [winnings, setWinnings] = useState(0);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Show loading for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Create audio elements
    audioRef.current = new Audio('/public/placeholder.svg'); // Replace with actual spin sound
    winAudioRef.current = new Audio('/public/placeholder.svg'); // Replace with actual win sound
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleNumberSelection = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };
  
  const handleSpin = () => {
    if (spinning || selectedNumbers.length === 0) return;
    
    const totalBet = bet * selectedNumbers.length;
    
    if (balance < totalBet) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    setSpinning(true);
    setBalance(prev => prev - totalBet);
    setWinnings(0);
    
    if (!muted && audioRef.current) {
      audioRef.current.play();
    }
    
    // Simulate wheel spinning
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.3, 1, 0.2, 1)';
      wheelRef.current.style.transform = `rotate(${1080 + Math.random() * 360}deg)`;
    }
    
    // Generate a random result
    setTimeout(() => {
      const randomResult = Math.floor(Math.random() * 37); // 0-36
      setResult(randomResult);
      
      // Check if player won
      if (selectedNumbers.includes(randomResult)) {
        // Payout is 35:1 for single number
        const payout = bet * 35;
        setWinnings(payout);
        setBalance(prev => prev + payout);
        
        if (!muted && winAudioRef.current) {
          winAudioRef.current.play();
        }
        
        toast({
          title: t('youWon'),
          description: `${t('currency')}${payout}`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
      }
      
      setSpinning(false);
      
      // Reset wheel for next spin
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'none';
          wheelRef.current.style.transform = 'rotate(0deg)';
        }
      }, 1000);
      
    }, 4000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-950 to-blue-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 mb-4"
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
              Mega Spin
            </motion.h1>
            <motion.div 
              className="w-24 h-24 border-8 border-t-green-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-white text-lg"
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
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-blue-950 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <motion.div 
          className="bg-gradient-to-r from-blue-900 via-green-900 to-blue-900 p-1 rounded-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-800 to-green-800 rounded border-2 border-yellow-500 p-2 relative">
            <motion.h1 
              className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 drop-shadow-lg py-2"
              animate={{ 
                textShadow: ["0 0 4px rgba(255,255,255,0.5)", "0 0 8px rgba(255,255,255,0.8)", "0 0 4px rgba(255,255,255,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              Mega Spin
            </motion.h1>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wheel Section */}
          <motion.div
            className="relative bg-gradient-to-b from-blue-900 to-green-900 p-6 rounded-3xl border-4 border-blue-700 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative w-full aspect-square flex items-center justify-center">
              {/* Spinner wheel */}
              <div className="absolute w-full h-full rounded-full border-8 border-yellow-500 flex items-center justify-center overflow-hidden">
                <motion.div 
                  ref={wheelRef}
                  className="absolute w-full h-full"
                >
                  {/* Wheel sections */}
                  {boardNumbers.map((num, idx) => (
                    <div 
                      key={idx} 
                      className="absolute top-0 left-1/2 -ml-6 -mt-5 w-12 h-1/2"
                      style={{ 
                        transform: `rotate(${idx * (360 / boardNumbers.length)}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <div 
                        className={`w-12 h-12 flex items-center justify-center ${getNumberColor(num)} text-white font-bold rounded-full`}
                      >
                        {num}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              
              {/* Center pin */}
              <div className="absolute w-6 h-6 bg-yellow-500 rounded-full z-10"></div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -ml-1 w-2 h-12 bg-yellow-500 z-20"></div>
              
              {/* Result display */}
              {result !== null && (
                <motion.div
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 ${getNumberColor(result)} rounded-full flex items-center justify-center z-30`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <span className="text-white text-2xl font-bold">{result}</span>
                </motion.div>
              )}
              
              {winnings > 0 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-40 bg-black bg-opacity-50 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: ["0 0 0px rgba(0,255,0,0)", "0 0 30px rgba(0,255,0,0.8)", "0 0 10px rgba(0,255,0,0.5)"]
                    }}
                    transition={{ duration: 0.6, repeat: 3 }}
                  >
                    <span className="text-white font-bold text-2xl">WIN {t('currency')}{winnings}</span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Board Section */}
          <motion.div
            className="bg-gradient-to-b from-blue-900 to-green-900 p-6 rounded-3xl border-4 border-blue-700 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Select Numbers</h2>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {/* Zero */}
              <button
                className={`col-span-3 h-12 rounded-full ${
                  selectedNumbers.includes(0) 
                    ? 'bg-green-600 ring-2 ring-white'
                    : 'bg-green-700 hover:bg-green-600'
                } text-white font-bold transition-all`}
                onClick={() => toggleNumberSelection(0)}
                disabled={spinning}
              >
                0
              </button>
              
              {/* Numbers 1-36 */}
              {boardNumbers.slice(0, 36).map(num => (
                <button
                  key={num}
                  className={`h-12 rounded-full ${
                    selectedNumbers.includes(num) 
                      ? getNumberColor(num) + ' ring-2 ring-white' 
                      : getNumberColor(num).replace('600', '700') + ' hover:' + getNumberColor(num)
                  } text-white font-bold transition-all`}
                  onClick={() => toggleNumberSelection(num)}
                  disabled={spinning}
                >
                  {num}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="bg-gray-900 bg-opacity-70 p-4 rounded-xl border border-gray-700 shadow-inner backdrop-blur-sm mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
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
                    {t('currency')}{bet}
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-400" 
                      onClick={() => changeBet(1)}
                      disabled={bet >= 100 || spinning}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`bg-gradient-to-r ${
                    spinning || selectedNumbers.length === 0 
                      ? 'from-gray-600 to-gray-700' 
                      : 'from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800'
                  } text-white font-bold rounded-full h-14 w-28 shadow-lg`}
                  disabled={spinning || selectedNumbers.length === 0 || balance < bet * selectedNumbers.length}
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
                  {t('currency')}{balance.toFixed(2)}
                </motion.div>
              </div>
            </div>
            
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">Selected</div>
              <div className="text-white font-bold">{selectedNumbers.length} numbers</div>
              <div className="text-xs text-gray-400">Total Bet</div>
              <div className="text-yellow-400 font-bold">{t('currency')}{(bet * selectedNumbers.length).toFixed(2)}</div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MegaSpin;
