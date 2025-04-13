
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Play, RefreshCw, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Generate wheel segments
const generateWheelSegments = () => {
  return [
    { value: 1, multiplier: 1 },
    { value: 2, multiplier: 1 },
    { value: 5, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 2, multiplier: 1 },
    { value: 8, multiplier: 8 },
    { value: 1, multiplier: 1 },
    { value: 5, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 40, multiplier: 40 },
    { value: 2, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 2, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 10, multiplier: 10 },
    { value: 2, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 5, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 2, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 2, multiplier: 1 },
    { value: 1, multiplier: 1 },
    { value: 20, multiplier: 20 },
  ];
};

const getSegmentColor = (index) => {
  const colors = [
    'bg-purple-600', // Purple
    'bg-yellow-400', // Yellow
    'bg-orange-500', // Orange
    'bg-red-600',    // Red
    'bg-gray-300',   // Silver (for multiplier segments)
  ];
  
  // Special segments (multipliers)
  if ([5, 9, 14, 23].includes(index)) {
    return colors[4];
  }
  
  return colors[index % 4];
};

const MegaSpin = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [wheelSegments] = useState(generateWheelSegments());
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
    audioRef.current = new Audio('/placeholder.svg'); // Replace with actual spin sound
    winAudioRef.current = new Audio('/placeholder.svg'); // Replace with actual win sound
    
    return () => clearTimeout(timer);
  }, []);
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
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
    setBalance(prev => prev - bet);
    setWinnings(0);
    
    if (!muted && audioRef.current) {
      audioRef.current.play();
    }
    
    // Simulate wheel spinning
    if (wheelRef.current) {
      const spinDegrees = 1800 + Math.random() * 360; // Spin at least 5 times
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
      wheelRef.current.style.transform = `rotate(${spinDegrees}deg)`;
      
      // Calculate which segment will be at the top when wheel stops
      setTimeout(() => {
        const finalRotation = spinDegrees % 360;
        const segmentAngle = 360 / wheelSegments.length;
        const segmentIndex = Math.floor((360 - finalRotation) / segmentAngle) % wheelSegments.length;
        
        const winningSegment = wheelSegments[segmentIndex];
        setResult(winningSegment.value);
        
        // Calculate winnings
        const payout = bet * winningSegment.multiplier;
        setWinnings(payout);
        setBalance(prev => prev + payout);
        
        if (!muted && winAudioRef.current && payout > 0) {
          winAudioRef.current.play();
        }
        
        toast({
          title: t('youWon'),
          description: `${t('currency')}${payout}`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
        
        setTimeout(() => {
          setSpinning(false);
        }, 1000);
      }, 5000);
    }
  };
  
  const handleWheelClick = () => {
    if (!spinning) {
      handleSpin();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 mb-4"
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
              MEGA TILT SPIN
            </motion.h1>
            <motion.div 
              className="w-32 h-32 border-8 border-t-purple-500 border-r-pink-500 border-b-orange-500 border-l-yellow-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(168,85,247,0.5)", "0 0 20px rgba(168,85,247,0.8)", "0 0 0px rgba(168,85,247,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              onClick={() => setLoading(false)}
            >
              {t('continue')}
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <motion.div 
          className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-1 rounded-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded border-2 border-yellow-500 p-2 relative">
            <motion.h1 
              className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 drop-shadow-lg py-2"
              animate={{ 
                textShadow: ["0 0 4px rgba(255,255,255,0.5)", "0 0 8px rgba(255,255,255,0.8)", "0 0 4px rgba(255,255,255,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              MEGA TILT SPIN
            </motion.h1>
          </div>
        </motion.div>
        
        {/* Wheel Section */}
        <motion.div
          className="relative mx-auto max-w-2xl aspect-square"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Main Wheel */}
          <div 
            className="relative w-full h-full cursor-pointer"
            onClick={handleWheelClick}
          >
            {/* Outer ring with diamonds */}
            <div className="absolute inset-0 rounded-full border-8 border-yellow-300 bg-black z-10"></div>
            
            {/* Wheel segments */}
            <div 
              ref={wheelRef}
              className="absolute inset-[20px] rounded-full overflow-hidden z-20"
              style={{ 
                transformOrigin: 'center',
              }}
            >
              {wheelSegments.map((segment, index) => (
                <div 
                  key={index} 
                  className="absolute top-0 left-0 w-full h-full origin-bottom"
                  style={{ 
                    transform: `rotate(${index * (360 / wheelSegments.length)}deg)`,
                    clipPath: 'polygon(50% 0%, 50% 50%, 100% 50%, 50% 0%)',
                  }}
                >
                  <div 
                    className={`w-full h-full ${getSegmentColor(index)}`}
                  >
                    <div 
                      className="absolute top-[15%] left-1/2 -translate-x-1/2 rotate-180"
                      style={{ transform: `translateX(-50%) rotate(${180 - index * (360 / wheelSegments.length)}deg)` }}
                    >
                      <div className="bg-black rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {segment.multiplier > 1 ? `${segment.multiplier}x` : segment.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Center of wheel */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 flex items-center justify-center">
                <div className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400">
                  <div className="font-bold text-xl">MEGA</div>
                  <div className="font-bold text-2xl text-yellow-400">TILT</div>
                  <div className="font-bold text-xl">SPIN</div>
                </div>
              </div>
            </div>
            
            {/* Pointer/ticker at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-40">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-400"></div>
            </div>
          </div>
          
          {/* Result display */}
          {winnings > 0 && !spinning && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-8 py-4 rounded-xl shadow-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ["0 0 0px rgba(255,215,0,0)", "0 0 30px rgba(255,215,0,0.8)", "0 0 10px rgba(255,215,0,0.5)"]
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <span className="text-black font-bold text-2xl">WIN {t('currency')}{winnings}</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`bg-gradient-to-r ${
                    spinning 
                      ? 'from-gray-600 to-gray-700' 
                      : 'from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800'
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
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MegaSpin;
